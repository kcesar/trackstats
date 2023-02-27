import UtmPoints, { UtmError } from './utmPoints';

test('throws an error if points span multiple UTM zones', () => {
  const p = new UtmPoints([
    [-122.5677960035426, 48.01525535512736],
    [-93.56781746121472, 48.01525535512736],
  ]);
  expect(() => p.points()).toThrow(UtmError);
});

test('throws an error if points span multiple UTM letters', () => {
  const p = new UtmPoints([
    [-122.5677960035426, 48.01525535512736],
    [-122.56781746121472, 73.01525535512736],
  ]);
  expect(() => p.points()).toThrow(UtmError);
});
