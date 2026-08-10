/**
 * geometry.js — reusable geometry factories and helpers.
 * Centralized so all car components share the same primitives
 * and disposal can be managed from one place.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function roundedBox(w, h, d, segments = 4, radius = 0.1) {
  const r = Math.min(radius, Math.min(w, h, d) / 2 - 0.001);
  return new RoundedBoxGeometry(w, h, d, segments, r);
}

export function wedge(length, height, depth, taper = 0.3) {
  // A tapered prism via CylinderGeometry with 4 sides
  const geo = new THREE.CylinderGeometry(taper, taper * 2, length, 4, 1);
  geo.rotateZ(Math.PI / 2);
  geo.scale(1, 1, depth / (taper * 2));
  return geo;
}

export function extrudeShape(shape, depth, bevel = 0.06) {
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
  });
}

/** Dispose all geometries inside a group recursively */
export function disposeGroup(group) {
  group.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
    }
  });
}

export default { roundedBox, wedge, extrudeShape, disposeGroup };
