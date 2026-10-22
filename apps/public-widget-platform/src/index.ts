type ScriptWidgetApi = {
  mount: (target: string | HTMLElement, options?: Record<string, unknown>) => void;
  unmount?: (target: string | HTMLElement) => void;
};

type MountOptions = {
  widgetId: string;
  scriptUrl: string;
  props?: Record<string, unknown>;
  globalName: string;
  integrity?: string;
};

const scriptLoadCache = new Map<string, Promise<void>>();
const mountedWidgets = new Map<HTMLElement, { widgetId: string; globalName: string }>();

function getTarget(target: string | HTMLElement): HTMLElement {
  if (typeof target === "string") {
    const resolved = document.querySelector<HTMLElement>(target);
    if (!resolved) {
      throw new Error(`Widget mount target not found: ${target}`);
    }
    return resolved;
  }
  return target;
}

function loadScript(url: string, integrity?: string): Promise<void> {
  if (scriptLoadCache.has(url)) {
    return scriptLoadCache.get(url) as Promise<void>;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.crossOrigin = "anonymous";
    if (integrity) {
      script.integrity = integrity;
    }
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed loading script: ${url}`));
    document.head.appendChild(script);
  });

  scriptLoadCache.set(url, promise);
  return promise;
}

export async function mount(target: string | HTMLElement, options: MountOptions): Promise<void> {
  const element = getTarget(target);
  await loadScript(options.scriptUrl, options.integrity);

  const globalName = options.globalName;
  const api = (window as unknown as Record<string, unknown>)[globalName] as
    | ScriptWidgetApi
    | undefined;
  if (!api?.mount) {
    throw new Error(`Global widget API ${globalName} not found after script load.`);
  }

  api.mount(element, options.props);
  mountedWidgets.set(element, { widgetId: options.widgetId, globalName });
}

export function unmount(target: string | HTMLElement, widgetId?: string): void {
  const element = getTarget(target);
  const record = mountedWidgets.get(element);
  if (!record) {
    return;
  }
  if (widgetId && widgetId !== record.widgetId) {
    return;
  }
  const api = (window as unknown as Record<string, unknown>)[record.globalName] as
    | ScriptWidgetApi
    | undefined;
  if (api?.unmount) {
    api.unmount(element);
  }
  mountedWidgets.delete(element);
}

export type { MountOptions };

const sdk = { mount, unmount };

declare global {
  interface Window {
    XallindromeWidgets?: typeof sdk;
  }
}

window.XallindromeWidgets = sdk;
