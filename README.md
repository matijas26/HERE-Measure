# HERE Measure
HERE Maps with measurment tools

## GitHub Pages

This is a static site with no build step. Publish the existing repository from
**Settings > Pages > Build and deployment > Deploy from a branch**, selecting
**main** and **/ (root)**, then **Save**.

Expected project URL: https://matijas26.github.io/HERE-Measure/

`index.html`, `css/`, `js/`, and `config.js` are served directly from the repository
root. Local asset references are relative so they work under `/HERE-Measure/`.
`.nojekyll` disables Jekyll processing. No Actions workflow or backend is required.

`config.js` is intentionally tracked so the deployed site receives its HERE
configuration. Its browser-side API key is visible to clients. Restrict the key
using HERE Trusted Domains for `https://matijas26.github.io` and any required
local development origins. The key value is not reproduced in this document.
