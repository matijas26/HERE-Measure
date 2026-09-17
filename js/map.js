"use strict";

async function createHereMap(container, apiKey, onClick) {
  // Check a real satellite tile before map startup (not public metadata).
  // The map itself uses the SDK's default layers below.
  const probe = new URL("https://maps.hereapi.com/v3/base/mc/13/4347/2917/jpeg");
  probe.searchParams.set("style", "satellite.day");
  probe.searchParams.set("apiKey", apiKey);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(probe, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error("Tile request failed");
    await response.blob();
  } catch {
    throw new Error(controller.signal.aborted
      ? "HERE did not respond. Check your connection and reload the page."
      : "Cannot access HERE imagery. Check the API key in config.js, HERE service access, Trusted Domains, and your connection, then reload.");
  } finally {
    clearTimeout(timeout);
  }

  const platform = new H.service.Platform({ apikey: apiKey });
  const layers = platform.createDefaultLayers();
  const map = new H.Map(container, layers.hybrid.day.raster, {
    center: { lat: 44.7866, lng: 20.4489 },
    zoom: 16,
    pixelRatio: window.devicePixelRatio || 1
  });
  const mapEvents = new H.mapevents.MapEvents(map);
  new H.mapevents.Behavior(mapEvents);
  const ui = new H.ui.UI(map);
  ui.setUnitSystem(H.ui.UnitSystem.METRIC);
  ui.addControl("zoom", new H.ui.ZoomControl());
  ui.addControl("scalebar", new H.ui.ScaleBar());
  const distance = new H.ui.DistanceMeasurement();
  ui.addControl("distance", distance);
  // Drive the native control through its public child-button API. The toolbar
  // is the sole mode selector, so an independent ruler cannot conflict with Area.
  const distanceButton = distance.getChildren().find((child) => child instanceof H.ui.base.Button);
  distance.setVisibility(false);

  // Capture taps without preventing HERE's native navigation or measurement.
  map.addEventListener("tap", (event) => {
    const point = map.screenToGeo(
      event.currentPointer.viewportX, event.currentPointer.viewportY
    );
    if (point) onClick(point);
  }, true);

  const resizeObserver = new ResizeObserver(() => map.getViewPort().resize());
  resizeObserver.observe(container);

  let hybrid = false;
  return {
    map,
    setDistanceEnabled(enabled) {
      distanceButton.setState(enabled ? H.ui.base.Button.State.DOWN : H.ui.base.Button.State.UP);
    },
    setHybrid(enabled) {
      if (enabled === hybrid) return;
      // Both modes retain the same HERE satellite raster and measurement UI.
      if (enabled) map.addLayer(layers.hybrid.day.vector);
      else map.removeLayer(layers.hybrid.day.vector);
      hybrid = enabled;
    }
  };
}
