import Line from './line';
import Polygon from './polygon';

test('a line is not convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [new Line([0, 0], [1, 0]), new Line([1, 0], [0, 0])];
  expect(p.isConvex()).toBe(false);
});

test('A right triangle is convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [
    new Line([0, 0], [5, 0]),
    new Line([5, 0], [5, 5]),
    new Line([5, 5], [0, 0]),
  ];
  expect(p.isConvex()).toBe(true);
});

test('A right triangle (flipped over x axis) is convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [
    new Line([0, 0], [5, 0]),
    new Line([5, 0], [5, -5]),
    new Line([5, -5], [0, 0]),
  ];
  expect(p.isConvex()).toBe(true);
});

test('An acute triangle is convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [
    new Line([-3, -5], [-4, 0]),
    new Line([-4, 0], [1, 1]),
    new Line([1, 1], [-3, -5]),
  ];
  expect(p.isConvex()).toBe(true);
});

test('An obtuse triangle is convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [
    new Line([0, 0], [-2, 5]),
    new Line([-2, 5], [3, 0]),
    new Line([3, 0], [0, 0]),
  ];
  expect(p.isConvex()).toBe(true);
});

test('An square is convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [
    new Line([0, 0], [5, 0]),
    new Line([5, 0], [5, 5]),
    new Line([5, 5], [0, 5]),
    new Line([0, 5], [0, 0]),
  ];
  expect(p.isConvex()).toBe(true);
});

test('An 4 sided shape with a divot is not convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [
    new Line([0, 0], [1, -3]),
    new Line([1, -3], [-1, -4]), // create the pacman
    new Line([-1, -4], [50, -50]),
    new Line([50, -50], [0, 0]),
  ];
  expect(p.isConvex()).toBe(false);
});
