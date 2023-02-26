import { fromLatLon } from 'utm';
import Line from './line.js';
export default class Track {
  constructor({ id, geometry: { coordinates }, properties: { title } }) {
    this.id = id;
    this.title = title;
    this.latLongPoints = coordinates;
    this.utmPoints = null;
    this.utmZone = null;
    this.utmLines = null;
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
            `Track ${this.title} has points in zones ${point.zoneLetter} and ${this.utmZone}`
          );
        }
      }
      this.utmPoints = utm.map(({ easting, northing }) => [
        Math.round(easting),
        Math.round(northing),
      ]);
    }
    return this.utmPoints;
  }

  lines() {
    if (this.utmLines == null) {
      const starts = this.points().slice(0, -1);
      const ends = this.points().slice(1);
      this.utmLines = starts.map((start, i) => new Line(start, ends[i]));
    }
    return this.utmLines;
  }

  distance() {
    return this.lines().reduce((acc, line) => acc + line.distance(), 0);
  }
}
