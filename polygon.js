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
        if (first[0] !== last[0] || first[1] !== last[1]) {
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
}
