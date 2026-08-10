/**
 * AudioEngine — procedural Web Audio API sound system.
 * Generates engine sounds, UI clicks, ambient drones, and
 * spatial audio effects without any external audio files.
 *
 * Uses oscillators + filters + gain envelopes to synthesize:
 * - Engine hum (frequency-modulated sawtooth)
 * - Tire/wind noise (filtered white noise)
 * - UI click sounds (sine blips)
 * - Ambient drone (low-frequency pad)
 * - Paint spray sound (noise burst)
 */
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.noiseBuffer = null;
    this.ambientGain = null;
    this.initialized = false;
    this._engineRPM = 0;
    this._targetRPM = 0;
    this._bindEvents();
  }

  init() {
    if (this.initialized) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this._createMaster();
      this._createNoiseBuffer();
      this._createEngine();
      this._createAmbient();
      this.initialized = true;
      bus.emit('audio:ready');
    } catch (e) {
      console.warn('[AudioEngine] failed to init:', e);
    }
  }

  _createMaster() {
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.3;
    this.master.connect(this.ctx.destination);
  }

  _createNoiseBuffer() {
    const length = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  _createEngine() {
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 200;
    this.engineFilter.Q.value = 8;

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 60;

    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'sawtooth';
    this.engineOsc2.frequency.value = 61;
    this.engineOsc2.detune.value = 5;

    this.engineSub = this.ctx.createOscillator();
    this.engineSub.type = 'sine';
    this.engineSub.frequency.value = 30;

    this.engineOsc.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineSub.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.master);

    this.engineOsc.start();
    this.engineOsc2.start();
    this.engineSub.start();
  }

  _createAmbient() {
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.05;

    const ambientOsc = this.ctx.createOscillator();
    ambientOsc.type = 'sine';
    ambientOsc.frequency.value = 55;

    const ambientOsc2 = this.ctx.createOscillator();
    ambientOsc2.type = 'sine';
    ambientOsc2.frequency.value = 82.5;

    const ambientFilter = this.ctx.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.value = 400;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientGain.gain);

    ambientOsc.connect(ambientFilter);
    ambientOsc2.connect(ambientFilter);
    ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.master);

    ambientOsc.start();
    ambientOsc2.start();
    lfo.start();
  }

  _bindEvents() {
    bus.on('audio:toggle', () => this.toggle());
    bus.on('audio:engineRPM', (rpm) => this.setEngineRPM(rpm));
    bus.on('audio:click', () => this.playClick());
    bus.on('audio:spray', () => this.playSpray());
    bus.on('state:change:audioEnabled', (v) => {
      if (v) { this.init(); this.setMasterVolume(0.3); }
      else { this.setMasterVolume(0); }
    });
  }

  toggle() {
    if (!this.initialized) { this.init(); return; }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
      state.set('audioEnabled', true);
    } else {
      this.ctx.suspend();
      state.set('audioEnabled', false);
    }
  }

  setMasterVolume(v) {
    if (this.master) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
    }
  }

  setEngineRPM(rpm) {
    this._targetRPM = rpm;
    if (!this.initialized || !this.engineOsc) return;

    const freq = 30 + (rpm / 9000) * 170;
    const filterFreq = 200 + (rpm / 9000) * 1500;

    this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(freq + 1, this.ctx.currentTime, 0.05);
    this.engineSub.frequency.setTargetAtTime(freq / 2, this.ctx.currentTime, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.05);

    const vol = 0.02 + (rpm / 9000) * 0.15;
    this.engineGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
  }

  playClick() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 0.001);
    gain.gain.setTargetAtTime(0, this.ctx.currentTime + 0.02, 0.05);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playSpray() {
    if (!this.initialized) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 2;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.1, this.ctx.currentTime, 0.01);
    gain.gain.setTargetAtTime(0, this.ctx.currentTime + 0.3, 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    noise.start();
    noise.stop(this.ctx.currentTime + 0.5);
  }

  playWhoosh() {
    if (!this.initialized) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.3);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.8);
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.05);
    gain.gain.setTargetAtTime(0, this.ctx.currentTime + 0.5, 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    noise.start();
    noise.stop(this.ctx.currentTime + 1.0);
  }

  update(dt, t) {
    if (!this.initialized) return;
    this._engineRPM += (this._targetRPM - this._engineRPM) * 0.1;
  }

  dispose() {
    if (!this.initialized) return;
    this.engineOsc?.stop();
    this.engineOsc2?.stop();
    this.engineSub?.stop();
    this.ctx.close();
    this.initialized = false;
  }
}

export const audio = new AudioEngine();
export default audio;
