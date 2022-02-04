import * as React from 'react';
import { render } from './test-utils';

import {
  Bars,
	Box,
	Chart,
	Columns,
	Grid,
	Point,
	Svg,
	SvgArea,
	SvgCircle,
	SvgLine,
	SvgPolygon,
	SvgRect,
	SvgScatterPlot,
} from '../src';

describe('Grid', () => {
	const Comp = ({ ticks, vertical }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Grid vertical={vertical} count={5} ticks={ticks}>
						{({ value, first, last }) => {
							return (
								<div data-first={first} data-last={last}>
									{value}
								</div>
							);
						}}
					</Grid>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement, rerender } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();

		rerender(<Comp vertical />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render with custom ticks', async () => {
		const ticks = [0, 20, 50, 75];
		const { baseElement } = render(<Comp ticks={ticks} />);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Svg', () => {
	const Comp = ({ clip }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Svg clip={clip} />
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement, rerender } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();

		rerender(<Comp clip />);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('SvgLine', () => {
	const defaultData = [
		{ x: 0, y: 0 },
		{ x: 20, y: 25 },
		{ x: 40, y: 10 },
		{ x: 60, y: 50 },
		{ x: 80, y: 75 },
		{ x: 100, y: 100 },
	];

	const Comp = ({ data = defaultData, x, y }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Svg>
						<SvgLine data={data} x={x} y={y} />
					</Svg>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render custom data + accessors', async () => {
		const data = [
			{ date: 0, avg: 0 },
			{ date: 20, avg: 25 },
			{ date: 40, avg: 10 },
			{ date: 60, avg: 50 },
			{ date: 65, avg: 75 },
			{ date: 95, avg: 56 },
			{ date: 100, avg: 100 },
		];

		const x = d => d.date;
		const y = d => d.avg;

		const { baseElement } = render(<Comp data={data} x={x} y={y} />);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('SvgScatterPlot', () => {
	const defaultData = [
		{ x: 0, y: 0 },
		{ x: 20, y: 25 },
		{ x: 40, y: 10 },
		{ x: 60, y: 50 },
		{ x: 80, y: 75 },
		{ x: 100, y: 100 },
	];

	const Comp = ({ data = defaultData, x, y }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Svg>
						<SvgScatterPlot data={data} x={x} y={y} />
					</Svg>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render custom data + accessors', async () => {
		const data = [
			{ date: 0, avg: 0 },
			{ date: 20, avg: 25 },
			{ date: 40, avg: 10 },
			{ date: 60, avg: 50 },
			{ date: 65, avg: 75 },
			{ date: 95, avg: 56 },
			{ date: 100, avg: 100 },
		];

		const x = d => d.date;
		const y = d => d.avg;

		const { baseElement } = render(<Comp data={data} x={x} y={y} />);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('SvgPolygon', () => {
	const defaultData = [
		{ x: 0, y: 0 },
		{ x: 20, y: 25 },
		{ x: 40, y: 10 },
		{ x: 60, y: 50 },
		{ x: 80, y: 75 },
		{ x: 100, y: 100 },
	];

	const Comp = ({ data = defaultData, x, y }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Svg>
						<SvgPolygon data={data} x={x} y={y} />
					</Svg>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render custom data + accessors', async () => {
		const data = [
			{ date: 0, avg: 0 },
			{ date: 20, avg: 25 },
			{ date: 40, avg: 10 },
			{ date: 60, avg: 50 },
			{ date: 65, avg: 75 },
			{ date: 95, avg: 56 },
			{ date: 100, avg: 100 },
		];

		const x = d => d.date;
		const y = d => d.avg;

		const { baseElement } = render(<Comp data={data} x={x} y={y} />);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('SvgArea', () => {
	const defaultData = [
		{ x: 20, y: 25 },
		{ x: 40, y: 10 },
		{ x: 60, y: 50 },
		{ x: 80, y: 75 },
		{ x: 100, y: 100 },
	];

	const Comp = ({ data = defaultData, floor }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Svg>
						<SvgArea data={data} floor={floor} />
					</Svg>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render with custom floor', async () => {
		const { baseElement } = render(<Comp floor={10} />);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('SvgCircle', () => {
	const Comp = ({ x = 50, y = 50 }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Svg>
						<SvgCircle x={x} y={y} r={5} />
					</Svg>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render with custom x/y', async () => {
		const { baseElement } = render(<Comp x={20} y={0} />);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('SvgRect', () => {
	const Comp = ({ x1, x2, y1, y2 }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Svg>
						<SvgRect x1={x1} x2={x2} y1={y1} y2={y2} />
					</Svg>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render with custom coordinates', async () => {
		const { baseElement } = render(<Comp x1={10} x2={20} y1={10} y2={20} />);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Point', () => {
	const Comp = ({ x = 50, y = 50, children }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Point x={x} y={y}>
						{children}
					</Point>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render with child', async () => {
		const { baseElement } = render(
			<Comp>
				<p>Child</p>
			</Comp>,
		);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Box', () => {
	const Comp = ({ x1, x2, y1, y2, style }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Box x1={x1} x2={x2} y1={y1} y2={y2} style={style} />
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render with custom coordinates', async () => {
		const { baseElement } = render(
			<Comp
				x1={25}
				x2={75}
				y1={25}
				y2={75}
				style={{ backgroundColor: 'aquamarine' }}
			/>,
		);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Columns', () => {
	const defaultData = [
		{ x: 20, y: 25 },
		{ x: 40, y: 10 },
		{ x: 60, y: 50 },
		{ x: 80, y: 75 },
		{ x: 100, y: 100 },
	];

	const Comp = ({ data = defaultData, x, y, width, children }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Columns data={data} x={x} y={y} width={width}>
						{children}
					</Columns>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render with custom data + accessors', async () => {
		const data = [
			{ date: 20, avg: 25 },
			{ date: 40, avg: 10 },
			{ date: 60, avg: 50 },
			{ date: 65, avg: 75 },
			{ date: 95, avg: 56 },
			{ date: 100, avg: 100 },
		];

		const x = d => d.date;
		const y = d => d.avg;

		const { baseElement } = render(
			<Comp data={data} x={x} y={y} width={10}>
				<p>Child</p>
			</Comp>,
		);
		expect(baseElement).toMatchSnapshot();
	});
});

////////////////////////////////////////////////////////////////////////////////

describe('Bars', () => {
	const defaultData = [
		{ x: 20, y: 25 },
		{ x: 40, y: 10 },
		{ x: 60, y: 50 },
		{ x: 80, y: 75 },
		{ x: 100, y: 100 },
	];

	const Comp = ({ data = defaultData, x, y, height, children }) => {
		return (
			<div style={{ width: 400, height: 300 }}>
				<Chart x1={0} x2={100} y1={0} y2={100}>
					<Bars data={data} x={x} y={y} height={height}>
						{children}
					</Bars>
				</Chart>
			</div>
		);
	};

	it('should not have ARIA violations', async () => {
		const { container } = render(<Comp />);
		await expect(container).toHaveNoAxeViolations();
	});

	it('should render proper HTML', async () => {
		const { baseElement } = render(<Comp />);
		expect(baseElement).toMatchSnapshot();
	});

	it('should render with custom data + accessors', async () => {
		const data = [
			{ date: 20, avg: 25 },
			{ date: 40, avg: 10 },
			{ date: 60, avg: 50 },
			{ date: 65, avg: 75 },
			{ date: 95, avg: 56 },
			{ date: 100, avg: 100 },
		];

		const x = d => d.date;
		const y = d => d.avg;

		const { baseElement } = render(
			<Comp data={data} x={x} y={y} height={10}>
				<p>Child</p>
			</Comp>,
		);
		expect(baseElement).toMatchSnapshot();
	});
});
