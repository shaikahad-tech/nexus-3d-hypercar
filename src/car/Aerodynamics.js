/**
 * Aerodynamics — all aero appendages: front splitter, rear diffuser
 * with fins, rear wing with endplates, and side skirts.
 *
 * These are functional-looking elements that sell the "sporty" look.
 */
import * as THREE from 'three';
import { roundedBox } from '../utils/geometry.js';
import { CAR_DIMENSIONS as D } from '../config/carSpecs.js';
import matLib from '../materials/MaterialLibrary.js';

class Aerodynamics {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Aerodynamics';
    this._build();
  }

  _build() {
    const carbon = matLib.get('carbon');
    const darkPlastic = matLib.get('darkPlastic');
    const chrome = matLib.get('chrome');

    // ---- Front splitter ----
    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.06, 2.0),
      darkPlastic
    );
    splitter.position.set(-2.1, 0.28, 0);
    this.group.add(splitter);

    // Splitter side extensions
    [1, -1].forEach((z) => {
      const ext = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.05, 0.3),
        darkPlastic
      );
      ext.position.set(-1.95, 0.26, z * 0.92);
      this.group.add(ext);
    });

    // ---- Rear diffuser ----
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.35, 1.9),
      darkPlastic
    );
    diffuser.position.set(2.25, 0.4, 0);
    this.group.add(diffuser);

    // Diffuser fins
    for (let i = -2; i <= 2; i++) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.3, 0.03),
        chrome
      );
      fin.position.set(2.25, 0.42, i * 0.38);
      this.group.add(fin);
    }

    // ---- Rear wing ----
    const wingSupportL = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.4, 0.08),
      darkPlastic
    );
    wingSupportL.position.set(1.9, D.rideHeight + 0.8, 0.65);
    this.group.add(wingSupportL);

    const wingSupportR = wingSupportL.clone();
    wingSupportR.position.z = -0.65;
    this.group.add(wingSupportR);

    const wing = new THREE.Mesh(
      roundedBox(0.5, 0.05, 2.1, 2, 0.02),
      carbon
    );
    wing.position.set(2.0, D.rideHeight + 1.03, 0);
    wing.rotation.z = -0.12;
    wing.castShadow = true;
    this.group.add(wing);

    // Wing endplates
    [1, -1].forEach((z) => {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.22, 0.03),
        carbon
      );
      plate.position.set(2.0, D.rideHeight + 0.95, z * 1.05);
      this.group.add(plate);
    });

    // ---- Side skirts ----
    [1, -1].forEach((z) => {
      const skirt = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.08, 0.06),
        carbon
      );
      skirt.position.set(0, 0.3, z * 0.97);
      this.group.add(skirt);
    });

    // ---- Side air intakes (behind doors) with glow strips ----
    const underglow = matLib.get('underglow');
    this.intakeStrips = [];
    [1.0, -1.0].forEach((z) => {
      const intake = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.35, 0.08),
        darkPlastic
      );
      intake.position.set(1.1, D.rideHeight + 0.4, z);
      intake.rotation.y = z > 0 ? -0.08 : 0.08;
      this.group.add(intake);

      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.06, 0.03),
        underglow.clone()
      );
      strip.position.set(1.12, D.rideHeight + 0.4, z + (z > 0 ? 0.04 : -0.04));
      strip.rotation.y = intake.rotation.y;
      this.group.add(strip);
      this.intakeStrips.push(strip);
    });
  }

  setIntakeVisibility(v) {
    this.intakeStrips.forEach((s) => (s.visible = v));
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default Aerodynamics;
