/**
 * Cabin — the glass greenhouse / canopy above the chassis.
 * Uses an extruded 2D shape for the sleek raked profile,
 * plus a dark roof frame for the pillar structure.
 */
import * as THREE from 'three';
import { extrudeShape } from '../utils/geometry.js';
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

    // Profile shape — trapezoidal raked canopy
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

    // Roof frame (dark pillars)
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.08, 1.62),
      darkPlastic
    );
    frame.position.set(0.05, D.rideHeight + 1.23, 0);
    this.group.add(frame);

    // A-pillar accents (chrome trim lines along windshield base)
    const chrome = matLib.get('chrome');
    [0.78, -0.78].forEach((z) => {
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.02, 0.02),
        chrome
      );
      trim.position.set(-0.2, D.rideHeight + 0.68, z);
      trim.rotation.z = 0.12;
      this.group.add(trim);
    });
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default Cabin;
