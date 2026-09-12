// Realistic procedural audio engine using Web Audio API for heavy trucks
class TruckAudioService {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isRunning: boolean = false;
  private soundEnabled: boolean = true;
  private masterGain: GainNode | null = null;
  private reverseInterval: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.isRunning) {
      this.stopEngine();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  // Start heavy diesel engine rumble
  public startEngine() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isRunning) return;

      // Low rumble oscillator (diesel engine cylinder firing)
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime); // 45 Hz diesel rumble

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start();
      this.isRunning = true;
    } catch {
      // Audio context might require user interaction first
    }
  }

  // Update engine sound based on throttle (0 - 1) and gear / speed (RPM)
  public updateEngineRpm(rpmRatio: number, isAccelerating: boolean) {
    if (!this.isRunning || !this.ctx || !this.engineOsc || !this.engineFilter || !this.engineGain) return;
    const clampedRatio = Math.max(0, Math.min(1, rpmRatio));
    const targetFreq = 42 + clampedRatio * 90; // 42Hz idle to 132Hz max rpm
    const targetCutoff = 130 + clampedRatio * 320;
    const targetGain = isAccelerating ? 0.35 + clampedRatio * 0.15 : 0.22;

    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    this.engineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.1);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.1);
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {}
      this.engineOsc = null;
    }
    this.isRunning = false;
    this.stopReverseBeep();
  }

  // Air brake discharge hiss (iconic pneumatic truck sound)
  public playAirBrakeHiss() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.42);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
    } catch {}
  }

  // Jake brake (compression release engine retarder)
  public playJakeBrake() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(70, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch {}
  }

  // Powerful Philippine truck air horn (dual-trumpet harmonic: 195Hz & 245Hz)
  public playHorn(hornType: 'nautical' | 'dual-air' | 'pinoy-melodic' = 'dual-air') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.6;

      const freqs = hornType === 'nautical' 
        ? [150, 190] 
        : hornType === 'pinoy-melodic' 
        ? [220, 277, 330] 
        : [196, 246];

      freqs.forEach(f => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.setTargetAtTime(0.001, now + duration - 0.1, 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {}
  }

  // Reverse gear beeper
  public startReverseBeep() {
    if (!this.soundEnabled || this.reverseInterval) return;
    this.initContext();
    
    const beep = () => {
      if (!this.ctx || !this.masterGain || !this.soundEnabled) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1050, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
      } catch {}
    };

    beep();
    this.reverseInterval = setInterval(beep, 800);
  }

  public stopReverseBeep() {
    if (this.reverseInterval) {
      clearInterval(this.reverseInterval);
      this.reverseInterval = null;
    }
  }

  // UI / Mechanic tool clicks
  public playWrenchClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  // Success celebration chime
  public playSuccessChime() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.09);
      osc.stop(this.ctx.currentTime + idx * 0.09 + 0.45);
    });
  }
}

export const truckAudio = new TruckAudioService();
