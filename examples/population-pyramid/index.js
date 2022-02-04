import * as React from 'react';
import { Chart, Columns, Grid } from '../../src/index';
import data from './data';

////////////////////////////////////////////////////////////////////////////////

function range(a, b, step) {
	const array = [];
	for (; a <= b; a += step) array.push(a);
	return array;
}

function format(num) {
	return num ? `${num / 1e6}M` : '';
}

////////////////////////////////////////////////////////////////////////////////

export function Example() {
	const age1 = Math.max(...data.map(d => d.age));
	const year0 = Math.min(...data.map(d => d.year));
	const year1 = Math.max(...data.map(d => d.year));
	const max = Math.max(...data.map(d => d.people));

	const birthYears = range(year0 - age1, year1, 5);

	const [year, yearSet] = React.useState(year1);
	const selection = data.filter(d => d.year === year);

	function getPopulations(year, sex) {
		return birthYears.map(birthYear => {
			const d = selection.find(
				d => d.sex === sex && d.age === year - birthYear,
			);

			return {
				x: birthYear,
				y: d ? d.people : 0,
			};
		});
	}

	const x1 = year - age1;
	const x2 = year;
	const m = getPopulations(year, 1);
	const f = getPopulations(year, 2);

	const [w, wSet] = React.useState(320);
	const size = w < 480 ? 'small' : w < 640 ? 'medium' : 'large';

	function handleBack() {
		yearSet(y => y - 10);
	}

	function handleForward() {
		yearSet(y => y + 10);
	}

	function handlePointerdown(e) {
		if (!e.isPrimary) return;
		const startX = e.clientX;
		const startValue = year;

		const handlePointermove = e => {
			if (!e.isPrimary) return;

			const d = e.clientX - startX;
			const step = Math.min(
				10,
				d > 0
					? (window.innerWidth - startX) / (year1 - startValue)
					: startX / (startValue - year0),
			);
			const n = Math.round(d / step);
			const newYear = Math.max(
				year0,
				Math.min(year1, startValue + Math.round(n * 0.1) * 10),
			);

			yearSet(newYear);
		};

		const handlePointerup = e => {
			if (!e.isPrimary) return;
			window.removeEventListener('pointermove', handlePointermove);
			window.removeEventListener('pointerup', handlePointerup);
		};

		window.addEventListener('pointermove', handlePointermove);
		window.addEventListener('pointerup', handlePointerup);
	}

	return (
		<>
			<h2>Example: Population pyramid</h2>
			<div className={`chart ${size}`}>
				<div className="background">
					<Chart
						x1={x1 - 2.5}
						x2={x2 + 2.5}
						y1={0}
						y2={max}
						clip
						onResize={({ width }) => wSet(width)}
					>
						{/* men */}
						<Columns data={m} width={5}>
							<div className="column m" />
						</Columns>

						{/* women */}
						<Columns data={f} width={5}>
							<div className="column f" />
						</Columns>

						<Grid vertical ticks={birthYears}>
							{({ value }) => (
								<span className="x label">
									{size === 'large' ? value : `'${String(value).slice(2)}`}
								</span>
							)}
						</Grid>
					</Chart>
				</div>

				<div className="foreground">
					<Chart x1={90 + 2.5} x2={0 - 2.5} y1={0} y2={max}>
						<Grid count={5}>
							{({ value }) => (
								<>
									<div className="grid-line horizontal" />
									<span className="y label">{format(value)}</span>
								</>
							)}
						</Grid>

						<Grid vertical count={size === 'large' ? 20 : 10}>
							{({ value }) => (
								<span className="x label">
									{value}
									{value === 0 ? (
										<span style={{ position: 'absolute', left: '2.5em' }}>
											yrs old
										</span>
									) : null}
								</span>
							)}
						</Grid>
					</Chart>
				</div>

				<div className="slider-container">
					<button disabled={year === year0} onClick={handleBack}>
						&larr;
					</button>
					<span onPointerDown={handlePointerdown}>{year}</span>
					<button disabled={year === year1} onClick={handleForward}>
						&rarr;
					</button>
				</div>
			</div>
			<p className="credit">
				Source: <a href="https://ipums.org/">IPUMS</a>. Based on{' '}
				<a href="https://bl.ocks.org/mbostock/4062085">
					Population Pyramid by Mike Bostock
				</a>
			</p>
		</>
	);
}
