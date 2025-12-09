class CustomAudioProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
  }

  process(
    inputs: Float32Array[][],
    _outputs: Float32Array[][],
    _parameters: Record<string, Float32Array>
  ): boolean {
    const input = inputs[0];
    if (input.length > 0) {
      const audioData = input[0];
      this.port.postMessage(audioData);
    }
    return true;
  }
}

registerProcessor('custom-audio-processor', CustomAudioProcessor);

declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;

declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}
