# NEXUS 3D — Aether GT Hypercar

A production-grade, futuristic sports car showcase built with **Three.js** and a fully modular ES6 architecture. The car is modeled procedurally in code — no external 3D files — and rendered with cinematic studio lighting, post-processing bloom, and an interactive HUD.

---

## Quick Start

```bash
# Python (built into most systems)
python3 serve.py

# OR any static file server
npx serve .
```

Then open `http://localhost:8000` in your browser.

> **Note:** ES6 modules require serving over HTTP — opening `index.html` directly via `file://` will not work due to browser CORS restrictions on module imports.

---

## Architecture

The project is structured as a **layered, event-driven architecture**. No subsystem imports another directly — all cross-module communication flows through a central `EventBus`. This makes every component independently testable, swappable, and disposable.

```
src/
├── main.js                    # Application bootstrap — wires all subsystems
├── styles.css                 # Global design tokens + HUD styles
├── config/
│   └── carSpecs.js            # Single source of truth: specs, dimensions, paint colors
├── core/
│   ├── EventBus.js            # Lightweight pub/sub for decoupled communication
│   ├── StateManager.js        # Centralized reactive state with change notifications
│   └── AssetLoader.js         # Async resource loading (env maps, textures) with progress
├── scene/
│   ├── SceneManager.js        # Owns renderer, scene graph, camera, RAF loop
│   ├── LightingRig.js         # 4-point cinematic studio lighting (key/rim/fill/spot)
│   ├── Environment.js         # Procedural gradient environment map for reflections
│   ├── PostFX.js              # Bloom + SMAA post-processing pipeline
│   └── CameraDirector.js      # OrbitControls + cinematic camera presets + intro animation
├── car/
│   ├── CarBuilder.js          # Top-level assembly — composes all car components
│   ├── Chassis.js             # Body panels: lower body, mid, hood, nose, rear deck
│   ├── Cabin.js               # Glass canopy + roof frame + pillar accents
│   ├── Wheels.js              # 4-wheel assembly: tires, rims, brake discs, 5-spoke aero
│   ├── Aerodynamics.js        # Splitter, diffuser, wing, skirts, side intakes
│   └── CarLights.js           # Headlights (LED + point lights) + taillight bar
├── materials/
│   └── MaterialLibrary.js     # Centralized material factory + paint system
├── effects/
│   ├── ParticleSystem.js      # Floating ambient dust motes
│   ├── StudioFloor.js         # Reflective stage + glowing accent ring + grid
│   └── UnderglowFX.js         # Pulsing under-car glow plane (color-tracked to paint)
├── ui/
│   ├── HUD.js                 # Top bar, spec sheet panel, bottom performance strip
│   ├── Configurator.js        # Color swatches + toggle switches
│   └── PerformanceMeter.js    # Optional debug FPS/draw-call overlay (?debug=1)
└── utils/
    ├── geometry.js            # Reusable geometry factories + disposal helpers
    ├── math.js                # lerp, clamp, easing, mapRange, randomRange
    └── debug.js               # URL-param debug mode + logging
```

### Data Flow

```
User Interaction (click swatch / toggle)
        |
        v
StateManager.set('paint', {...})
        |
        v
EventBus.emit('state:change:paint')
        |
        +--> MaterialLibrary   --> updates MeshPhysicalMaterial
        +--> StudioFloor       --> updates ring color
        +--> UnderglowFX      --> updates glow color
        +--> Aerodynamics      --> updates intake strip color
```

The car's `update(dt, t)` method is called each frame by `SceneManager`'s ticker system — it spins the wheels and applies a subtle hover breathing animation.

---

## Features

### Visual
- **Procedural car model** — every panel built in code, no external 3D assets
- **Cinematic 4-point lighting** — key (shadow-casting), cyan rim, warm fill, overhead spot
- **Procedural environment map** — custom shader gradient for realistic reflections
- **Post-processing pipeline** — UnrealBloomPass (glow) + SMAA (edge anti-aliasing) + OutputPass
- **Floating particle system** — 250 ambient dust motes with additive blending
- **Pulsing underglow** — color-tracked to the active paint, additive-blended

### Interactive
- **8 paint colors** — Inferno, Abyss, Liquid Silver, Poison, Cobalt, Sunset, Pearl, Stealth
- **Live toggles** — Headlights, Underglow, Auto-Rotate, Studio Floor
- **Orbit controls** — drag to rotate, scroll to zoom, right-drag to pan
- **Camera presets** — hero, front, side, rear, top, low (triggerable via `bus.emit('camera:preset', 'side')`)
- **Animated intro** — camera eases in from a wide shot on page load
- **Live HUD** — technical spec sheet, performance strip, fluctuating RPM readout

### Debug
- Add `?debug=1` to the URL for an FPS / draw-call / triangle-count overlay
- `window.__NEXUS` exposes the app instance for console inspection

---

## Technical Highlights

| Concern | Implementation |
|---|---|
| **Decoupling** | EventBus pub/sub — no sibling-to-sibling imports |
| **State** | Centralized StateManager with path-based get/set + change events |
| **Disposal** | Every component implements `dispose()` — geometries, materials, listeners cleaned up |
| **Config** | All specs/dimensions/colors in `carSpecs.js` — single source of truth |
| **Post-processing** | EffectComposer with bloom + SMAA, state-driven intensity |
| **Environment** | PMREMGenerator + custom shader gradient for IBL reflections |
| **Materials** | MeshPhysicalMaterial with clearcoat for automotive paint |

---

## Dependencies

All loaded via CDN (importmap) — no `npm install` required:

- **Three.js** r0.160 (core, OrbitControls, RoundedBoxGeometry, EffectComposer, UnrealBloomPass, SMAAPass, OutputPass)
- **Google Fonts** — Bricolage Grotesque (display) + JetBrains Mono (mono)

---

## License

MIT — use it, modify it, ship it.
