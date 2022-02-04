import * as React from 'react';
import {
	composeEventHandlers,
	createNamedContext,
	isFunction,
	useComposeRefs,
	useUpdateEffect,
} from '@react-lit/helper';
import { useRect } from '@react-lit/rect';
import {
	defaultX,
	defaultY,
	getTicks,
	linearScale,
	Quadtree as QT,
} from './utils';

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} ChartContext
 * @prop {number} width
 * @prop {number} height
 *
 * @typedef {Scales & ChartContext} ChartContextValue
 */
const ChartContext = createNamedContext('ChartContext', {});

/**
 * @typedef {Object} ChartPointerContextValue
 * @prop {{ x: number, y: number, left: number, top: number }} pointer
 */
const ChartPointerContext = createNamedContext('ChartPointer', {});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} Scales
 * @prop {number} x1
 * @prop {number} y1
 * @prop {number} x2
 * @prop {number} y2
 * @prop {(num: number) => number} xScale
 * @prop {(num: number) => number} yScale
 * @prop {(num: number) => number} xScaleInverse
 * @prop {(num: number) => number} yScaleInverse
 */

/**
 * getScales
 * @param {number} [x1=0]
 * @param {number} [y1=0]
 * @param {number} [x2=1]
 * @param {number} [y2=1]
 * @returns {Scales}
 */
function getScales(x1 = 0, y1 = 0, x2 = 1, y2 = 1) {
	const xScale = linearScale([x1, x2], [0, 100]);
	const yScale = linearScale([y1, y2], [100, 0]);
	const xScaleInverse = xScale.inverse();
	const yScaleInverse = yScale.inverse();
	return {
		x1,
		y1,
		x2,
		y2,
		xScale,
		yScale,
		xScaleInverse,
		yScaleInverse,
	};
}

////////////////////////////////////////////////////////////////////////////////

const ActionTypes = {
	RESIZE: 'RESIZE',
	UPDATE_SCALES: 'UPDATE_SCALES',
	UPDATE_POINTER: 'UPDATE_POINTER',
};

////////////////////////////////////////////////////////////////////////////////

/**
 * reducer
 * @param {ChartContextValue} state
 * @param {{ type: string, payload: any }} action
 * @returns {ChartContextValue}
 */
function reducer(state, action) {
	switch (action.type) {
		case ActionTypes.UPDATE_SCALES: {
			return {
				...state,
				...action.payload.scales,
			};
		}
		case ActionTypes.RESIZE: {
			return {
				...state,
				width: action.payload.width,
				height: action.payload.height,
			};
		}
		default: {
			return state;
		}
	}
}
////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} ChartProps
 * @prop {number} x1
 * @prop {number} y1
 * @prop {number} x2
 * @prop {number} y2
 * @prop {boolean} clip
 * @prop {function} onResize
 */

/**
 * Chart
 * @param {ChartProps} props
 * @returns {JSX.Element}
 */
