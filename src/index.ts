import Track, { TrackGeoJSON } from './track.js';

type GeoJSON = {
  features?: Array<TrackGeoJSON>;
};

const parse = (geoJSON: GeoJSON) => {
  return (geoJSON?.features ?? [])
    .map((feature) => {
      switch (feature.geometry?.type) {
        case 'LineString':
          return new Track(feature);
      }
    })
    .filter(Boolean);
};

export default parse;
