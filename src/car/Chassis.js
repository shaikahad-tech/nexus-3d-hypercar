/**
 * Chassis — main body panels of the car.
 * Composed of lower body, mid section, hood wedge, front nose,
 * and rear deck. Each panel is a separate mesh so materials
 * can be swapped independently if needed.
 */
import * as THREE from 'three';
import { roundedBox, wedge, extrudeShape } from '../utils/geometry.js';
import { CAR_DIMENSIONS as D } from '../config/carSpecs.js';
import matLib from '../materials/MaterialLibrary.js';

class Chassis {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Chassis';
    this._build();
  }

  _build() {
    const paint = matLib.get('paint');
    const dims = D;

    // Lower body — wide, low, aggressive
    const lower = new THREE.Mesh(
      roundedBox(dims.length, dims.bodyHeight, dims.width, 6, 0.18),
      paint
    );
    lower.position.y = dims.rideHeight;
    lower.castShadow = true;
    lower.receiveShadow = true;
    this.group.add(lower);

    // Mid section — haunches
    const mid = new THREE.Mesh(
      roundedBox(dims.length - 0.8, 0.55, dims.width - 0.1, 6, 0.22),
      paint
    );
    mid.position.y = dims.rideHeight + 0.4;
    mid.castShadow = true;
    this.group.add(mid);

    // Hood — sloping wedge
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.12, 1.75),
      paint
    );
    hood.position.set(-1.55, dims.rideHeight + 0.5, 0);
    hood.rotation.z = 0.03;
    hood.castShadow = true;
    this.group.add(hood);

    // Front nose — pointed wedge (4-sided cylinder)
    const nose = new THREE.Mesh(wedge(0.9, 0.35, 2.5, 0.08), paint);
    nose.position.set(-2.35, dims.rideHeight + 0.07, 0);
    nose.rotation.z = Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.castShadow = true;
    this.group.add(nose);

    // Rear deck — raised spoiler mount
    const rearDeck = new THREE.Mesh(
      roundedBox(1.3, 0.4, 1.85, 4, 0.15),
      paint
    );
    rearDeck.position.set(1.65, dims.rideHeight + 0.45, 0);
    rearDeck.castShadow = true;
    this.group.add(rearDeck);

    // Door seam lines (subtle dark inset)
    const darkPlastic = matLib.get('darkPlastic');
    [1, -1].forEach((z) => {
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.01, 0.01),
        darkPlastic
      );
      seam.position.set(0, dims.rideHeight + 0.3, z * 0.96);
      this.group.add(seam);
    });

    // Front grille
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.25, 1.4),
      darkPlastic
    );
    grille.position.set(-2.3, dims.rideHeight + 0.1, 0);
    this.group.add(grille);
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default Chassis;
