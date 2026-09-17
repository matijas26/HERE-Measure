"use strict";

(async () => {
  const selector = document.getElementById("map-type");
  const status = document.getElementById("status");
  const coordinates = document.getElementById("coordinates");
  const error = document.getElementById("error");
  const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
  const areaActions = document.getElementById("area-actions");
  const finish = document.getElementById("finish");
  const undo = document.getElementById("undo");
  const clear = document.getElementById("clear");
  const measurement = document.getElementById("measurement");

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    status.textContent = "Map unavailable";
    selector.disabled = true;
    modeButtons.forEach((button) => { button.disabled = true; });
    finish.disabled = undo.disabled = clear.disabled = true;
  }

  const configuredKey = window.HERE_MEASURE_CONFIG?.apiKey;
  const apiKey = typeof configuredKey === "string" ? configuredKey.trim() : "";
  if (!apiKey || /^(YOUR[_ -]|REPLACE[_ -]|PASTE[_ -])/i.test(apiKey)) {
    showError("HERE API key is not configured. Copy config.example.js to config.js, set apiKey to your HERE API key, and reload the page. See README.md for setup.");
    return;
  }

  if (!window.H?.Map || !window.H?.service?.Platform ||
      !window.H?.mapevents?.Behavior || !window.H?.ui?.DistanceMeasurement ||
      typeof createHereMap !== "function" || typeof createDrawingTools !== "function" ||
      typeof Measurements === "undefined") {
    showError("A required HERE Maps library could not load. Check your connection and whether js.api.here.com is blocked, then reload the page.");
    return;
  }

  status.textContent = "Connecting to HERE imagery…";
  try {
    const map = await createHereMap(document.getElementById("map"), apiKey, (point) => {
      coordinates.textContent = `Lat: ${point.lat.toFixed(6)}° | Lon: ${point.lng.toFixed(6)}°`;
    });
    selector.disabled = false;
    const drawing = createDrawingTools(map, (state) => {
      modeButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode));
        button.disabled = button.dataset.mode === "delete" && state.completedCount === 0;
      });
      areaActions.hidden = state.mode !== "area";
      finish.disabled = state.pointCount < 3;
      undo.disabled = state.pointCount === 0;
      clear.disabled = state.pointCount === 0 && state.completedCount === 0;
      const result = state.measurement;
      measurement.textContent = result
        ? `Area ${result.id}: ${Measurements.formatArea(result.area)} · Perimeter: ${Measurements.formatPerimeter(result.perimeter)}`
        : "No area measured";
      const hints = {
        pan: "Pan · Drag to move · Scroll to zoom · Click a polygon to inspect it",
        distance: "Distance · Click points to measure · Select Pan to exit",
        area: `Area · ${state.pointCount} vertices · Click to add · Finish to close · Esc to cancel`,
        delete: "Delete · Click an Area polygon to remove it"
      };
      status.textContent = state.message || hints[state.mode];
    });
    modeButtons.forEach((button) => {
      button.addEventListener("click", () => drawing.setMode(button.dataset.mode));
    });
    finish.addEventListener("click", drawing.finish);
    undo.addEventListener("click", drawing.undo);
    clear.addEventListener("click", drawing.clear);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !areaActions.hidden) {
        event.preventDefault();
        drawing.cancel();
      }
    });
    selector.addEventListener("change", () => {
      map.setHybrid(selector.value === "hybrid");
    });
  } catch (failure) {
    // Only our own service errors are user-facing; never print SDK errors/URLs
    // that could include the API key.
    const message = failure.message || "";
    showError(message.startsWith("HERE did not respond.") || message.startsWith("Cannot access HERE imagery.")
      ? message
      : "HERE Maps could not start. Check your API configuration and connection, and use a browser with WebGL enabled. Reload to try again.");
  }
})();
