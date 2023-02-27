import Memo from './memo.js';
import { Point, Line } from 'cyrus-beck';
import { fromLatLon } from 'utm';

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
    throw new UtmError(
      `Found point in UTM zone ${zoneNum}${zoneLetter}, instead of ${requiredZone}${requiredLetter}`
    );
  }
  return new Point(Math.round(easting), Math.round(northing));
};

class UtmError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default class UtmPoints {
  utmLetter?: string;
  utmZone?: number;
  cache: Memo;
  longLat: Array<[number, number]>;

  constructor(coordinates: Array<[number, number]>) {
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
}

export { UtmError };
