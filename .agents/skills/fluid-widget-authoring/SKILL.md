---
name: fluid-widget-authoring
description: Use when creating, modifying, reviewing, validating, building, or publishing Fluid widgets in generated portal projects or standalone widget projects, including manifest metadata, property schemas, runtime CSS, development endpoints, validation, build, and publish workflows.
---

# Fluid Widget Authoring

Use this skill when creating, modifying, reviewing, validating, building, or publishing Fluid widgets.

This skill supports two generated-project contexts with different sources and
release commands:

- **Generated portal projects:** use `pnpm widget:create <name>` or `pnpm exec fluid portal widget create <name>` for company-owned portal widgets. The scaffold writes widget source under `src/widgets/<name>/`; `src/widgets.config.ts` is the package source consumed by `fluid portal deploy`.
- **Generated standalone widget projects:** use the widget CLI for droplet-owned packages. `manifest.ts` is the authoring source, `fluid.widget.config.ts` links ownership, and `fluid widget publish` releases the package.

## Boundaries

- Widget code belongs under `src/widgets/` in both generated portal-widget scaffolds and standalone widget projects.
- In generated portal projects, keep portal definition work in `portal/` and widget work in `src/widgets/`.
- In standalone widget projects, do not add a portal app, droplet scaffold, backend, Rails code, or Next.js structure.
- In standalone widget projects, package metadata lives in root `manifest.ts`, CLI ownership config lives in `fluid.widget.config.ts`, and the Remote DOM worker entry lives in `src/index.ts`.
- Keep runtime CSS in `styles.css` or files imported by the worker build graph. Standalone projects keep a guarded import in `src/index.ts` so build tooling emits CSS without running style injection inside the worker.

## Manifest checklist

Use `defineWidget()`, `defineWidgetPackage()`, and `startWidgetPackage()` from `@fluid-app/portal-sdk/widgets/worker`.

For each widget:

- `name`: stable URL-safe name. Changing it changes the generated widget type.
- `component`: host-safe React component.
- `displayName`, `description`, `icon`, `category`: builder palette metadata.
- `defaultProps`: JSON-serializable defaults only.
- `propertySchema`: builder fields, also JSON-serializable.
- `container`: `block`, `card`, `inline`, or `fullscreen`.
- `uses`: every typed portal function the widget calls. Pass the function values themselves; do not write capability names by hand.
- `resizable`: omit/false, true, `horizontal`, `vertical`, `both`, or an object with axis flags and optional min sizes.

For a company package in a generated portal project:

- Keep the package definition in `src/widgets.config.ts`.
- Omit `packageType` or set it to `company`.
- Set a stable `packageStableId`; `defineWidgetPackage()` requires it for company packages.
- Do not add a worker entry. `fluid portal deploy` builds the company package into its Remote DOM worker artifact.

For a standalone droplet package:

- Keep `packageType` as `droplet`.
- Keep the package definition in root `manifest.ts` and export it through `fluid.widget.config.ts`.
- Do not author runtime artifact URLs. Dev and build inject `workerEntryUrl` into the canonical package descriptor.
- Built manifests use package-local artifact paths; the catalog resolves them to absolute public URLs before a host loads the descriptor.
- Droplet package IDs remain fully qualified as `droplet.<linked-droplet-key>` in dev, build, and catalog output.
- Keep `version` as SemVer without build metadata.
- Keep at least one widget in `widgets`.
- Do not manually set `packageStableId` in this generated droplet template; the CLI injects the linked droplet key.

## Property schema quick reference

Top-level keys:

- `tabsConfig`: optional tabs with `id` and `label`.
- `fields`: editable controls.
- `dataSourceTargetProps`: prop keys that data sources may populate.
- `itemConfigSchema`: optional per-item fields for custom data-source item settings.
- Avoid `validate` in standalone published metadata because metadata must be serializable.

Base field keys:

