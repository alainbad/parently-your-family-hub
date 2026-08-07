import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.parentlybabytracking.app",
  appName: "Parently",
  webDir: ".output/public",
  // The app is server-rendered (TanStack Start + Nitro), so there's no static
  // bundle to ship on-device. The native shell loads the live site instead —
  // webDir above only supplies the offline/first-launch fallback page.
  // Capacitor's native bridge (and RevenueCat's plugin) still work normally
  // against remote content, since it's injected at the WebView level.
  server: {
    url: "https://parently-babytracking.com",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
