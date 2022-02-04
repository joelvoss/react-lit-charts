/**
 * defaultX
 * @param {{ x: number }} d
 * @returns {number}
 */
export function defaultX(d) {
	return d.x;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * defaultY
 * @param {{ y: number }} d
 * @returns {number}
 */
export function defaultY(d) {
	return d.y;
}

////////////////////////////////////////////////////////////////////////////////

// Adapted from https://github.com/d3/d3-array/blob/master/src/ticks.js
// MIT License https://github.com/d3/d3-array/blob/master/LICENSE
/**
 * getTicks
 * @param {number} start
 * @param {number} stop
 * @param {number} [count=5]
 */
export function getTicks(start, stop, count = 5) {
	if (start === stop && count > 0) return [start];

	const reverse = stop < start;

	if (reverse) {
		[start, stop] = [stop, start];
	}

	const step = increment(start, stop, count);
	let ticks = [];

	if (step === 0 || !isFinite(step)) return ticks;

	if (step > 0) {
		start = Math.ceil(start / step);
		stop = Math.floor(stop / step);
		for (let i = 0; i < Math.ceil(stop - start + 1); i++) {
			ticks.push((start + i) * step);
		}
	} else {
		start = Math.floor(start * step);
		stop = Math.ceil(stop * step);
		for (let i = 0; i < Math.ceil(start - stop + 1); i++) {
			ticks.push((start - i) / step);
		}
	}

	if (reverse) ticks.reverse();

	return ticks;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * increment
 * @param {number} start
 * @param {number} stop
 * @param {number} count
 */
export function increment(start, stop, count) {
	const step = (stop - start) / Math.max(0, count);
	const power = Math.floor(Math.log(step) / Math.LN10);
	const error = step / Math.pow(10, power);
	const exponent =
		error >= Math.sqrt(50)
			? 10
			: error >= Math.sqrt(10)
			? 5
			: error >= Math.sqrt(2)
			? 2
			: 1;

	if (power >= 0) {
		return exponent * Math.pow(10, power);
	}
	return -Math.pow(10, -power) / exponent;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * linearScale generates a `scale` function that maps from `domain` to `range`.
 * `scale.inverse()` returns a function that maps from `range` to `domain`.
 * @param {[number, number]} domain
 * @param {[number, number]} range
 * @returns {(num: number) => number}
 */
export function linearScale(domain, range) {
	const m = (range[1] - range[0]) / (domain[1] - domain[0]);

	/** @param {number} num */
	function scale(num) {
		return range[0] + (num - domain[0]) * m;
	}

	scale.inverse = () => linearScale(range, domain);

	return scale;
}

////////////////////////////////////////////////////////////////////////////////

class Node {
	constructor(x0, y0, x1, y1) {
		this.x0 = x0;
		this.y0 = y0;
		this.x1 = x1;
		this.y1 = y1;
		this.xm = (x0 + x1) / 2;
		this.ym = (y0 + y1) / 2;

		this.empty = true;
		this.leaf = null;
		this.children = null;
	}

	add(p) {
		const { x0, y0, x1, y1, xm, ym, leaf } = this;

		if (this.empty) {
			this.leaf = p;
			this.empty = false;
			return;
		}

		if (leaf) {
			// NOTE(joel): Discard coincident points.
			if (leaf.x === p.x && leaf.y === p.y) return;

			// NOTE(joel): Need to subdivide.
			this.children = {
				nw: new Node(x0, y0, xm, ym),
				ne: new Node(xm, y0, x1, ym),
				sw: new Node(x0, ym, xm, y1),
				se: new Node(xm, ym, x1, y1),
			};

			this.leaf = null;
			this.add(leaf);
		}

		const child =
			p.x < xm
				? p.y < ym
					? this.children.nw
					: this.children.sw
				: p.y < ym
				? this.children.ne
				: this.children.se;

		child.add(p);
	}
}

////////////////////////////////////////////////////////////////////////////////

function buildTree(data, x, y, xScale, yScale) {
	const points = data.map((d, i) => ({
		d,
		x: xScale(x(d, i)),
		y: yScale(y(d, i)),
	}));

	let x0 = Infinity;
	let y0 = Infinity;
	let x1 = -Infinity;
	let y1 = -Infinity;

	for (let i = 0; i < points.length; i += 1) {
		const p = points[i];

		if (p.x < x0) x0 = p.x;
		if (p.y < y0) y0 = p.y;
		if (p.x > x1) x1 = p.x;
		if (p.y > y1) y1 = p.y;
	}

	const root = new Node(x0, y0, x1, y1);

	for (let i = 0; i < points.length; i += 1) {
		const p = points[i];
		if (isNaN(p.x) || isNaN(p.y)) continue;

		root.add(p);
	}

	return root;
}

////////////////////////////////////////////////////////////////////////////////

export class Quadtree {
	constructor(data) {
		this.data = data;
		this.x = null;
		this.y = null;
		this.x_scale = null;
		this.y_scale = null;
	}

	update(x, y, xScale, yScale) {
		this.root = null;
		this.x = x;
		this.y = y;
		this.x_scale = xScale;
		this.y_scale = yScale;
	}

	find(left, top, width, height, radius) {
		if (!this.root)
			this.root = buildTree(
				this.data,
				this.x,
				this.y,
				this.x_scale,
				this.y_scale,
			);

		const queue = [this.root];

		let node;
		let closest;
		let minDSquared = Infinity;

		const xToPx = x => (x * width) / 100;
		const yToPx = y => (y * height) / 100;

		while ((node = queue.pop())) {
			if (node.empty) continue;

			const left0 = xToPx(node.x0);
			const left1 = xToPx(node.x1);
			const top0 = yToPx(node.y0);
			const top1 = yToPx(node.y1);

			const outOfBounds =
				left < Math.min(left0, left1) - radius ||
				left > Math.max(left0, left1) + radius ||
				top < Math.min(top0, top1) - radius ||
				top > Math.max(top0, top1) + radius;

			if (outOfBounds) continue;

			if (node.leaf) {
				const dl = xToPx(node.leaf.x) - left;
				const dt = yToPx(node.leaf.y) - top;

				const dSquared = dl * dl + dt * dt;

				if (dSquared < minDSquared) {
					closest = node.leaf.d;
					minDSquared = dSquared;
				}
			} else {
				queue.push(
					node.children.nw,
					node.children.ne,
					node.children.sw,
					node.children.se,
				);
			}
		}

		return minDSquared < radius * radius ? closest : null;
	}
}
