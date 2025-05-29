let audioStream: MediaStream | undefined;

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


chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'startRecording') {
    console.log('startRecording', message)
    startRecording(message);
  } else if(message.action === "stopRecording") {
    stopRecording();
  }
});

const stopRecording = () => {
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
  }
};

const startRecording = async (message: any) => {
    const { streamerName, streamerGame, streamTitle, language, streamId }: { streamerName: string, streamerGame: string, streamTitle: string, language: string, streamId: number } = message.payload;
      
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
      //const bars: number[] = [];
      //let barsAttributes: any[] = [];
      const lastHeights = new Array(barCount).fill(2);
      const eqGains = [1, 1.5, 2.5]; // Custom gain per band
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);


      /**
       * Linearly interpolate between a and b.
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
        analyser.getByteFrequencyData(dataArray);

        const barsAttributes = [];

        for (let i = 0; i < barCount; i++) {
          const start = Math.floor(i * bufferLength / barCount);
          const end = Math.floor((i + 1) * bufferLength / barCount);
          let sum = 0;
          for (let j = start; j < end; j++) {
            sum += dataArray[j];
          }
          const avg = sum / (end - start);
          const gain = eqGains[i];
          const scaled = Math.min(avg * gain, 255);
          const scale = scaled / 255;

          // 30x20 SVG reference frame
          const targetHeight = 2 + scale * 15; // max 16px height
          const height = lerp(lastHeights[i], targetHeight, 0.3);
          lastHeights[i] = height;

          const y = 10 - height / 2;

          barsAttributes.push({ y: y.toFixed(2), height: height.toFixed(2) });
        }

        chrome.runtime.sendMessage({ action: 'drawAudioBars', payload: barsAttributes });
      };

      setInterval(sendVisualizerBars, 100);
    

      const workletNode = new AudioWorkletNode(audioCtx, 'custom-audio-processor');

      let audioBuffer: number[] = [];
      let sampleRate = 44100; // sera défini dynamiquement
      let bufferDurationSec = 70;
      let maxSamples = bufferDurationSec * sampleRate;

      workletNode.port.onmessage = async (event) => {
        const chunk = event.data;

        if (!sampleRate) {
          sampleRate = audioCtx.sampleRate;
          maxSamples = bufferDurationSec * sampleRate;
        }

        audioBuffer.push(...chunk); // accumulate samples

        if (audioBuffer.length >= maxSamples) {
          // 1. Extraire 30s de données
          const chunkToSend = audioBuffer.slice(0, maxSamples);
          audioBuffer = audioBuffer.slice(maxSamples); // garde le reste si trop

          // 2. Convertir en WAV
          const wavBlob = encodeWAV(Float32Array.from(chunkToSend), sampleRate);

          // 3. Envoi à Flask
          const formData = new FormData();
          formData.append("audio", wavBlob, "chunk.wav");
          formData.append('streamer', streamerName);
          formData.append('game', streamerGame);
          formData.append('title', streamTitle);
          formData.append('language', language);
          formData.append('time', new Date().getTime().toString());

          try {
            const res = await fetch("http://127.0.0.1:5000/summarize/", { //188.245.179.58
              method: "POST",
              body: formData
            });

            const json = await res.json();
            //console.log("Transcription :", json);
             if(json.summary != '') chrome.runtime.sendMessage({ action: 'summarizeReady', payload: { summary: json.summary, time: json.time } });

          } catch (err) {
            console.error("Erreur lors de l'envoi :", err);
          }
        }
      };

      source.connect(workletNode);
      workletNode.connect(audioCtx.destination);
      source.connect(audioCtx.destination);
  }