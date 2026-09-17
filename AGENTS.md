# AGENTS.md

## Project

HERE Measure is a small static web application for drawing and measuring directly on HERE satellite imagery.

The application is hosted on GitHub Pages.

The project should remain deliberately small.

## Mandatory workflow

Before making changes

1. Read `AGENTS.md`.
2. Read `README.md`.
3. Inspect the existing repository and current implementation.
4. State a short plan before editing.
5. Make only the changes required for the current task.

Do not begin with a broad repository audit unless explicitly requested.

## Development priorities

In order

1. Working HERE satellite map.
2. Correct measurement behavior.
3. Simple and predictable UX.
4. GitHub Pages compatibility.
5. Maintainable but minimal code.

Do not optimize for architectural sophistication.

## Architecture constraints

Default technology

 HTML
 CSS
 Vanilla JavaScript
 HERE Maps API for JavaScript 3.2

Do not introduce without explicit justification

 React
 Vue
 Angular
 Svelte
 TypeScript
 npm
 bundlers
 backend services
 databases
 CSS frameworks
 large third-party libraries

A dependency may be added only when the same functionality would otherwise require significant custom complexity.

## Scope discipline

Work on one small phase at a time.

Do not implement future roadmap features unless they are required by the current task.

Do not perform unrelated refactors.

Do not rename files or reorganize the project unless necessary.

Do not redesign working functionality while implementing an unrelated feature.

## HERE Maps requirements

Use the current HERE Maps API for JavaScript 3.2 API.

Do not copy outdated HERE 3.1 examples without checking compatibility.

The primary map view must use HERE satellite imagery.

Satellite imagery is the core reason this application exists.

Do not silently substitute

 Google Maps;
 Google Earth;
 Bing Maps;
 Mapbox;
 Esri imagery;
 OpenStreetMap imagery.

Hybrid view may overlay HERE vector information on the HERE satellite raster.

## Measurement requirements

Measurements must be derived from geographic coordinates.

Never calculate real-world distance or area from screen pixels.

Use metric units.

Distance output should use

 metres for short distances;
 kilometres where appropriate.

Area output should support

 square metres;
 ares;
 hectares;
 square kilometres where appropriate.

Numerical results should be stable and reasonably precise for landbuilding planning use.

Do not claim cadastral or surveying-grade accuracy.

## Interaction rules

Drawing tools must have explicit modes.

At minimum

 Pan
 Distance
 Area

Only one drawing mode should be active at a time.

Entering one drawing mode must disable or exit conflicting drawing behavior.

Map panzoom must continue to behave predictably.

Avoid accidental geometry creation while the user is navigating the map.

## UI rules

Keep the map as the dominant UI element.

Prefer a compact toolbar over permanent side panels.

Desktop usage is the primary target.

Do not add decorative UI that reduces useful map area.

Use clear, technical labels.

## API key handling

Never claim that a HERE API key used by frontend JavaScript can be kept secret from the browser.

Do not print credentials into logs.

Do not commit a real unrestricted API key unless explicitly instructed.

Provide an obvious configuration location.

GitHub Pages deployment must support HERE Trusted Domains.

## GitHub Pages requirements

All runtime functionality must work as a static site.

Do not require a backend.

Do not use absolute local filesystem paths.

Do not assume the site is hosted at the domain root.

The application must work from a project path such as

`httpsusername.github.iohere-measure`

## Error handling

If HERE initialization fails, show a useful visible message rather than leaving a blank map.

Examples

 missing API key;
 invalid key;
 HERE service unavailable;
 required HERE library failed to load.

Do not expose unnecessary technical internals to normal users.

## Testing expectations

For small changes, perform focused validation.

At minimum verify

 page loads without JavaScript console errors;
 HERE map renders;
 pan and zoom work;
 requested tool works;
 switching modes does not leave stale interaction handlers;
 layout remains usable at normal desktop size.

Do not create a large test framework for the initial MVP.

If automated tests would require more infrastructure than the feature itself, prefer focused manual verification for the MVP.

## Change reporting

After implementation report

### Changed

Briefly list files and relevant behavior.

### Validation

List what was actually verified.

### Known limitations

Only list real remaining limitations relevant to the task.

### Repository state

Report whether changes are committed or uncommitted.

Do not commit, push, publish, or deploy unless explicitly instructed.

## General rule

Prefer the smallest correct implementation.

If two solutions are equivalent, choose the one with

 fewer dependencies;
 fewer moving parts;
 less code;
 easier GitHub Pages deployment.
