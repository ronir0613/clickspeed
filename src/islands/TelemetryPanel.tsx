import { useTelemetryStore } from '../stores/telemetry';
import Telemetry from './Telemetry';

/**
 * Standalone telemetry panel island.
 * Reads state from the zustand store that CpsTest writes into.
 * Placed in <slot name="telemetry"> in TestLayout.
 */
export default function TelemetryPanel() {
  const { stats, state, duration, history } = useTelemetryStore();
  return (
    <Telemetry
      stats={stats}
      state={state}
      duration={duration}
      history={history}
    />
  );
}
