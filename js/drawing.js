"use strict";

function createDrawingTools(mapView, onChange) {
  const map = mapView.map;
  const draft = new H.map.Group({ zIndex: 2 });
  const finished = new H.map.Group({ zIndex: 1 });
  map.addObject(finished);
  map.addObject(draft);
  const completed = new Map();
  const vertexIcon = new H.map.Icon('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><circle cx="6" cy="6" r="4.5" fill="white" stroke="#075e8b" stroke-width="2"/></svg>', { anchor: { x: 6, y: 6 } });
  const draftStyle = { strokeColor: "#7de3ff", lineWidth: 3, fillColor: "rgba(125,227,255,0.14)" };
  const finishedStyle = { strokeColor: "#ffcf4a", lineWidth: 3, fillColor: "rgba(255,207,74,0.16)" };
  let mode = "pan", points = [], selected = null, nextId = 1;

  function publish(message = "") {
    onChange({ mode, pointCount: points.length, completedCount: completed.size,
      measurement: completed.get(selected) || null, message });
  }

  function lineString(close = false) {
    const line = new H.geo.LineString();
    points.forEach((point) => line.pushPoint(point));
    if (close) line.pushPoint(points[0]);
    return line;
  }

  function redraw() {
    draft.removeAll();
    if (points.length >= 3) {
      draft.addObject(new H.map.Polygon(new H.geo.Polygon(lineString(true)), { style: draftStyle }));
    } else if (points.length === 2) {
      draft.addObject(new H.map.Polyline(lineString(), { style: draftStyle }));
    }
    points.forEach((point) => draft.addObject(new H.map.Marker(point, { icon: vertexIcon, zIndex: 3 })));
  }

  function onTap(event) {
    const original = event.originalEvent;
    if (original && (original.button > 0 || original.altKey || original.ctrlKey || original.metaKey || original.shiftKey)) return;
    if (mode === "area") {
      const pointer = event.currentPointer;
      const point = map.screenToGeo(pointer.viewportX, pointer.viewportY);
      if (!point || points.some((existing) => Measurements.distance(existing, point) < 0.001)) return;
      points.push({ lat: point.lat, lng: point.lng });
      redraw();
      publish();
    } else if (completed.has(event.target)) {
      selected = event.target;
      if (mode === "delete") {
        finished.removeObject(selected);
        completed.delete(selected);
        selected = Array.from(completed.keys()).pop() || null;
        setMode("pan");
      } else {
        publish();
      }
    }
  }

  function setMode(nextMode) {
    if (!["pan", "distance", "area", "delete"].includes(nextMode)) return;
    // Remove our listener even on Area -> Area; reattach exactly once below.
    map.removeEventListener("tap", onTap);
    if (nextMode !== mode) {
      points = [];
      draft.removeAll();
    }
    mapView.setDistanceEnabled(nextMode === "distance");
    mode = nextMode;
    if (mode !== "distance") map.addEventListener("tap", onTap);
    publish();
  }

  function finish() {
    if (mode !== "area") return;
    const error = Measurements.polygonError(points);
    if (error) { publish(error); return; }
    const measurement = Measurements.measurePolygon(points);
    const polygon = new H.map.Polygon(new H.geo.Polygon(lineString(true)), { style: finishedStyle });
    finished.addObject(polygon);
    completed.set(polygon, { id: nextId++, ...measurement });
    selected = polygon;
    setMode("pan");
  }

  function undo() {
    if (mode !== "area" || !points.length) return;
    points.pop();
    redraw();
    publish();
  }

  function cancel() {
    if (mode === "area") setMode("pan");
  }

  function clear() {
    if (completed.size && !window.confirm("Clear all Area polygons and the unfinished Area drawing?")) return;
    points = [];
    draft.removeAll();
    finished.removeAll();
    completed.clear();
    selected = null;
    // Clearing Area objects must not reset HERE's own distance measurement.
    setMode(mode === "distance" ? "distance" : "pan");
  }

  setMode("pan");
  return { setMode, finish, undo, cancel, clear };
}
