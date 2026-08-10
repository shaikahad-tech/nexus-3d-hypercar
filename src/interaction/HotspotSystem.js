/**
 * HotspotSystem — interactive info points on the car.
 * Creates clickable 3D markers at key car components. Clicking
 * a hotspot moves the camera to a detail view and shows
 * an info panel with specifications.
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';
import { HOTSPOTS } from '../config/hotspots.js';

class HotspotSystem {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.group = new THREE.Group();
    this.group.name = 'Hotspots';
    this.hotspots = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this._visible = false;
    this._build();
    this._bindEvents();
  }

  _build() {
    HOTSPOTS.forEach((cfg) => {
      const markerGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0xff3d2e,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(...cfg.position);
      marker.renderOrder = 999;
      marker.visible = this._visible;

      const ringGeo = new THREE.RingGeometry(0.1, 0.13, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff3d2e,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthTest: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(marker.position);
      ring.renderOrder = 998;
      ring.visible = this._visible;

      marker.userData.hotspot = cfg;

      this.group.add(marker);
      this.group.add(ring);
      this.hotspots.push({ marker, ring, config: cfg });
    });
  }

  _bindEvents() {
    this.domElement.addEventListener('click', this._onClick);

    bus.on('state:change:hotspotsVisible', (v) => {
      this.setVisible(v);
    });

    bus.on('close:overlays', () => {
      bus.emit('hotspot:hide');
    });
  }

  _onClick = (e) => {
    if (!this._visible) return;

    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const markers = this.hotspots.map(h => h.marker);
    const intersects = this.raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
      const hotspot = intersects[0].object.userData.hotspot;
      if (hotspot) {
        bus.emit('camera:preset', hotspot.cameraPreset);
        bus.emit('hotspot:show', hotspot);
        bus.emit('audio:click');
      }
    }
  };

  setVisible(v) {
    this._visible = v;
    this.hotspots.forEach(({ marker, ring }) => {
      marker.visible = v;
      ring.visible = v;
    });
  }

  update(dt, t) {
    if (!this._visible) return;

    this.hotspots.forEach(({ marker, ring }, i) => {
      const phase = t * 2 + i * 0.5;
      const scale = 1 + Math.sin(phase) * 0.2;
      marker.scale.setScalar(scale);
      marker.material.opacity = 0.6 + Math.sin(phase) * 0.3;

      const ringScale = 1 + Math.sin(phase) * 0.5 + 0.5;
      ring.scale.setScalar(ringScale);
      ring.material.opacity = 0.5 - Math.sin(phase) * 0.3;
      ring.lookAt(this.camera.position);
    });

    this.hotspots.forEach(({ marker }) => {
      marker.lookAt(this.camera.position);
    });
  }

  dispose() {
    this.domElement.removeEventListener('click', this._onClick);
    this.hotspots.forEach(({ marker, ring }) => {
      marker.geometry.dispose();
      marker.material.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
    });
  }
}

export default HotspotSystem;