- `key`, `label`, and `type` are required.
- Optional: `description`, `defaultValue`, `tab`, `group`, `advanced`, `requiresKeyValue`.
- `advanced: true` is for lower-frequency theme/style overrides.
- `requiresKeyValue` can be one condition or an array of AND conditions.

Supported field types:

- `text`: single-line string; supports `placeholder`, `maxLength`, `tokenSuggestions`.
- `textarea`: multi-line string; supports `placeholder`, `rows`, `maxLength`.
- `number`: numeric input; supports `min`, `max`, `step`.
- `boolean`: toggle.
- `select`: dropdown; requires `options` with `label` and `value`.
- `color`: basic color value.
- `range`: slider; requires `min`, `max`; optional `step`.
- `dataSource`: data-source configuration.
- `resource`: resource picker; optional `allowedTypes`.
- `image`: media picker; optional `accept` as `image`, `video`, or `any`.
- `alignment`: alignment picker; requires vertical/horizontal enabled flags.
- `slider`: numeric slider; supports `min`, `max`, `step`, `unit`.
- `colorPicker`: color picker; supports `swatches`.
- `sectionHeader`: visual header; supports `subtitle`.
- `separator`: visual divider.
- `buttonGroup`: segmented control; requires options with `value` and optional labels/icons.
- `colorSelect`: semantic theme color selector; supports `excludeColors`.
- `sectionLayoutSelect`: visual layout selector.
- `background`: combined background resource/color control.
- `contentPosition`: 3-by-3 position picker.
- `textSizeSelect`: theme text size selector.
- `cssUnit`: number plus unit; supports unit allowlist/default and per-unit min/max/step maps.
- `fontPicker`: Google font picker; supports `placeholder`.
- `stringArray`: editable list of strings; supports `placeholder`.
- `borderRadius`: four-corner radius editor; requires `keys.topLeft`, `keys.topRight`, `keys.bottomLeft`, `keys.bottomRight`.
- `screenPicker`: portal screen picker; supports `includeSystemItems`.

## Data-source-ready props

- Add bindable prop names to `dataSourceTargetProps`.
- Make components resilient to missing, empty, or partial prop data.
- Render empty states for empty arrays and invalid items.
- Keep defaults in `defaultProps` so manual use works before a data source is connected.
- Use `itemConfigSchema` for per-selected-item settings.
- Do not fetch directly when props/data sources can provide data.

## Component quality and accessibility

- Use typed props and defaults.
- Guard unsafe array/object access.
- Keep render deterministic and side-effect free.
- Clean up effects.
- Keep bundles small and avoid unnecessary large dependencies.
- Never put secrets or tenant credentials in widget source, props, or defaults.
- Use semantic HTML.
- Ensure keyboard access and visible focus states.
- Add labels or accessible names to controls.
- Add alt text for meaningful media.
- Keep heading order logical.
- Respect reduced motion.
- Use theme foreground/background pairs for contrast.

## Theme and CSS

Prefer Fluid semantic CSS variables:

- Surface and text: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`.
- Brand/actions: `--primary`, `--primary-foreground`.
- Supporting UI: `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`.
- Status/chrome: `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`.
- Charts: `--chart-1` through `--chart-5`.
- Radius: `--radius`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`.
- Fonts and sizes may be available as `--font-header`, `--font-body`, and `--font-size-*` theme aliases.

Tailwind equivalents, when Tailwind is available, are semantic utilities such as `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`, `ring-ring`, and `rounded-lg`. Plain CSS is the most portable runtime default for this template.

Light/dark mode is controlled by host theme variables and may use `data-theme-mode="dark"`. Prefer tokens so light and dark work automatically. If a mode-specific rule is necessary, scope it to the dark-mode attribute and still use tokens.

CSS must be reachable from `src/index.ts` or another worker module. Prefix selectors with the widget name and do not rely on global body styles for published runtime output.

## Remote DOM runtime

