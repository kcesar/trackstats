import Track, { TrackGeoJSON } from './track.js';
import Polygon, { PolygonGeoJSON } from './polygon.js';

type GeoJSON = {
  features?: Array<TrackGeoJSON | PolygonGeoJSON>;
};

const parse = (
  geoJSON: GeoJSON
): { tracks: Array<Track>; polygons: Array<Polygon> } => {
  const features = geoJSON?.features ?? [];
  const tracks = features
    .filter((feature) => feature.geometry?.type === 'LineString')
    .map((feature) => new Track(feature as TrackGeoJSON));
  const polygons = features
    .filter((feature) => feature.geometry?.type === 'Polygon')
    .map((feature) => new Polygon(feature as PolygonGeoJSON));
  return { tracks, polygons };
};

export default parse;
