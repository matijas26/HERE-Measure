"use strict";

const Measurements = (() => {
  const radius = 6371008.8; // Mean Earth radius in metres; spherical planning estimates.
  const radians = Math.PI / 180;
  const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
  const subtract = (a, b) => a.map((value, i) => value - b[i]);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  function vector(point) {
    const lat = point.lat * radians, lng = point.lng * radians;
    return [Math.cos(lat) * Math.cos(lng), Math.cos(lat) * Math.sin(lng), Math.sin(lat)];
  }

  function distance(a, b) {
    const lat1 = a.lat * radians, lat2 = b.lat * radians;
    const h = Math.sin((lat2 - lat1) / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin((b.lng - a.lng) * radians / 2) ** 2;
    return 2 * radius * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
  }

  function measurePolygon(points) {
    if (points.length < 3) throw new Error("At least three vertices are required.");
    const vectors = points.map(vector), origin = vectors[0];
    let excess = 0, perimeter = 0;
    // Signed solid angles of a triangle fan, including concave polygons.
    // Subtract the origin before the cross product to avoid cancellation for
    // building-sized triangles. Edges are the shorter great-circle arcs.
    for (let i = 1; i < vectors.length - 1; i++) {
      const b = vectors[i], c = vectors[i + 1];
      excess += 2 * Math.atan2(dot(origin, cross(subtract(b, origin), subtract(c, origin))),
        1 + dot(origin, b) + dot(b, c) + dot(c, origin));
    }
    for (let i = 0; i < points.length; i++) {
      perimeter += distance(points[i], points[(i + 1) % points.length]);
    }
    return { area: Math.abs(excess) * radius ** 2, perimeter };
  }

  function polygonError(points) {
    if (points.length < 3) return "Add at least three vertices before finishing.";
    // A gnomonic projection makes great-circle edges straight, allowing a small
    // intersection check in geographic space, independent of map/screen pixels.
    const origin = vector(points[0]), lat = points[0].lat * radians, lng = points[0].lng * radians;
    const east = [-Math.sin(lng), Math.cos(lng), 0];
    const north = [-Math.sin(lat) * Math.cos(lng), -Math.sin(lat) * Math.sin(lng), Math.cos(lat)];
    const projected = [];
    for (const point of points) {
      const v = vector(point), denominator = dot(v, origin);
      if (denominator <= 1e-6) return "This polygon is too large. Measure a smaller area.";
      const offset = subtract(v, origin);
      projected.push([radius * dot(offset, east) / denominator, radius * dot(offset, north) / denominator]);
    }
    const side = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const onSegment = (a, b, c) => Math.abs(side(a, b, c)) < 1e-8 &&
      c[0] >= Math.min(a[0], b[0]) - 1e-7 && c[0] <= Math.max(a[0], b[0]) + 1e-7 &&
      c[1] >= Math.min(a[1], b[1]) - 1e-7 && c[1] <= Math.max(a[1], b[1]) + 1e-7;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (distance(points[i], points[j]) < 0.001) return "Use distinct vertices; Finish closes the polygon for you.";
        if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
        const a = projected[i], b = projected[(i + 1) % points.length];
        const c = projected[j], d = projected[(j + 1) % points.length];
        if ((side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0) ||
            onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b)) {
          return "The boundary crosses or touches itself. Use Undo point to correct it.";
        }
      }
    }
    if (measurePolygon(points).area < 1e-6) return "These vertices do not enclose an area. Add a point away from the line.";
    return "";
  }

  const number = (value, decimals) => value.toLocaleString("en-US", {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals
  });

  function formatArea(area) {
    const parcel = `${number(area, 1)} m² | ${number(area / 100, 2)} a | ${number(area / 10000, 3)} ha`;
    return area >= 1000000 ? `${number(area / 1000000, 3)} km² | ${parcel}` : parcel;
  }

  function formatPerimeter(perimeter) {
    return perimeter < 1000 ? `${number(perimeter, 1)} m` : `${number(perimeter / 1000, 3)} km`;
  }

  return { distance, measurePolygon, polygonError, formatArea, formatPerimeter };
})();
