import Line from './line';
import Polygon from './polygon';
import Point from './point';

test('a line is not convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [
    new Line(new Point(0, 0), new Point(1, 0)),
    new Line(new Point(1, 0), new Point(0, 0)),
  ];
  expect(p.isConvex()).toBe(false);
});

test('A right triangle is convex', () => {
  const p = new Polygon({
    id: 'foo',
    geometry: { coordinates: [] },
    properties: { title: 'bar' },
  });
  p.utmLines = [
    new Line(new Point(0, 0), new Point(5, 0)),
    new Line(new Point(5, 0), new Point(5, 5)),
    new Line(new Point(5, 5), new Point(0, 0)),
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
    new Line(new Point(0, 0), new Point(5, 0)),
    new Line(new Point(5, 0), new Point(5, -5)),
    new Line(new Point(5, -5), new Point(0, 0)),
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
    new Line(new Point(-3, -5), new Point(-4, 0)),
    new Line(new Point(-4, 0), new Point(1, 1)),
    new Line(new Point(1, 1), new Point(-3, -5)),
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
    new Line(new Point(0, 0), new Point(-2, 5)),
    new Line(new Point(-2, 5), new Point(3, 0)),
    new Line(new Point(3, 0), new Point(0, 0)),
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
    new Line(new Point(0, 0), new Point(5, 0)),
    new Line(new Point(5, 0), new Point(5, 5)),
    new Line(new Point(5, 5), new Point(0, 5)),
    new Line(new Point(0, 5), new Point(0, 0)),
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
    new Line(new Point(0, 0), new Point(1, -3)),
    new Line(new Point(1, -3), new Point(-1, -4)), // create the pacman
    new Line(new Point(-1, -4), new Point(50, -50)),
    new Line(new Point(50, -50), new Point(0, 0)),
  ];
  expect(p.isConvex()).toBe(false);
});
