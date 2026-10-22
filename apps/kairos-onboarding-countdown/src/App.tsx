import { KairosOnboardingCountdown } from "./KairosOnboardingCountdown";
import { ensureWidgetStyles } from "./styles";

export function App() {
  ensureWidgetStyles();
  return <KairosOnboardingCountdown />;
}
