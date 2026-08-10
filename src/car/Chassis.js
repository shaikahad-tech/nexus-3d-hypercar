/**
 * Chassis — main body panels of the car.
 * Composed of lower body, mid section, hood wedge, front nose,
 * rear deck, door panels, side mirrors, door handles, and
 * front grille mesh. Each panel is a separate mesh so materials
 * can be swapped independently if needed.
 *
 * Reads dimensions from the active vehicle variant config.
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
    const darkPlastic = matLib.get('darkPlastic');
    const chrome = matLib.get('chrome');
    const dims = D;

    // ---- Lower body — wide, low, aggressive ----
    const lower = new THREE.Mesh(
      roundedBox(dims.length, dims.bodyHeight, dims.width, 6, 0.18),
      paint
    );
    lower.position.y = dims.rideHeight;
    lower.castShadow = true;
    lower.receiveShadow = true;
    this.group.add(lower);

    // ---- Mid section — haunches ----
    const mid = new THREE.Mesh(
      roundedBox(dims.length - 0.8, 0.55, dims.width - 0.1, 6, 0.22),
      paint
    );
    mid.position.y = dims.rideHeight + 0.4;
    mid.castShadow = true;
    this.group.add(mid);

    // ---- Hood — sloping wedge ----
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.12, 1.75),
      paint
    );
    hood.position.set(-1.55, dims.rideHeight + 0.5, 0);
    hood.rotation.z = 0.03;
    hood.castShadow = true;
    this.group.add(hood);

    // Hood power bulge (raised center line)
    const bulge = new THREE.Mesh(
      roundedBox(1.2, 0.05, 0.4, 3, 0.03),
      paint
    );
    bulge.position.set(-1.55, dims.rideHeight + 0.57, 0);
    this.group.add(bulge);

    // ---- Front nose — pointed wedge ----
    const nose = new THREE.Mesh(wedge(0.9, 0.35, 2.5, 0.08), paint);
    nose.position.set(-2.35, dims.rideHeight + 0.07, 0);
    nose.rotation.z = Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.castShadow = true;
    this.group.add(nose);

    // ---- Rear deck — raised spoiler mount ----
    const rearDeck = new THREE.Mesh(
      roundedBox(1.3, 0.4, 1.85, 4, 0.15),
      paint
    );
    rearDeck.position.set(1.65, dims.rideHeight + 0.45, 0);
    rearDeck.castShadow = true;
    this.group.add(rearDeck);

    // ---- Door panels (recessed) ----
    [1, -1].forEach((z) => {
      const door = new THREE.Mesh(
        roundedBox(1.8, 0.45, 0.04, 3, 0.05),
        paint
      );
      door.position.set(0.2, dims.rideHeight + 0.15, z * 0.95);
      this.group.add(door);

      // Door handle (chrome accent)
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.03, 0.02),
        chrome
      );
      handle.position.set(0.3, dims.rideHeight + 0.35, z * 0.975);
      this.group.add(handle);
    });

    // ---- Side mirrors ----
    [1, -1].forEach((z) => {
      const mirrorArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.02, 0.1),
        darkPlastic
      );
      mirrorArm.position.set(-0.5, dims.rideHeight + 0.55, z * 0.98);
      this.group.add(mirrorArm);

      const mirrorHousing = new THREE.Mesh(
        roundedBox(0.12, 0.08, 0.06, 2, 0.03),
        paint
      );
      mirrorHousing.position.set(-0.5, dims.rideHeight + 0.55, z * 1.05);
      this.group.add(mirrorHousing);

      // Mirror glass
      const mirrorGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, 0.05),
        chrome
      );
      mirrorGlass.position.set(-0.5, dims.rideHeight + 0.55, z * 1.09);
      mirrorGlass.rotation.y = z > 0 ? Math.PI / 2 : -Math.PI / 2;
      this.group.add(mirrorGlass);
    });

    // ---- Door seam lines ----
    [1, -1].forEach((z) => {
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.01, 0.01),
        darkPlastic
      );
      seam.position.set(0, dims.rideHeight + 0.3, z * 0.96);
      this.group.add(seam);
    });

    // ---- Front grille ----
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.25, 1.4),
      darkPlastic
    );
    grille.position.set(-2.3, dims.rideHeight + 0.1, 0);
    this.group.add(grille);

    // Grille mesh pattern (horizontal slats)
    for (let i = 0; i < 5; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.02, 1.3),
        chrome
      );
      slat.position.set(-2.33, dims.rideHeight + 0.02 + i * 0.05, 0);
      this.group.add(slat);
    }

    // ---- Front fender vents ----
    [1, -1].forEach((z) => {
      const vent = new THREE.Mesh(
        roundedBox(0.3, 0.08, 0.02, 2, 0.02),
        darkPlastic
      );
      vent.position.set(-1.3, dims.rideHeight + 0.45, z * 0.96);
      vent.rotation.z = 0.15;
      this.group.add(vent);
    });

    // ---- Rear engine cover vents ----
    [1, -1].forEach((z) => {
      for (let i = 0; i < 3; i++) {
        const vent = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.02, 0.15),
          darkPlastic
        );
        vent.position.set(1.6 + i * 0.08, dims.rideHeight + 0.7, z * 0.4);
        this.group.add(vent);
      }
    });
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default Chassis;
