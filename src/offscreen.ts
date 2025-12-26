let audioStream: MediaStream | undefined;
let interval: NodeJS.Timeout | undefined;
let workletNode: AudioWorkletNode | undefined;

let streamMetadata = {
  streamerName: '',
  streamerGame: '',
  streamTitle: '',
  language: '',
  tabId: 0
};

// Track active tasks to prevent multiple simultaneous processing
let activeTasks: Set<string> = new Set();
let isProcessing = false;
let isLastCurrentStepDone = false;


const encodeWAV = (samples: any, sampleRate = 44100) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: any, str: string) => {
        for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    // RIFF/WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true);  // PCM format
    view.setUint16(22, 1, true);  // Mono channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true);  // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
}

/**
 * Function to poll task status and send result when ready.
 * @param { string } taskId
 * @param { number } tabId
 */
const pollTaskStatus = async (taskId: string, tabId: number) => {
  // Add task to active set
  activeTasks.add(taskId);

  const maxAttempts = 120; // Max 2 minutes (120 * 1000ms = 2 min)
  let attempts = 0;

  const poll = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/summarize/status/${taskId}`);
      const statusData = await res.json();

      console.log(`Task ${taskId} status:`, statusData);

      // Send progress updates to frontend
      if (statusData.status === 'processing' || statusData.status === 'pending') {
        isLastCurrentStepDone = false;
        chrome.runtime.sendMessage({
          action: 'processingProgress',
          payload: {
            taskId,
            progress: statusData.progress || 0,
            message: statusData.message || 'Processing...',
            currentStep: statusData.current_step,
            tabId
          }
        });
      }

      // Task completed successfully
      if (statusData.status === 'done' && statusData.result) {
        activeTasks.delete(taskId);
        isProcessing = false;
        isLastCurrentStepDone = true;
        chrome.runtime.sendMessage({
          action: 'summarizeReady',
          payload: {
            summary: statusData.result.summary,
            text: statusData.result.text,
            time: statusData.result.time,
            streamerName: statusData.result.streamerName,
            currentStep: statusData.current_step,
            tabId
          }
        });
        return; // Stop polling
      }

      // Task failed
      if (statusData.status === 'error') {
        activeTasks.delete(taskId);
        isProcessing = false;
        isLastCurrentStepDone = false;
        console.error(`Task ${taskId} failed:`, statusData.error);
        chrome.runtime.sendMessage({
          action: 'summarizeError',
          payload: {
            error: statusData.error || 'Unknown error',
            message: statusData.message,
            currentStep: statusData.current_step,
            tabId
          }
        });
        return; // Stop polling
      }

      // Continue polling if not done and haven't exceeded max attempts
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 1000); // Poll every second
      } else {
        activeTasks.delete(taskId);
        isProcessing = false;
        isLastCurrentStepDone = false;
        console.error(`Task ${taskId} timeout after ${maxAttempts} attempts`);
        chrome.runtime.sendMessage({
          action: 'summarizeError',
          payload: {
            error: 'Task timeout',
            message: 'The task took too long to complete',
            currentStep: statusData.current_step,
            tabId: tabId
          }
        });
      }
    } catch (err) {
      activeTasks.delete(taskId);
      isProcessing = false;
      isLastCurrentStepDone = false;
      console.error(`Error polling task ${taskId}:`, err);
      chrome.runtime.sendMessage({
        action: 'summarizeError',
        payload: {
          error: 'Polling error',
          message: String(err),
          currentStep: 'error',
          tabId: tabId
        }
      });
    }
  };

  // Start polling
  poll();
};

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'startRecording') {
    console.log('startRecording', message)
    startRecording(message);
  } else if(message.action === "stopRecording") {
    stopRecording();
  } else if (message.action === 'updateMetadata') {
    updateMetadata(message.payload);
  }
});

const updateMetadata = ({ streamerName, streamerGame, streamTitle, language, tabId }: { streamerName?: string, streamerGame?: string, streamTitle?: string, language?: string, tabId?: number }) => {
  streamMetadata = {
  ...streamMetadata,
  ...(streamerName !== undefined && { streamerName }),
  ...(streamerGame !== undefined && { streamerGame }),
  ...(streamTitle !== undefined && { streamTitle }),
  ...(tabId !== undefined && { tabId }),
  ...(language !== undefined && { language })
  };
};

const stopRecording = () => {
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = undefined;
    // Reset audio bar Y and height
    chrome.runtime.sendMessage({ action: 'drawAudioBars', payload: { bars: [{ y: '9.00', height: '2.00' }, { y: '9.00', height: '2.00' }, { y: '9.00', height: '2.00' }] }});
  }

  if (interval) clearInterval(interval);
  if (workletNode) {
    workletNode.disconnect();
    workletNode.port.onmessage = null;
  }

  // Reset processing flags
  isProcessing = false;
  isLastCurrentStepDone = false;
  activeTasks.clear();
  console.log("Recording stopped - processing flags reset");
};

const startRecording = async (message: any) => {
    const { streamerName, streamerGame, streamTitle, language, streamId, tabId }: { streamerName: string, streamerGame: string, streamTitle: string, language: string, streamId: number, tabId: number } = message.payload;
    streamMetadata = { streamerName, streamerGame, streamTitle, language, tabId };

    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        //@ts-ignore
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
      video: {
        //@ts-ignore
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
    });

    if (!audioStream) {
      console.error("Échec de capture audio");
      return;
    }

    const audioCtx = new AudioContext();
    await audioCtx.audioWorklet.addModule('./js/audioProcessor.js');

    const source = audioCtx.createMediaStreamSource(audioStream);

    const barCount = 3;
    // Stores the previous height of each bar to allow smoothing with interpolation
    const lastHeights = new Array(barCount).fill(2);
    // Gain factors for each frequency band (acts like an equalizer)
    const eqGains = [1, 1.5, 2.5];
    // Create an analyser node to extract frequency data from the audio stream
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);


    /**
     * Linearly interpolates between two values.
     *
     * @param { number } a - Starting value.
     * @param { number } b - Target value.
     * @param { number } t - Interpolation factor between 0 (a) and 1 (b).
     * @returns { number } - The interpolated value.
    */
    const lerp = (a: number, b: number, t: number): number => {
      return a + (b - a) * t;
    };

    /**
     * Computes visual audio bars and sends to sidePanel.
     */
    const sendVisualizerBars = () => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray); // Populate frequency data

      const barsAttributes = [];
      let totalAmplitude = 0;

      for (let i = 0; i < barCount; i++) {
        // Determine the frequency range for this bar
        const start = Math.floor(i * bufferLength / barCount);
        const end = Math.floor((i + 1) * bufferLength / barCount);
        // Compute average amplitude within this range
        let sum = 0;
        for (let j = start; j < end; j++) {
          sum += dataArray[j];
        }
        const avg = sum / (end - start);
        // Apply custom gain and clamp value to [0, 255]
        const gain = eqGains[i];
        const scaled = Math.min(avg * gain, 255);
        const scale = scaled / 255;

        // Convert to height (SVG units: max ~17px), smooth with interpolation
        const targetHeight = 2 + scale * 15;
        const height = lerp(lastHeights[i], targetHeight, 0.3);
        lastHeights[i] = height;

        // Center the bar vertically in a 20px high SVG frame
        const y = 10 - height / 2;

        barsAttributes.push({ y: y.toFixed(2), height: height.toFixed(2) });
        totalAmplitude += scaled;
      }

      const averageAmplitude = totalAmplitude / barCount;


      // Send visual bar data to the extension's side panel
      chrome.runtime.sendMessage({ action: 'drawAudioBars', payload: { 
        bars: barsAttributes,
        pulse: averageAmplitude
      }});
    };

    interval = setInterval(sendVisualizerBars, 80);
    

    workletNode = new AudioWorkletNode(audioCtx, 'custom-audio-processor');

    let audioBuffer: number[] = [];
    let sampleRate = 44100; // sera défini dynamiquement
    let bufferDurationSec = 30; // 70
    let maxSamples = bufferDurationSec * sampleRate;

    workletNode.port.onmessage = async (event) => {
      const chunk = event.data;

      if (!sampleRate) {
        sampleRate = audioCtx.sampleRate;
        maxSamples = bufferDurationSec * sampleRate;
      }

      audioBuffer.push(...chunk); // accumulate samples

      if (audioBuffer.length >= maxSamples) {
        // Get 30sec data.
        const chunkToSend = audioBuffer.slice(0, maxSamples);
        audioBuffer = audioBuffer.slice(maxSamples); // garde le reste si trop

        // Converted in WAV
        const wavBlob = encodeWAV(Float32Array.from(chunkToSend), sampleRate);

        // Send to backend
        const formData = new FormData();
        formData.append("audio", wavBlob, "chunk.wav");
        formData.append('streamer', streamMetadata.streamerName);
        formData.append('game', streamMetadata.streamerGame);
        formData.append('title', streamMetadata.streamTitle);
        formData.append('language', streamMetadata.language);
        formData.append('time', new Date().getTime().toString());

        try {
          if (wavBlob.size > 0) {
            // Skip if already processing a task
            if (isProcessing) {
              console.log("Skipping audio chunk - already processing a task");
              return;
            }

            if (isLastCurrentStepDone) {
              chrome.runtime.sendMessage({
                action: 'processingProgress',
                payload: {
                  currentStep: 'listening',
                  tabId
                }
              });
            }

            // Mark as processing
            isProcessing = true;

            // Submit audio processing task
            const res = await fetch("http://127.0.0.1:5000/summarize/", {
              method: "POST",
              body: formData
            });

            const json = await res.json();
            console.log("Task submitted:", json);

            if (json?.task_id) {
              // Poll for task status
              pollTaskStatus(json.task_id, streamMetadata.tabId);
            } else {
              // If no task_id, reset processing flag
              isProcessing = false;
              isLastCurrentStepDone = false;
            }
          }
        } catch (err) {
          console.error("Erreur lors de l'envoi :", err);
          isProcessing = false; // Reset on error
          isLastCurrentStepDone = false;
        }
      }
    };

    source.connect(workletNode);
    workletNode.connect(audioCtx.destination);
    source.connect(audioCtx.destination);
}