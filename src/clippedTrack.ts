import Track from './track.js';
import { Point, Line } from 'cyrus-beck';

export default class ClippedTrack extends Track {
  clippedLines: Array<Line>;
  constructor(track: Track, clippedLines: Array<Line>) {
    super({
      id: track.id,
      geometry: { coordinates: [], type: 'LineString' },
      properties: { title: track.title },
    });
    this.clippedLines = clippedLines;
  }

  points(): Array<Point> {
    throw new Error(
      'not implemented for clipped tracks, since the lines may be disjoint'
    );
  }

  lines(): Array<Line> {
    return [...this.clippedLines];
  }
}
