import Track, { TrackGeoJSON } from './track.js';
import Polygon, { PolygonGeoJSON } from './polygon.js';

type GeoJSON = {
  features?: Array<TrackGeoJSON | PolygonGeoJSON>;
};

const parse = (geoJSON: GeoJSON) => {
  return (geoJSON?.features ?? [])
    .map((feature) => {
      switch (feature.geometry?.type) {
        case 'LineString':
          return new Track(feature as TrackGeoJSON);
        case 'Polygon':
          return new Polygon(feature as PolygonGeoJSON);
      }
    })
    .filter(Boolean);
};

export default parse;
