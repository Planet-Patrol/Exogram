import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';
import { ChartDataGenerator, TicChartType } from '../charts/ChartDataGenerator';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import LinkedChartController from '../charts/LinkedChartController';
import { MOMENTUM_DUMP_WIDTH } from '../charts/MomentumDumpAnnotationGenerator';
import { getChartOptions } from '../charts/defaultOptions';
import { createGenerator } from '../charts/chartDataHandler';

ChartJS.register(
  zoomPlugin,
  annotationPlugin,
  CrosshairPlugin,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Default Styling
ChartJS.defaults.color = '#fff';
ChartJS.defaults.font.family =
  "'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

export default function Chart(props: { type: TicChartType; tics: string[]; linkController?: LinkedChartController }) {
  const [data, setData] = useState<any>(null);

  const [tooltipData, setTooltipData] = useState<any>(null);
  const [clean, setClean] = useState(false);

  const [generator, setGenerator] = useState<ChartDataGenerator>();

  const [persistentOptions, setPersistentOptions] = useState<any>(getChartOptions());

  const [xMin, setXMin] = useState(0);
  const [xMax, setXMax] = useState(0);

  const [annotations, setAnnotations] = useState<any>(null);
  const [momentumDumps, setMomentumDumps] = useState<{ tic: string; time: number }[]>([]);

  const [defaultXAxisBounds, setDefaultXAxisBounds] = useState<any>({ min: 0, max: -1 });

  // Listener for when user maniuplates chart
  // Dependent on Link Controller
  const onChartBoundsChange = useCallback(
    (state: { chart: ChartJS }) => {
      setXMin(state.chart.scales.x.min);
      setXMax(state.chart.scales.x.max);

      if (props.linkController) {
        props.linkController.recordUpdate(state.chart.scales.x.min, state.chart.scales.x.max);
      }
    },
    [props.linkController]
  );

  // Build Options Object
  const options = useMemo(() => {
    return {
      ...persistentOptions,
      scales: {
        ...persistentOptions.scales,
        x: {
          ...persistentOptions.scales.x,
          max: xMax,
          min: xMin,
        },
      },
      plugins: {
        ...persistentOptions.plugins,
        annotation: {
          ...persistentOptions.plugins.annotation,
          annotations: annotations,
        },
        zoom: {
          ...persistentOptions.plugins.zoom,
          zoom: {
            ...persistentOptions.plugins.zoom.zoom,
            onZoomComplete: onChartBoundsChange,
          },
          pan: {
            ...persistentOptions.plugins.zoom.pan,
            onPanComplete: onChartBoundsChange,
          },
        },
      },
    };
  }, [persistentOptions, xMax, xMin, annotations, onChartBoundsChange]);

  const chart = useRef<any>(null);

  function onTooltipUpdate(ctx: any) {
    setTooltipData({ points: ctx.tooltip.dataPoints });
  }

  useEffect(() => {
    setGenerator(createGenerator(props.type, props.tics));
  }, [props.tics, props.type]);

  // Generate Chart Data
  useEffect(() => {
    if (!generator) return;

    generator.generateData(clean).then(setData);
  }, [generator, clean]);

  // Generate Persistent Chart Options and Momentum Dump Annotations
  // These do not change so long as the generator is constant
  useEffect(() => {
    if (!generator) return;

    let options = generator.generateOptions();
    options.plugins.tooltip.external = onTooltipUpdate;
    options.scales.y.max = generator.getDefaultRange().max;
    options.scales.y.min = generator.getDefaultRange().min;

    generator.getMomentumDumps().then(({ annotations, momentumDumps }) => {
      setAnnotations(annotations);
      setMomentumDumps(momentumDumps);
    });

    setPersistentOptions(options);
  }, [generator]);

  // Generate Default X Axis Bounds
  useEffect(() => {
    if (!generator) return;

    generator.getDefaultXAxisBounds().then(({ min, max }) => {
      if (defaultXAxisBounds.max === -1 && defaultXAxisBounds.min === 0) {
        setDefaultXAxisBounds({ min, max });

        setXMin(min);
        setXMax(max);
      }
    });
  }, [generator, defaultXAxisBounds]);

  // Handle Link Controller Changes
  useEffect(() => {
    if (props.linkController) {
      return props.linkController.addChart((min, max) => {
        setXMin(min);
        setXMax(max);
      });
    }
  }, [props.linkController]);

  if (!data || !options) return null;

  return (
    <div className="chart" onMouseLeave={() => setTooltipData(null)}>
      <Scatter data={data} options={options} ref={chart} />
      {tooltipData && (
        <>
          <div className="tooltip">
            {tooltipData.points?.[0]?.raw.x && (
              <div className="text">
                Time: <span className="mono">{tooltipData.points[0].raw.x.toFixed(4)}</span>
              </div>
            )}
            {tooltipData.points?.map((p: any, i: number) => (
              <div
                className={`text color ${
                  momentumDumps.filter(
                    (m) => m.tic === p.dataset.label.replaceAll('TIC ', '') && Math.abs(m.time - p.raw.x) < MOMENTUM_DUMP_WIDTH / 2
                  ).length > 0
                    ? 'md'
                    : ''
                }`}
                key={i}
                style={{ backgroundColor: p.dataset.backgroundColor }}
              >
                {p.dataset.label}: <span className="mono">{p.raw.y.toFixed(6)}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div
        className="btn"
        onClick={() => {
          if (props.linkController) props.linkController.zoomTo(defaultXAxisBounds);
          else chart.current?.resetZoom();
        }}
      >
        Reset Zoom
      </div>
      {generator?.hasCleanData && (
        <div className="btn show-clean" onClick={() => setClean(!clean)}>
          {clean ? 'Show Raw' : 'Show Cleaned'}
        </div>
      )}
    </div>
  );
}
