import * as React from 'react';
import { Chart, Grid, Point, Quadtree, Svg, SvgLine } from '../../src/index';
import { countries } from './data';

export function Example() {
	let x1 = +Infinity;
	let x2 = -Infinity;
	let y1 = +Infinity;
	let y2 = -Infinity;

	countries.forEach(country => {
		country.data.forEach(d => {
			if (d.x < x1) x1 = d.x;
			if (d.x > x2) x2 = d.x;
			if (d.y < y1) y1 = d.y;
			if (d.y > y2) y2 = d.y;
		});
	});

	const [filter, filterSet] = React.useState('');

	const regex = React.useMemo(
		() => (filter ? new RegExp(filter, 'i') : null),
		[filter],
	);

	const filtered = React.useMemo(
		() =>
			regex ? countries.filter(country => regex.test(country.name)) : countries,
		[regex],
	);

	const points = React.useMemo(
		() =>
			filtered.reduce(
				(points, country) =>
					points.concat(
						country.data.map(d => ({
							x: d.x,
							y: d.y,
							country,
						})),
					),
				[],
			),
		[filtered],
	);

	return (
		<>
			<h2>Example: Life expectancy</h2>

			<input
				placeholder="Type to filter"
				value={filter}
				onChange={e => filterSet(e.target.value)}
			/>

			<div className="chart">
				<Chart x1={x1} x2={x2} y1={y1} y2={y2}>
					<Grid count={5}>
						{({ value }) => (
							<div className="grid-line horizontal">
								<span>{value}</span>
							</div>
						)}
					</Grid>

					<Grid vertical count={5}>
						{({ value }) => <span className="x-label">{value}</span>}
					</Grid>

					<Svg>
						{filtered.map((country, i) => (
							<SvgLine key={i} data={country.data} className="data" />
						))}

						<Quadtree data={points}>
							{closest => (
								<SvgLine data={closest.country.data} className="highlight" />
							)}
						</Quadtree>
					</Svg>

					<Quadtree data={points}>
						{closest => (
							<Point x={closest.x} y={closest.y}>
								<span className="annotation-point" />
								<div
									className="annotation"
									style={{
										transform: `translate(-${
											100 * ((closest.x - x1) / (x2 - x1))
										}%,0)`,
									}}
								>
									<strong>{closest.country.name}</strong>
									<span>
										{closest.x}: {closest.y} years
									</span>
								</div>
							</Point>
						)}
					</Quadtree>
				</Chart>
			</div>

			<p>
				Source:{' '}
				<a href="https://data.worldbank.org/indicator/SP.DYN.LE00.IN?end=2017&start=1960">
					The World Bank
				</a>
				. Based on{' '}
				<a href="http://projects.flowingdata.com/life-expectancy/">
					Life Expectancy by Nathan Yau
				</a>
				.
			</p>
		</>
	);
}
