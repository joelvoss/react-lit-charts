import {
	defaultX,
	defaultY,
	getTicks,
	increment,
	linearScale,
	Quadtree,
} from '../src/utils';

////////////////////////////////////////////////////////////////////////////////

describe('default identities', () => {
	test('defaultX', () => {
		expect(defaultX({ x: 1, y: 2 })).toBe(1);
	});

	test('defaultY', () => {
		expect(defaultY({ x: 1, y: 2 })).toBe(2);
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('getTicks', () => {
	test('base', () => {
		expect(getTicks(0, 1000)).toEqual([0, 200, 400, 600, 800, 1000]);
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('incremet', () => {
	test('base', () => {
		expect(increment(1, 10, 5)).toBe(2);
		expect(increment(1, 10, 2)).toBe(5);
		expect(increment(1, 100, 5)).toBe(20);
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('linearScale', () => {
	test('scales a number', () => {
		const scale = linearScale([10, 20], [50, 100]);
		expect(scale(15)).toBe(75);
		expect(scale(5)).toBe(25);
	});

	test('provides an inverse() method', () => {
		const scale = linearScale([10, 20], [50, 100]);
		const inverse = scale.inverse();
		expect(inverse(75)).toBe(15);
		expect(inverse(25)).toBe(5);
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Quadtree', () => {
	const data = [
		{ x: 20, y: 25 },
		{ x: 40, y: 10 },
		{ x: 60, y: 50 },
		{ x: 80, y: 75 },
		{ x: 100, y: 100 },
	];

	const x = defaultX;
	const y = defaultY;
	const xScale = linearScale([0, 100], [0, 100]);
	const yScale = linearScale([0, 100], [0, 100]);

	test('class signature + instantiation', () => {
		const qt = new Quadtree(data);
		qt.update(x, y, xScale, yScale);

		expect(qt.data).toBe(data);
		expect(qt.x).toBe(x);
		expect(qt.y).toBe(y);
		expect(qt.x_scale).toBe(xScale);
		expect(qt.y_scale).toBe(yScale);
		expect(typeof qt.find).toBe('function');
		expect(typeof qt.update).toBe('function');
	});

	test('find', () => {
		const qt = new Quadtree(data);
		qt.update(x, y, xScale, yScale);

		expect(qt.find(0, 0, 100, 100, Infinity)).toEqual({ x: 20, y: 25 });
		expect(qt.find(100, 100, 100, 100, Infinity)).toEqual({ x: 100, y: 100 });
		expect(qt.find(50, 50, 100, 100, Infinity)).toEqual({ x: 60, y: 50 });
	});
});
