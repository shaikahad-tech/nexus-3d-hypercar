/**
 * Cabin — the glass greenhouse / canopy above the chassis.
 * Uses an extruded 2D shape for the sleek raked profile,
 * plus a dark roof frame, A-pillars, B-pillars, interior
 * dashboard, seats, steering yoke, and display screens.
 *
 * The electrochromic glass canopy can transition between
 * transparent and tinted states.
 */
import * as THREE from 'three';
import { extrudeShape, roundedBox } from '../utils/geometry.js';
import { CAR_DIMENSIONS as D } from '../config/carSpecs.js';
import matLib from '../materials/MaterialLibrary.js';

class Cabin {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Cabin';
    this._build();
  }

  _build() {
    const glass = matLib.get('glass');
    const darkPlastic = matLib.get('darkPlastic');
    const chrome = matLib.get('chrome');
    const interior = matLib.get('interior');
    const alcantara = matLib.get('alcantara');
    const screen = matLib.get('screen');

    // ---- Profile shape — trapezoidal raked canopy ----
    const shape = new THREE.Shape();
    shape.moveTo(-1.1, 0);
    shape.lineTo(1.0, 0);
    shape.lineTo(0.6, 0.55);
    shape.lineTo(-0.7, 0.55);
    shape.closePath();

    const cabinGeo = extrudeShape(shape, 1.5, 0.06);
    cabinGeo.translate(0, 0, -0.75);

    const cabin = new THREE.Mesh(cabinGeo, glass);
    cabin.position.set(0.1, D.rideHeight + 0.65, 0);
    cabin.castShadow = true;
    this.group.add(cabin);
    this.glassMesh = cabin;

    // ---- Roof frame (dark pillars) ----
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.08, 1.62),
      darkPlastic
    );
    frame.position.set(0.05, D.rideHeight + 1.23, 0);
    this.group.add(frame);

    // ---- A-pillars (angled supports) ----
    [0.78, -0.78].forEach((z) => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.6, 0.04),
        darkPlastic
      );
      pillar.position.set(-0.7, D.rideHeight + 0.95, z);
      pillar.rotation.z = 0.35;
      this.group.add(pillar);

      // Chrome trim along A-pillar
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.02, 0.02),
        chrome
      );
      trim.position.set(-0.2, D.rideHeight + 0.68, z);
      trim.rotation.z = 0.12;
      this.group.add(trim);
    });

    // ---- B-pillars ----
    [0.78, -0.78].forEach((z) => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.5, 0.04),
        darkPlastic
      );
      pillar.position.set(0.4, D.rideHeight + 0.95, z);
      this.group.add(pillar);
    });

    // ---- Interior: Dashboard ----
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.15, 0.5),
      interior
    );
    dash.position.set(-0.3, D.rideHeight + 0.75, 0);
    this.group.add(dash);

    // Dashboard screen (driver display)
    const dashScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.12),
      screen
    );
    dashScreen.position.set(-0.5, D.rideHeight + 0.8, 0.2);
    dashScreen.rotation.x = -0.3;
    this.group.add(dashScreen);

    // Center infotainment screen
    const centerScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 0.15),
      screen
    );
    centerScreen.position.set(-0.1, D.rideHeight + 0.78, 0);
    centerScreen.rotation.x = -0.2;
    this.group.add(centerScreen);

    // ---- Interior: Seats ----
    [-0.35, 0.35].forEach((z) => {
      // Seat base
      const seatBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.1, 0.4),
        alcantara
      );
      seatBase.position.set(0.1, D.rideHeight + 0.55, z);
      this.group.add(seatBase);

      // Seat back
      const seatBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.4, 0.4),
        alcantara
      );
      seatBack.position.set(-0.1, D.rideHeight + 0.75, z);
      seatBack.rotation.z = 0.15;
      this.group.add(seatBack);

      // Seat side bolsters
      [-1, 1].forEach((side) => {
        const bolster = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, 0.05),
          alcantara
        );
        bolster.position.set(0.08, D.rideHeight + 0.72, z + side * 0.18);
        this.group.add(bolster);
      });
    });

    // ---- Interior: Steering yoke ----
    const yokeCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16),
      darkPlastic
    );
    yokeCenter.position.set(-0.3, D.rideHeight + 0.75, 0.35);
    yokeCenter.rotation.x = Math.PI / 2;
    this.group.add(yokeCenter);

    // Yoke arms (rectangular steering)
    [0, 0.5, 1.0, 1.5].forEach((angle) => {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.02, 0.03),
        darkPlastic
      );
      arm.position.set(-0.3, D.rideHeight + 0.75, 0.35);
      arm.rotation.y = angle * Math.PI / 2;
      arm.translateX(0.11);
      this.group.add(arm);
    });

    // ---- Interior: Center console ----
    const console = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.3),
      interior
    );
    console.position.set(-0.1, D.rideHeight + 0.6, 0);
    this.group.add(console);

    // ---- Rearview mirror ----
    const rearMirror = new THREE.Mesh(
      roundedBox(0.12, 0.04, 0.02, 2, 0.01),
      darkPlastic
    );
    rearMirror.position.set(-0.5, D.rideHeight + 1.15, 0);
    this.group.add(rearMirror);

    // ---- Roof liner ----
    const liner = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.02, 1.4),
      interior
    );
    liner.position.set(0, D.rideHeight + 1.2, 0);
    this.group.add(liner);
  }

  /** Transition glass opacity (electrochromic tinting) */
  setGlassTint(tint) {
    if (this.glassMesh) {
      this.glassMesh.material.opacity = 0.65 * (1 - tint) + 0.15 * tint;
      this.glassMesh.material.transmission = 0.6 * (1 - tint) + 0.1 * tint;
      this.glassMesh.material.needsUpdate = true;
    }
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default Cabin;
