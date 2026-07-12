import { createPreview } from "@fluid-app/portal-sdk/preview";
import {
  isSourceWidgetPackage,
  sourceWidgetPackagesToManifests,
} from "@fluid-app/portal-sdk";
import * as portalConfig from "./portal.config";
import "./index.css";

type PreviewOptions = NonNullable<Parameters<typeof createPreview>[0]>;
type PreviewCustomWidgets = NonNullable<PreviewOptions["customWidgets"]>;

const config = portalConfig as typeof portalConfig & {
  readonly customWidgets?: PreviewCustomWidgets;
  readonly widgetPackage?: unknown;
  readonly widgetPackages?: readonly unknown[];
  readonly default?: unknown;
};
type SourceWidgetPackage = Parameters<
  typeof sourceWidgetPackagesToManifests
>[0][number];

const sourcePackages: SourceWidgetPackage[] = [];
const seenSourcePackageIds = new Set<string>();
for (const candidate of [
  config.widgetPackage,
  ...(Array.isArray(config.widgetPackages) ? config.widgetPackages : []),
  config.default,
]) {
  if (!isSourceWidgetPackage(candidate)) continue;
  if (seenSourcePackageIds.has(candidate.packageId)) continue;
  seenSourcePackageIds.add(candidate.packageId);
  sourcePackages.push(candidate);
}
const customWidgets = [
  ...(config.customWidgets ?? []),
  ...sourceWidgetPackagesToManifests(sourcePackages),
];

createPreview({ customWidgets });
