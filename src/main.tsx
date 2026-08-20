import { createPortal } from "@fluid-app/portal-sdk";
import fluidComponentCssUrl from "@fluid-app/portal-sdk/remote-widget-shadow.css?url";
import { customPages } from "./portal.config";
import "./index.css";

createPortal({
  customPages,
  remoteWidgets: { fluidComponentCssUrls: [fluidComponentCssUrl] },
});
