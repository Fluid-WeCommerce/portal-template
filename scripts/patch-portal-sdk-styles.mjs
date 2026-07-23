// Workaround for a publishing gap in @fluid-app/portal-sdk@0.1.460:
// dist/styles/packages.css keeps a relative `@import "./remote-widget-fullscreen.css"`,
// but the SDK's flatten-published-styles script does not copy that file into
// dist/styles/, so Tailwind's Vite plugin hard-fails resolving it on build.
// The file DOES ship in the package's source styles/ directory — copy it into
// place when missing. This is a no-op once the SDK publishes the file in
// dist/styles/, at which point this script (and the postinstall hook) can be
// deleted.
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const sdkRoot = join(
  fileURLToPath(new URL("..", import.meta.url)),
  "node_modules",
  "@fluid-app",
  "portal-sdk",
);
const src = join(sdkRoot, "styles", "remote-widget-fullscreen.css");
const dest = join(sdkRoot, "dist", "styles", "remote-widget-fullscreen.css");

if (existsSync(src) && !existsSync(dest)) {
  copyFileSync(src, dest);
  console.log(
    "patched @fluid-app/portal-sdk: copied remote-widget-fullscreen.css into dist/styles",
  );
}