- In a company portal project, `src/widgets.config.ts` is authoring input; the portal CLI generates the worker artifact. Do not add a hand-written worker bootstrap.
- In a standalone widget project, `src/index.ts` calls `startWidgetPackage(widgetPackage)` exactly once.
- Generated portals read company packages from the authenticated `/api/app/widget-packages` catalog.
- Standalone widget dev exposes `/__widget-packages__` as the local canonical descriptor endpoint and `/__runtime-entry__` as the worker entry. It does not bundle a second host or iframe preview application.
- Do not add global widget registries, classic script loaders, or direct React host previews.
- Call typed portal functions from `@fluid-app/portal-sdk/widgets/worker` directly and list each function in `defineWidget({ uses: [...] })`.

## Typed portal functions

Built-in worker functions are `getUserAccount`, `getStore`, `getPortalApp`,
`getPortalProfile`, `getNavigationState`, `buildPortalHref`, `navigateTo`,
`getFullscreenState`, `requestFullscreen`, and `exitFullscreen`. Getters await
and return resolved data; they do not return query-status snapshots.

```ts
import {
  defineWidget,
  getUserAccount,
  navigateTo,
} from "@fluid-app/portal-sdk/widgets/worker";

async function openProfile(): Promise<void> {
  const account = await getUserAccount();
  await navigateTo(account.slug);
}

export const profileButton = defineWidget({
  name: "ProfileButton",
  component: ProfileButton,
  uses: [getUserAccount, navigateTo],
});
```

`defineWidget()` derives and deduplicates descriptor declarations from `uses`.
The worker and host both enforce those declarations. If a call fails with
`PortalFunctionError` code `NOT_DECLARED`, add the called function to that
widget's `uses` array. Do not author a raw `capabilities` array.

The account result is intentionally allowlisted. It may include email, but it
does not expose phone numbers, addresses, payment data, credentials,
government or tax identifiers, dates of birth, raw metadata, or unknown future
fields. There is no `tenantClient` worker API.

For a company-specific operation, create one typed function definition shared
by worker and host:

```ts
export const getQuote = definePortalFunction<QuoteResult, QuoteRequest>({
  capability: "company.example.quotes",
  version: "1",
  method: "get",
});
```

Call `getQuote(input)` directly in the worker and include `getQuote` in `uses`.
The portal host installs the implementation with
`implementPortalFunction(getQuote, handler)` in `remoteWidgets.functions`.
Built-ins cannot be overridden and duplicate custom implementations are
rejected.

Custom inputs and outputs are JSON-only: null, booleans, finite numbers,
strings, arrays, and objects made from those values. Do not pass `undefined`,
functions, Dates, Maps, Sets, class instances, `NaN`, or `Infinity`. Types
describe the contract and runtime validation guards the protocol boundary.

## Company portal widget preflight

In a generated portal project, validate and dry-run the company package with:

```bash
pnpm typecheck
pnpm build
pnpm exec fluid portal deploy --dry-run
```

Publish company-owned runtime artifacts with `fluid portal deploy`. This does
not push `portal/` JSON or deploy the hosted portal shell.

## Standalone droplet widget preflight

In a generated standalone widget project, run:

```bash
pnpm typecheck
pnpm validate
pnpm build
```

For standalone publish readiness, also run:

```bash
pnpm run widget:publish --dry-run
```

Publish the linked droplet-owned package with `fluid widget publish`. Do not use
`fluid portal deploy` from a standalone project.

Common failures:

- Missing droplet UUID: run `pnpm run widget:link` or pass a droplet option.
- No source package found: ensure `fluid.widget.config.ts` exports the package from `manifest.ts`.
- Invalid package type: keep `packageType: "droplet"`.
- Invalid name/key/version: use URL-safe identifiers and SemVer without build metadata.
- Non-serializable metadata: remove functions, undefined, Dates, NaN, Infinity, Maps, Sets, and class instances.
- Missing published CSS: keep the guarded CSS import reachable from the worker build graph.
- Local development only succeeds: remove local-only URLs and guard browser APIs.
