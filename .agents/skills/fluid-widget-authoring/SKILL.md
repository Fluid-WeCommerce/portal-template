---
name: fluid-widget-authoring
description: Use when creating, modifying, reviewing, validating, building, or publishing Fluid widgets in generated portal projects or standalone widget projects, including manifest metadata, property schemas, runtime CSS, widget previews, validation, build, and publish workflows.
---

# Fluid Widget Authoring

Use this skill when creating, modifying, reviewing, validating, building, or publishing Fluid widgets.

This skill supports two generated-project contexts:

- **Generated portal projects:** use `pnpm widget:create <name>` or `pnpm exec fluid portal widget create <name>` for company-owned portal widgets. The scaffold writes widget source under `src/widgets/<name>/` and registers manifests through the portal config/tooling.
- **Generated standalone widget projects:** use the widget CLI project structure and publish flow for droplet-owned or independently versioned widget packages.

## Boundaries

- Widget code belongs under `src/widgets/` in both generated portal-widget scaffolds and standalone widget projects.
- In generated portal projects, keep portal definition work in `portal/` and widget work in `src/widgets/`.
- In standalone widget projects, do not add a portal app, droplet scaffold, backend, Rails code, or Next.js structure.
- In standalone widget projects, package metadata lives in root `manifest.ts`, CLI ownership config lives in `fluid.widget.config.ts`, and runtime registration lives in `src/index.ts`.
- Keep runtime CSS in `styles.css` or files imported by `manifest.ts`, widget manifests, or widget modules so build tooling discovers CSS artifacts.

## Manifest checklist

Use `defineWidget()` and `defineWidgetPackage()` from `@fluid-app/portal-sdk`.

For each widget:

- `name`: stable URL-safe name. Changing it changes the generated widget type.
- `component`: host-safe React component.
- `displayName`, `description`, `icon`, `category`: builder palette metadata.
- `defaultProps`: JSON-serializable defaults only.
- `propertySchema`: builder fields, also JSON-serializable.
- `container`: `block`, `card`, `inline`, or `fullscreen`.
- `resizable`: omit/false, true, `horizontal`, `vertical`, `both`, or an object with axis flags and optional min sizes.

For the package:

- Keep `packageType` as `droplet`.
- Keep `remoteEntryUrl` as `widget.js` unless the publish flow changes.
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

CSS must be imported by `manifest.ts` or a widget module. Prefix selectors with the widget name and do not rely on global body styles for published runtime output.

## Preflight

Run before marking widget work complete:

```bash
pnpm typecheck
pnpm validate
pnpm build
```

For publish readiness, also run:

```bash
pnpm run widget:publish -- --dry-run
```

Common failures:

- Missing droplet UUID: run `pnpm run widget:link` or pass a droplet option.
- No source package found: ensure `fluid.widget.config.ts` exports the package from `manifest.ts`.
- Invalid package type: keep `packageType: "droplet"`.
- Invalid name/key/version: use URL-safe identifiers and SemVer without build metadata.
- Non-serializable metadata: remove functions, undefined, Dates, NaN, Infinity, Maps, Sets, and class instances.
- Missing published CSS: import CSS from the build graph.
- Preview-only success: remove local-only URLs and guard browser APIs.
