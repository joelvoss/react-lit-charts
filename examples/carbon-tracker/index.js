import * as React from 'react';
import {
	Chart,
	Grid,
	Point,
	Quadtree,
	Svg,
	SvgLine,
	SvgScatterPlot,
} from '../../src/index';
import tsv from './data';

export function Example() {
	const data = tsv.split('\n').map(str => {
		let [date, avg, trend] = str.split('\t').map(parseFloat);
		if (avg === -99.99) avg = null;
		return { date, avg, trend };
	});

	const points = data.filter(d => d.avg);

	let minx = points[0].date;
	let maxx = points[points.length - 1].date;
	let miny = +Infinity;
	let maxy = -Infinity;
	let highest;

	for (let i = 0; i < points.length; i += 1) {
		const point = points[i];
		if (point.avg < miny) {
			miny = point.avg;
		}
		if (point.avg > maxy) {
			maxy = point.avg;
			highest = point;
		}
	}

	const months = 'Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec'.split(
		' ',
	);

	const format = date => {
		const year = ~~date;
		const month = Math.floor((date % 1) * 12);
		return `${months[month]} ${year}`;
	};

	const pc = date => (100 * (date - minx)) / (maxx - minx);

	return (
		<>
			<h2>Example: Carbon tracker</h2>
			<div className="chart">
				<Chart x1={minx} x2={maxx} y1={miny} y2={maxy}>
					<Grid count={5}>
						{({ value, last }) => (
							<div className="grid-line horizontal">
								<span>
									{value} {last ? 'ppm' : null}
								</span>
							</div>
						)}
					</Grid>

					<Grid vertical count={5}>
						{({ value }) => (
							<>
								<div className="grid-line vertical" />
								<span className="year-label">{value}</span>
							</>
						)}
					</Grid>

					<Svg>
						<SvgScatterPlot
							data={points}
							x={d => d.date}
							y={d => d.avg}
							className="avg scatter"
						/>

						<SvgLine
							data={points}
							x={d => d.date}
							y={d => d.avg}
							className="avg"
						/>

						<SvgLine
							data={points}
							x={d => d.date}
							y={d => d.trend}
							className="trend"
						/>
					</Svg>

					{/* Chart title */}
					<Point x={1962} y={390}>
						<div className="text">
							<h2>Atmospheric CO₂</h2>

							<p>
								<span style={{ color: '#676778' }}>•</span>
								&nbsp;
								<span>monthly average</span>
								&nbsp; &nbsp; &nbsp;
								<span style={{ color: '#ff3e00' }}>—</span>
								&nbsp;
								<span>trend</span>
							</p>
						</div>
					</Point>

					{/* Note */}
					<Point x={2015} y={330}>
						<div className="text" style={{ right: 0, textAlign: 'right' }}>
							<p>
								<em>
									You can place notes with the help of{' '}
									<code>{'<Point />'}</code> components whereever you like on
									our chart.
								</em>
							</p>
						</div>
					</Point>

					{/* Annotate highest point */}
					<Point x={highest.date} y={highest.avg}>
						<div
							className="annotation"
							style={{
								position: ' absolute',
								right: '0.5em',
								top: '-0.5em',
								whiteSpace: 'nowrap',
								lineHeight: 1,
								color: '#666',
							}}
						>
							{highest.avg} parts per million (ppm) &rarr;
						</div>
					</Point>

					<Quadtree data={points} x={d => d.date} y={d => d.avg}>
						{closest => (
							<Point x={closest.date} y={closest.avg}>
								<div className="focus" />
								<div
									className="tooltip"
									style={{ transform: `translate(-${pc(closest.date)}%,0)` }}
								>
									<strong>{closest.avg} ppm</strong>
									<span>{format(closest.date)}</span>
								</div>
							</Point>
						)}
					</Quadtree>
				</Chart>
			</div>
			<p>
				Source:{' '}
				<a
					target="_blank"
					href="https://scrippsco2.ucsd.edu/data/atmospheric_co2/primary_mlo_co2_record.html"
					rel="noreferrer"
				>
					Scripps Institution of Oceanography
				</a>
				. Based on{' '}
				<a href="https://www.bloomberg.com/graphics/climate-change-data-green/carbon-clock.html">
					Carbon Clock by Bloomberg
				</a>
				.
			</p>
		</>
	);
}
