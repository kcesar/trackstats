import { fromLatLon } from 'utm';
import Line from './line.js';
export default class Polygon {
  constructor({ id, geometry: { coordinates }, properties: { title } }) {
    this.id = id;
    this.title = title;
    this.latLongPoints = coordinates[0];
    this.utmPoints = null;
    this.utmZone = null;
  }

  points() {
    if (this.pointsUtm == null) {
      const utm = this.latLongPoints.map(([long, lat]) =>
        fromLatLon(lat, long)
      );
      this.utmZone = utm[0]?.zoneLetter;
      for (const point of utm) {
        if (point.zoneLetter !== this.utmZone) {
          throw new Error(
            `Polygon ${this.title} has points in zones ${point.zoneLetter} and ${this.utmZone}`
          );
        }
      }
      const points = utm.map(({ easting, northing }) => [
        Math.round(easting),
        Math.round(northing),
      ]);
      if (points.length > 0) {
        const first = points[0];
        const last = points[points.length - 1];
        if (first[0] === last[0] && first[1] !== last[1]) {
          // Close the polygon by adding a line from the last coordinate to the beginning
          points.push(first);
        }
      }
      this.utmPoints = points;
    }
    return this.utmPoints;
  }

  lines() {
    if (this.utmLines == null) {
      const points = [...this.points()];
      if (points.length < 3) {
        this.utmLines = [];
      } else {
        const starts = points.slice(0, -1);
        const ends = points.slice(1);
        this.utmLines = starts
          .map((start, i) => new Line(start, ends[i]))
          // remove lines which are points
          .filter(
            (line) =>
              line.start[0] !== line.end[0] || line.start[1] !== line.end[1]
          );
      }
    }
    return this.utmLines;
  }

  isConvex() {
    // Implemented based on https://stackoverflow.com/a/1881201 algorithm
    const lines = this.lines();
    if (lines.length < 3) {
      return false;
    }

    let requiredCardinality = null;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      // The algorithm works by comparing two adjacent lines at a time. The very last comparison
      // needs to take the last line & the first line
      const nextLine = lines[i + 1] ?? lines[0];

      // First, calculate the delta x & delta y for both lines
      const lineChangeX = line.end[0] - line.start[0];
      const lineChangeY = line.end[1] - line.start[1];
      const nextLineChangeX = nextLine.end[0] - nextLine.start[0];
      const nextLineChangeY = nextLine.end[1] - nextLine.start[1];

      // Now, calculate the matrix cross-product of these two lines:
      const cross =
        lineChangeX * nextLineChangeY - lineChangeY * nextLineChangeX;
      const cardinality = cross > 0;

      // Convex polxygons all have the same z-product cardinality (e.g all positive cross products or all negative)
      // If any one is the other sign, then return false
      // Ignore parallel edges (consider them still convex)
      requiredCardinality = requiredCardinality ?? cardinality;
      if (cardinality != requiredCardinality) {
        return false;
      }
    }
    return true;
  }
}
