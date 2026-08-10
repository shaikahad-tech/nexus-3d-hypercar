/**
 * PhysicsSimulator — lightweight vehicle physics simulation.
 * Simulates engine RPM, acceleration, braking, suspension
 * movement (pitch/roll), and tire slip for visual feedback.
 *
 * This is NOT a full physics engine — it's a visual simulation
 * that drives animations (wheel spin rate, brake light intensity,
 * body pitch/roll) to make the car feel alive.
 */
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';
import { lerp, clamp, smoothstep } from '../utils/math.js';
import { ACTIVE_VARIANT } from '../config/carSpecs.js';

class PhysicsSimulator {
  constructor() {
    this.enabled = true;
    this.mode = 'idle';

    this.rpm = 0;
    this.targetRPM = 800;
    this.speed = 0;
    this.targetSpeed = 0;

    this.pitch = 0;
    this.roll = 0;
    this.bounce = 0;
    this.targetPitch = 0;
    this.targetRoll = 0;
    this.targetBounce = 0;

    this.wheelSpinRate = 0.5;
    this.tireSlip = 0;
    this.brakingIntensity = 0;
    this.throttle = 0;
    this.targetThrottle = 0;
    this.targetBraking = 0;

    this._modeTimer = 0;
    this._modeDuration = 5.0;
    this._cycleIndex = 0;

    const specs = ACTIVE_VARIANT;
    this.maxRPM = specs.performance.rpm.redline;
    this.idleRPM = specs.performance.rpm.base;
    this.rpmVariance = specs.performance.rpm.variance;
    this.topSpeed = specs.performance.topSpeed.value;
    this.accelTime = specs.performance.accel.value;

    this._bindEvents();
  }

  _bindEvents() {
    bus.on('state:change:physicsEnabled', (v) => {
      this.enabled = v;
    });
    this.enabled = state.get('physicsEnabled');
  }

  setMode(mode) {
    this.mode = mode;
    this._modeTimer = 0;

    switch (mode) {
      case 'idle':
        this.targetRPM = this.idleRPM;
        this.targetSpeed = 0;
        this.targetThrottle = 0;
        this.targetPitch = 0;
        this.targetRoll = 0;
        this.targetBraking = 0;
        break;
      case 'accelerating':
        this.targetRPM = this.maxRPM * 0.85;
        this.targetSpeed = this.topSpeed * 0.6;
        this.targetThrottle = 1.0;
        this.targetPitch = -0.08;
        this.targetBraking = 0;
        break;
      case 'cruising':
        this.targetRPM = this.idleRPM * 1.5;
        this.targetSpeed = this.topSpeed * 0.3;
        this.targetThrottle = 0.4;
        this.targetPitch = 0;
        this.targetBraking = 0;
        break;
      case 'braking':
        this.targetRPM = this.idleRPM * 0.8;
        this.targetSpeed = 0;
        this.targetThrottle = 0;
        this.targetPitch = 0.06;
        this.targetBraking = 1.0;
        break;
      case 'cornering':
        this.targetRPM = this.idleRPM * 1.8;
        this.targetSpeed = this.topSpeed * 0.2;
        this.targetThrottle = 0.6;
        this.targetPitch = 0;
        this.targetRoll = 0.05;
        this.targetBraking = 0.2;
        break;
    }
  }

  update(dt, t) {
    if (!this.enabled) return;

    this._modeTimer += dt;
    if (this._modeTimer >= this._modeDuration) {
      this._modeTimer = 0;
      this._cycleIndex = (this._cycleIndex + 1) % 5;
      const modes = ['idle', 'accelerating', 'cruising', 'braking', 'cornering'];
      this.setMode(modes[this._cycleIndex]);
      this._modeDuration = 3 + Math.random() * 4;
    }

    const idleFluctuation = Math.sin(t * 8) * this.rpmVariance * 0.3;
    this.rpm += (this.targetRPM + idleFluctuation - this.rpm) * 0.05;

    this.speed += (this.targetSpeed - this.speed) * 0.02;

    this.pitch += (this.targetPitch - this.pitch) * 0.05;
    this.roll += (this.targetRoll - this.roll) * 0.05;

    const vibration = Math.sin(t * 30) * 0.003 * (this.rpm / this.maxRPM);
    this.bounce = vibration;

    const targetSpin = (this.speed / this.topSpeed) * 5.0 + 0.3;
    this.wheelSpinRate += (targetSpin - this.wheelSpinRate) * 0.05;

    if (this.mode === 'accelerating') {
      this.tireSlip = lerp(this.tireSlip, 0.8, 0.05);
    } else if (this.mode === 'cornering') {
      this.tireSlip = lerp(this.tireSlip, 0.4, 0.05);
    } else {
      this.tireSlip = lerp(this.tireSlip, 0, 0.05);
    }

    this.brakingIntensity = lerp(this.brakingIntensity, this.targetBraking || 0, 0.05);
    this.throttle += (this.targetThrottle - this.throttle) * 0.05;

    bus.emit('physics:rpm', this.rpm);
    bus.emit('physics:speed', this.speed);
    bus.emit('physics:suspension', {
      pitch: this.pitch,
      roll: this.roll,
      bounce: this.bounce,
    });
    bus.emit('physics:wheelSpin', this.wheelSpinRate);
    bus.emit('physics:braking', this.brakingIntensity);
    bus.emit('audio:engineRPM', this.rpm);
  }

  getPhysicsData() {
    return {
      rpm: this.rpm,
      speed: this.speed,
      pitch: this.pitch,
      roll: this.roll,
      bounce: this.bounce,
      wheelSpinRate: this.wheelSpinRate,
      braking: this.brakingIntensity,
      throttle: this.throttle,
      mode: this.mode,
    };
  }

  dispose() {
    // Nothing to clean up
  }
}

export default PhysicsSimulator;
