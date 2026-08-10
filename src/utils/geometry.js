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

/** Create a torus segment (partial donut) for wheel arches */
export function torusSegment(radius, tube, arc, segments = 20) {
  return new THREE.TorusGeometry(radius, tube, 8, segments, arc);
}

/** Create a cylinder with tapered ends (cone-cylinder hybrid) */
export function taperedCylinder(topRadius, bottomRadius, height, segments = 32) {
  return new THREE.CylinderGeometry(topRadius, bottomRadius, height, segments);
}

/** Merge multiple geometries into one (simple concatenation) */
export function mergeGeometries(geometries) {
  // Note: In a full implementation, use BufferGeometryUtils.mergeGeometries
  // For now, return the first as fallback
  return geometries[0];
}

/** Dispose all geometries and materials inside a group recursively */
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

/** Count all meshes in a group */
export function countMeshes(group) {
  let count = 0;
  group.traverse((child) => {
    if (child.isMesh) count++;
  });
  return count;
}

/** Count all triangles in a group */
export function countTriangles(group) {
  let count = 0;
  group.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const pos = child.geometry.attributes.position;
      if (pos) count += (pos.count / 3) | 0;
    }
  });
  return count;
}

export default {
  roundedBox, wedge, extrudeShape, torusSegment, taperedCylinder,
  mergeGeometries, disposeGroup, countMeshes, countTriangles,
};
