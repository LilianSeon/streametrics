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

type startTabCapturePayload = {
    streamer: string;
    game: string;
    language: string
}

const startTabCapture = async ({streamer, game, language}: startTabCapturePayload, _sender?: chrome.runtime.MessageSender) => {

    return new Promise((resolve, reject) => {
        chrome.tabCapture.capture({ audio: true, video: false }, async (stream) => {

        if (!stream) {
            console.error("Échec de capture audio");
            return;
        }

        const audioCtx = new AudioContext();
        await audioCtx.audioWorklet.addModule('./js/audioProcessor.js');

        const source = audioCtx.createMediaStreamSource(stream);

        const workletNode = new AudioWorkletNode(audioCtx, 'custom-audio-processor');

        let audioBuffer: number[] = [];
        let sampleRate = 44100; // sera défini dynamiquement
        let bufferDurationSec = 20;
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
                formData.append('streamer', streamer);
                formData.append('game', game);
                formData.append('language', language);

                try {
                    const res = await fetch("http://127.0.0.1:5000/summarize/", {
                    method: "POST",
                    body: formData
                    });

                    const json = await res.json();
                    console.log("Transcription :", json);
                    
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            }
        };

        source.connect(workletNode);
        workletNode.connect(audioCtx.destination);
        source.connect(audioCtx.destination);
    
    });
    });
};

export { startTabCapture }