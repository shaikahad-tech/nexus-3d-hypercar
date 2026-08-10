# NEXUS 3D — Aether GT Hypercar

A production-grade, futuristic sports car showcase built with **Three.js** and a fully modular ES6 architecture. The car is modeled procedurally in code — no external 3D files — and rendered with cinematic studio lighting, post-processing bloom, physics simulation, procedural audio, and an interactive HUD.

---

## Quick Start

```bash
# Python (built into most systems)
python3 serve.py

# OR any static file server
npx serve .
```

Open `http://localhost:8000` in your browser. ES6 modules require serving over HTTP — `file://` won't work.

---

## Architecture

Layered, event-driven architecture. No subsystem imports another directly — all cross-module communication flows through a central `EventBus`.

```
src/
├── main.js                        # Application bootstrap — wires all 13 subsystems
├── styles.css                     # Global design tokens + HUD styles (16 sections)
├── config/
│   ├── carSpecs.js                # 3 vehicle variants with full spec sheets
│   ├── paintColors.js             # 18 paint colors (metallic/pearl/matte/candy/chrome) + rim finishes + caliper colors
│   ├── sceneModes.js              # 5 scene modes (studio/day/sunset/night/cyberpunk)
│   ├── cameraPresets.js           # 12 camera presets + cinematic sequence
│   ├── hotspots.js                # 6 interactive info hotspots
│   └── keybindings.js             # Keyboard shortcut mappings
├── core/
│   ├── EventBus.js                # Pub/sub with history + error isolation
│   ├── StateManager.js            # Centralized reactive state with serialize/deserialize
│   └── AssetLoader.js             # Async resource loading with progress tracking
├── scene/
│   ├── SceneManager.js            # Renderer, scene graph, camera, RAF loop, screenshot support
│   ├── LightingRig.js             # 5-point lighting with smooth mode transitions
│   ├── Environment.js             # Procedural env maps with per-mode caching
│   ├── PostFX.js                  # Bloom + SMAA + Vignette + OutputPass pipeline
│   ├── CameraDirector.js          # OrbitControls + 12 presets + cinematic sequence player
│   └── SceneModeManager.js        # Coordinates lighting/env/floor/bloom transitions
├── car/
│   ├── CarBuilder.js              # Top-level assembly + physics integration
│   ├── Chassis.js                 # Body, hood, nose, doors, mirrors, grille, vents
│   ├── Cabin.js                   # Glass canopy, pillars, interior, seats, steering yoke, screens
│   ├── Wheels.js                  # Tires, rims, brake discs, calipers, 5-spoke aero, lug nuts
│   ├── Aerodynamics.js            # Splitter, diffuser, wing, skirts, intakes, NACA ducts
│   └── CarLights.js               # Headlights, DRL, fog lights, taillights, turn signals, reverse
├── materials/
│   └── MaterialLibrary.js         # 13 materials with paint/rim/caliper swap system
├── effects/
│   ├── ParticleSystem.js         # Seeded ambient dust with bounds wrapping
│   ├── StudioFloor.js             # Reflective floor + dual glow rings + grid + mode transitions
│   └── UnderglowFX.js             # Pulsing glow plane + ground point light
├── audio/
│   └── AudioEngine.js             # Procedural Web Audio: engine, ambient, clicks, spray, whoosh
├── physics/
│   └── PhysicsSimulator.js         # RPM, speed, suspension (pitch/roll/bounce), braking, tire slip
├── interaction/
│   ├── KeyboardController.js      # 20+ keyboard shortcuts
│   ├── HotspotSystem.js           # 3D clickable markers with camera focus + info panel
│   └── ScreenshotManager.js       # PNG capture from WebGL canvas
├── ui/
│   ├── HUD.js                     # Top bar, 3-section spec sheet, live RPM/speed, cinematic indicator
│   ├── Configurator.js            # Tabbed panel: Paint / Wheels / Scene / Camera
│   ├── HotspotPanel.js            # Slide-up info panel with specs + description
│   └── PerformanceMeter.js        # Debug FPS/draw-call/triangle overlay (?debug=1)
└── utils/
    ├── geometry.js                # Reusable geometry factories + disposal + counting
    ├── math.js                    # 20+ math helpers: easing, SeededRandom, formatting
    └── debug.js                   # URL-param debug mode + log buffer
```

---

## Features

### Visual
- **Procedural car model** — 100+ meshes built entirely in code
- **3 vehicle variants** — Aether GT (hypercar), Phantom R (track), Vortex S (GT)
- **5 scene modes** — Studio, Daylight, Sunset, Night, Cyberpunk
- **5-point cinematic lighting** — key, rim, fill, spot, hemisphere with smooth transitions
- **Post-processing pipeline** — Bloom + SMAA + Vignette + OutputPass
- **Procedural environment maps** — custom GLSL shader gradient per scene mode
- **Particle system** — 250 seeded ambient dust motes
- **Dual underglow** — pulsing glow plane + ground point light

### Interactive
- **18 paint colors** across 5 categories (metallic, pearl, matte, candy, chrome)
- **5 rim finishes** and **6 caliper colors**
- **12 camera presets** with FOV animation + eased transitions
- **Cinematic demo mode** — auto-plays a 9-shot camera sequence
- **6 interactive hotspots** — click car parts for specs + descriptions
- **Physics simulation** — engine RPM, speed, suspension pitch/roll, braking
- **Procedural audio** — engine hum, ambient drone, UI clicks, paint spray
- **Screenshot capture** — save current view as PNG
- **20+ keyboard shortcuts** — camera, color, scene, vehicle, toggles
- **Config save/share** — serialize state to JSON

### Debug
- `?debug=1` for FPS/draw-call/triangle/geometry/texture/program overlay
- `window.__NEXUS` for console inspection

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-6` | Camera presets (hero, front, side, rear, top, low) |
| `C` / `Shift+C` | Next / previous paint color |
| `H` | Toggle headlights |
| `G` | Toggle underglow |
| `R` | Toggle auto-rotate |
| `F` | Toggle studio floor |
| `Q` / `W` | Previous / next scene mode |
| `V` / `Shift+V` | Next / previous vehicle variant |
| `Space` | Toggle cinematic mode |
| `S` | Take screenshot |
| `Esc` | Close overlays |

---

## Dependencies

All via CDN importmap — no `npm install`:
- **Three.js** r0.160
- **Google Fonts** — Bricolage Grotesque + JetBrains Mono

---

## License

MIT
