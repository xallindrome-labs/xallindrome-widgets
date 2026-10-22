import { PlatoIntakeForm } from "./PlatoIntakeForm";
import { ensureWidgetStyles } from "./styles";

export function App() {
  ensureWidgetStyles();
  return <PlatoIntakeForm turnstileSiteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} />;
}
