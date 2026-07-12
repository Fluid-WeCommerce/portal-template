import type { WidgetManifest } from "@fluid-app/portal-sdk";

/**
 * Portal SDK integration point.
 *
 * Portal screens, themes, navigations, and profiles are authored through
 * the Fluid OS definition sync workflow: `pnpm pull`, edit `portal/`,
 * then `pnpm push`. Keep portal structure, routes, and content in the
 * pulled Fluid OS JSON files.
 *
 * Keep this file for widget manifests or source widget packages that need
 * to be available to the SDK preview/runtime.
 */
export const customWidgets: WidgetManifest[] = [];
