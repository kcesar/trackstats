import Memo from './memo.js';
import { fromLatLon } from 'utm';
import { Point, Line } from 'cyrus-beck';

type GeoJSON = {
  id: string;
  geometry: { coordinates: Array<any> };
  properties: { title: string };
};

const fromUtm = (
  {
    easting,
    northing,
    zoneLetter,
    zoneNum,
  }: { easting: number; northing: number; zoneLetter: string; zoneNum: number },
  requiredZone: number | void,
  requiredLetter: string | void
) => {
  if (zoneLetter !== requiredLetter || zoneNum !== requiredZone) {
    throw new TrackError(
      `Found point in UTM zone ${zoneNum}${zoneLetter}, instead of ${requiredZone}${requiredLetter}`
    );
  }
  return new Point(Math.round(easting), Math.round(northing));
};

class TrackError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default class Track {
  id: string;
  title: string;
  longLat: Array<[number, number]>;
  utmLetter?: string;
  utmZone?: number;
  cache: Memo;
  constructor({
    id,
    geometry: { coordinates },
    properties: { title } = { title: '' },
  }: GeoJSON) {
    this.id = id;
    this.title = title;
    this.longLat = coordinates;
    this.cache = new Memo();
  }

  points(): Array<Point> {
    return this.cache.memo('points', () => {
      const utm = this.longLat.map(([long, lat]) => fromLatLon(lat, long));
      this.utmLetter = utm[0]?.zoneLetter;
      this.utmZone = utm[0]?.zoneNum;
      return utm.map((data) => fromUtm(data, this.utmZone, this.utmLetter));
    });
  }

  lines(): Array<Line> {
    return this.cache.memo('lines', () =>
      this.points().map((point, i, points) => {
        const nextPoint = points[i + 1] ?? points[0];
        return new Line(point, nextPoint);
      })
    );
  }

  distance(): number {
    return this.cache.memo('distance', () =>
      this.lines().reduce((acc, line) => acc + line.distance(), 0)
    );
  }
}
export { TrackError };
