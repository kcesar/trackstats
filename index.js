import Track from './track.js';
import Line from './line.js';
import Polygon from './polygon.js';

export { Track, Line };

const parse = (geoJSON) => {
  const features = geoJSON.features ?? [];
  return features
    .map((feature) => {
      switch (feature.geometry?.type) {
        case 'LineString':
          return new Track(feature);
        case 'Polygon':
          return new Polygon(feature);
      }
    })
    .filter(Boolean);
};
export default parse;
