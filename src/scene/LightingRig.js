/**
 * LightingRig — cinematic 4-point studio lighting.
 * Key (directional, shadow-casting), Rim (cyan backlight),
 * Fill (warm accent), and overhead Spot for a dramatic pool.
 */
import * as THREE from 'three';

class LightingRig {
  constructor(scene) {
    this.scene = scene;
    this.lights = {};
    this._build();
  }

  _build() {
    // Hemisphere ambient
    this.lights.hemi = new THREE.HemisphereLight(0x4a5a7a, 0x0a0c10, 0.55);
    this.scene.add(this.lights.hemi);

    // Key light — main directional with shadows
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(8, 12, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    key.shadow.bias = -0.0003;
    key.shadow.radius = 4;
    this.lights.key = key;
    this.scene.add(key);

    // Rim light — cyan backlight for edge separation
    const rim = new THREE.DirectionalLight(0x00d9ff, 1.6);
    rim.position.set(-7, 5, -8);
    this.lights.rim = rim;
    this.scene.add(rim);

    // Fill light — warm red bounce
    const fill = new THREE.DirectionalLight(0xff3d2e, 0.7);
    fill.position.set(-4, 3, 8);
    this.lights.fill = fill;
    this.scene.add(fill);

    // Overhead spot — dramatic pool of light
    const spot = new THREE.SpotLight(0xffffff, 120, 30, Math.PI * 0.22, 0.5, 1.2);
    spot.position.set(0, 14, 0);
    spot.target.position.set(0, 0, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    this.lights.spot = spot;
    this.scene.add(spot);
    this.scene.add(spot.target);
  }

  setKeyIntensity(v) { this.lights.key.intensity = v; }
  setRimIntensity(v) { this.lights.rim.intensity = v; }
  setSpotIntensity(v) { this.lights.spot.intensity = v; }

  dispose() {
    Object.values(this.lights).forEach((l) => {
      this.scene.remove(l);
      if (l.target) this.scene.remove(l.target);
    });
  }
}

export default LightingRig;