export const Chart = React.forwardRef((props, parentRef) => {
	const {
		x1 = 0,
		x2 = 1,
		y1 = 0,
		y2 = 1,
		clip = false,
		onResize,
		...rest
	} = props;

	const chartRef = React.useRef();

	const ref = useComposeRefs(parentRef, chartRef);
	const [state, dispatch] = React.useReducer(reducer, {
		...getScales(x1, y1, x2, y2),
	});

	const [pointer, pointerSet] = React.useState();

	// NOTE(joel): Keep values coming from props in sync with the ones
	// stored in context.
	useUpdateEffect(() => {
		const scales = getScales(x1, y1, x2, y2);
		dispatch({ type: ActionTypes.UPDATE_SCALES, payload: { scales } });
	}, [x1, y1, x2, y2]);

	useRect(chartRef, {
		onChange: rect => {
			dispatch({ type: ActionTypes.RESIZE, payload: rect });
			if (isFunction(onResize)) {
				onResize(rect);
			}
		},
	});

	/**
	 * onMouseMove
	 * @param {React.MouseEventHandler<HTMLElement>} e
	 */
	const onMouseMove = e => {
		const bcr = chartRef.current.getBoundingClientRect();
		const left = e.clientX - bcr.left;
		const top = e.clientY - bcr.top;
		const x = state.xScaleInverse((100 * left) / (bcr.right - bcr.left));
		const y = state.yScaleInverse((100 * top) / (bcr.bottom - bcr.top));

		pointerSet({ x, y, left, top });
	};

	/**
	 * onMouseLeave
	 */
	const onMouseLeave = () => {
		pointerSet(null);
	};

	const context = {
		chartRef,
		state,
		dispatch,
	};

	return (
		<ChartContext.Provider value={context}>
			<ChartPointerContext.Provider value={pointer}>
				<div
					ref={ref}
					{...rest}
					style={{
						position: 'relative',
						display: 'block',
						width: '100%',
						height: '100%',
						...(clip ? { overflow: 'hidden' } : {}),
					}}
					onMouseMove={composeEventHandlers(rest.onMouseMove, onMouseMove)}
					onMouseLeave={composeEventHandlers(rest.onMouseLeave, onMouseLeave)}
				/>
			</ChartPointerContext.Provider>
		</ChartContext.Provider>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} GridProps
 * @prop {string} [as="div"]
 * @prop {boolean} [vertical=false]
 * @prop {number} [count]
 * @prop {Array[number]} [ticks]
 */

/**
 * Grid
 * @param {GridProps} props
 * @returns {JSX.Element}
 */
export const Grid = React.forwardRef((props, parentRef) => {
	const {
		as: Comp = 'div',
		vertical = false,
		count,
		ticks: parentTicks,
		children,
	} = props;

	const {
		state: { x1, y1, x2, y2, xScale, yScale },
	} = useChartContext();

	const ticks =
		parentTicks ||
		(!vertical ? getTicks(y1, y2, count) : getTicks(x1, x2, count));
	const style = !vertical
		? (n, i) => ({ width: '100%', height: '0', top: `${yScale(n, i)}%` })
		: (n, i) => ({ width: '0', height: '100%', left: `${xScale(n, i)}%` });

	return (
		<Comp ref={parentRef}>
			{ticks.map((tick, i) => (
				<div
					key={`${tick}-${i}`}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						...style(tick, i),
					}}
				>
					{isFunction(children)
						? children({
								value: tick,
								first: i === 0,
								last: i === ticks.length - 1,
						  })
						: null}
				</div>
			))}
		</Comp>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} SvgProps
 * @prop {boolean} [clip=false]
 */

/**
 * Svg
 * @param {SvgProps} props
 * @returns {JSX.Element}
 */
export const Svg = React.forwardRef((props, parentRef) => {
	const { clip = false, ...rest } = props;

	return (
		<svg
			ref={parentRef}
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			{...rest}
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				overflow: 'visible',
				...(clip ? { overflow: 'hidden' } : {}),
			}}
		/>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} SvgLineProps
 * @prop {string} [as="path"]
 * @prop {any} data
 * @prop {Function} [x=d => d.x]
 * @prop {Function} [y=d => d.y]
 */

/**
 * SvgLine
 * @param {SvgLineProps} props
 * @returns {JSX.Element}
 */
export const SvgLine = React.forwardRef((props, parentRef) => {
	const { as: Comp = 'path', data, x, y, ...rest } = props;

	const _x = x || defaultX;
	const _y = y || defaultY;

	const {
		state: { xScale, yScale },
	} = useChartContext();

	const d = React.useMemo(
		() =>
			'M' +
			data.map((d, i) => `${xScale(_x(d, i))},${yScale(_y(d, i))}`).join('L'),
		[_x, _y, data, xScale, yScale],
	);

	return (
		<Comp
			ref={parentRef}
			{...rest}
			d={d}
			style={{ vectorEffect: 'non-scaling-stroke' }}
		/>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} SvgScatterPlotProps
 * @prop {string} [as="path"]
 * @prop {any} data
 * @prop {Function} [x=d => d.x]
 * @prop {Function} [y=d => d.y]
 */

/**
 * SvgScatterPlot
 * @param {SvgScatterPlotProps} props
 * @returns {JSX.Element}
 */
export const SvgScatterPlot = React.forwardRef((props, parentRef) => {
	const { as: Comp = 'path', data, x, y, ...rest } = props;

	const _x = x || defaultX;
	const _y = y || defaultY;

	const {
		state: { xScale, yScale },
	} = useChartContext();

	const d = React.useMemo(
		() =>
			data
				.map((d, i) => {
					const scaledX = xScale(_x(d, i));
					const scaledY = yScale(_y(d, i));
					return `M${scaledX} ${scaledY} A0 0 0 0 1 ${scaledX + 0.0001} ${
						scaledY + 0.0001
					}`;
				})
				.join(' '),
		[_x, _y, data, xScale, yScale],
	);

	return (
		<Comp
			ref={parentRef}
			{...rest}
			d={d}
			style={{ vectorEffect: 'non-scaling-stroke' }}
		/>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} SvgPolygonProps
 * @prop {string} [as="path"]
 * @prop {any} data
 * @prop {Function} [x=d => d.x]
 * @prop {Function} [y=d => d.y]
 */

/**
 * SvgPolygon
 * @param {SvgPolygonProps} props
 * @returns {JSX.Element}
 */
export const SvgPolygon = React.forwardRef((props, parentRef) => {
	const { as: Comp = 'path', data, x, y, ...rest } = props;

	const _x = x || defaultX;
	const _y = y || defaultY;

	const {
		state: { xScale, yScale },
	} = useChartContext();

	const d = React.useMemo(
		() =>
			`M${data
				.map((d, i) => `${xScale(_x(d, i))},${yScale(_y(d, i))}`)
				.join('L')}`,
		[_x, _y, data, xScale, yScale],
	);

	return (
		<Comp
			ref={parentRef}
			{...rest}
			d={d}
			style={{ vectorEffect: 'non-scaling-stroke' }}
		/>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} SvgAreaProps
 * @prop {any} data
 * @prop {number} [floor=0]
 * @prop {Function} [x=d => d.x]
 * @prop {Function} [y=d => d.y]
 */

/**
 * SvgArea
 * @param {SvgAreaProps} props
 * @returns {JSX.Element}
 */
export const SvgArea = React.forwardRef((props, parentRef) => {
	const { data, floor = 0, x, y, ...rest } = props;

	const _x = x || defaultX;
	const _y = y || defaultY;

	const points = React.useMemo(
		() => [
			{ x: _x(data[0], 0), y: floor },
			...data.map((d, i) => ({ x: _x(d, i), y: _y(d, i) })),
			{ x: _x(data[data.length - 1], data.length - 1), y: floor },
		],
		[_x, _y, data, floor],
	);

	return <SvgPolygon ref={parentRef} {...rest} data={points} />;
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} SvgCircleProps
 * @prop {string} [as="path"]
 * @prop {Function} [x=d => d.x]
 * @prop {Function} [y=d => d.y]
 */

/**
 * SvgCircle
 * @param {SvgCircleProps} props
 * @returns {JSX.Element}
 */
export const SvgCircle = React.forwardRef((props, parentRef) => {
	const { as: Comp = 'circle', x, y, ...rest } = props;

	const {
		state: { xScale, yScale },
	} = useChartContext();

	const cx = React.useMemo(() => xScale(x), [x, xScale]);
	const cy = React.useMemo(() => yScale(y), [y, yScale]);

	return <Comp ref={parentRef} {...rest} cx={cx} cy={cy} />;
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} SvgRectProps
 * @prop {string} [as="path"]
 * @prop {number} [x1=0]
 * @prop {number} [x2=1]
 * @prop {number} [y1=0]
 * @prop {number} [y2=1]
 */

/**
 * SvgRect
 * @param {SvgRectProps} props
 * @returns {JSX.Element}
 */
export const SvgRect = React.forwardRef((props, parentRef) => {
	const { as: Comp = 'rect', x1 = 0, x2 = 1, y1 = 0, y2 = 1, ...rest } = props;

	const {
		state: { xScale, yScale },
	} = useChartContext();

	const left = React.useMemo(() => xScale(x1), [x1, xScale]);
	const right = React.useMemo(() => xScale(x2), [x2, xScale]);
	const top = React.useMemo(() => yScale(y1), [y1, yScale]);
	const bottom = React.useMemo(() => yScale(y2), [y2, yScale]);

	return (
		<Comp
			ref={parentRef}
			{...rest}
			x={Math.min(left, right)}
			y={Math.min(top, bottom)}
			width={Math.abs(right - left)}
			height={Math.abs(bottom - top)}
		/>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} PointProps
 * @prop {string} [as="div"]
 * @prop {number} x
 * @prop {number} y
 */

/**
 * Point
 * @param {PointProps} props
 * @returns {JSX.Element}
 */
export const Point = React.forwardRef((props, parentRef) => {
	const { as: Comp = 'div', x, y, ...rest } = props;

	const {
		state: { xScale, yScale },
	} = useChartContext();

	return (
		<Comp
			ref={parentRef}
			{...rest}
			style={{
				position: 'absolute',
				width: 0,
				height: 0,
				left: `${xScale(x)}%`,
				top: `${yScale(y)}%`,
			}}
		/>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} BoxProps
 * @prop {string} [as="div"]
 * @prop {number} [x1=0]
 * @prop {number} [x2=1]
 * @prop {number} [y1=0]
 * @prop {number} [y2=1]
 */

/**
 * Box
 * @param {BoxProps} props
 * @returns {JSX.Element}
 */
export const Box = React.forwardRef((props, parentRef) => {
	const {
		as: Comp = 'div',
		x1 = 0,
		x2 = 1,
		y1 = 0,
		y2 = 1,
		style: parentStyle,
		...rest
	} = props;

	const {
		state: { xScale, yScale },
	} = useChartContext();

	const style = React.useMemo(() => {
		const _x1 = xScale(x1);
		const _x2 = xScale(x2);
		const _y1 = yScale(y1);
		const _y2 = yScale(y2);
		const left = Math.min(_x1, _x2);
		const right = Math.max(_x1, _x2);
		const top = Math.min(_y1, _y2);
		const bottom = Math.max(_y1, _y2);

		return {
			left: `${left}%`,
			bottom: `${100 - bottom}%`,
			width: `${right - left}%`,
			height: `${bottom - top}%`,
		};
	}, [x1, x2, xScale, y1, y2, yScale]);

	return (
		<Comp
			ref={parentRef}
			{...rest}
			style={{ ...parentStyle, position: 'absolute', ...style }}
		/>
	);
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} ColumnsProps
 * @prop {string} [as="div"]
 * @prop {number} [width=1]
 * @prop {(d: number) => number} [x]
 * @prop {(d: number) => number} [y]
 * @prop {React.ReactNode} [children]
 */

/**
 * Columns
 * @param {ColumnsProps} props
 * @returns {JSX.Element}
 */
export const Columns = props => {
	const { data, width = 1, x, y, children } = props;

	const _x = x || defaultX;
	const _y = y || defaultY;

	return data.map((d, i) => {
		const value = d;
		const first = i === 0;
		const last = i === data.length - 1;

		return (
			<Box
				key={i}
				x1={_x(d, i) - width / 2}
				x2={_x(d, i) + width / 2}
				y1={0}
				y2={_y(d, i)}
			>
				{isFunction(children) ? children({ value, first, last }) : children}
			</Box>
		);
	});
};

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} BarsProps
 * @prop {string} [as="div"]
 * @prop {number} [height=1]
 * @prop {(d: number) => number} [x]
 * @prop {(d: number) => number} [y]
 * @prop {React.ReactNode} [children]
 */

/**
 * Bars
 * @param {BarsProps} props
 * @returns {JSX.Element}
 */
export const Bars = React.forwardRef((props, parentRef) => {
	const { data, height = 1, x, y, children } = props;

	const _x = x || defaultX;
	const _y = y || defaultY;

	return data.map((d, i) => {
		const value = d;
		const first = i === 0;
		const last = i === data.length - 1;

		return (
			<Box
				key={i}
				ref={parentRef}
				y1={_y(d, i) - height / 2}
				y2={_y(d, i) + height / 2}
				x1={0}
				x2={_x(d, i)}
			>
				{isFunction(children) ? children({ value, first, last }) : children}
			</Box>
		);
	});
});

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} QuadtreeProps
 * @prop {string} [as="div"]
 * @prop {any} data
 * @prop {Function} [x=d => d.x]
 * @prop {Function} [y=d => d.y]
 * @prop {number} [radius=Infinity]
 * @prop {React.ReactNode} [children]
 */

/**
 * Quadtree
 * @param {QuadtreeProps} props
 * @returns {JSX.Element}
 */
export const Quadtree = props => {
	const { data, x, y, radius = Infinity, onChange, children } = props;

	const {
		state: { xScale, yScale, width, height },
	} = useChartContext();
	const pointer = useChartPointerContext();

	const _x = x || defaultX;
	const _y = y || defaultY;

	const [closest, closestSet] = React.useState(undefined);

	const quadtree = React.useMemo(() => {
		const qt = new QT(data);
		qt.update(_x, _y, xScale, yScale);
		return qt;
	}, [_x, _y, data, xScale, yScale]);

	const prevClosest = React.useRef();

	React.useEffect(() => {
		const nextClosest =
			pointer != null
				? quadtree.find(pointer.left, pointer.top, width, height, radius)
				: null;

		if (nextClosest !== prevClosest.current) {
			prevClosest.current = nextClosest;
			closestSet(nextClosest);
			if (isFunction(onChange)) {
				onChange(nextClosest);
			}
		}
	}, [quadtree, height, pointer, radius, width, onChange]);

	return (
		<React.Fragment>
			{closest ? (isFunction(children) ? children(closest) : children) : null}
		</React.Fragment>
	);
};

////////////////////////////////////////////////////////////////////////////////

/**
 * useChartContext
 * @returns {React.Context<ChartContextValue>}
 */
function useChartContext() {
	return React.useContext(ChartContext);
}

////////////////////////////////////////////////////////////////////////////////

/**
 * useChartPointerContext
 * @returns {React.Context<ChartPointerContextValue>}
 */
function useChartPointerContext() {
	return React.useContext(ChartPointerContext);
}
