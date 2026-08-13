# Package authoring

Use `@fluid-app/portal-sdk/widgets/worker` for worker APIs. Read the installed
widget API before changing package or widget metadata. It is the authoritative
contract for the installed SDK version; this guide does not repeat its fields
or accepted values.

Keep package identity and widget names stable after publication. Publish a new
semantic version for each release. Do not author runtime artifact URLs; the
build and publication flow creates them.

Keep widget registration, defaults, property-schema metadata, and declared
uses together in the package manifest. Confirm that defaults satisfy the
schema and that every function or capability used at runtime is declared.

Company widget packages are registered in a portal project's
`src/widgets.config.ts`. Standalone widget packages are associated with an
existing Droplet through `fluid.widget.config.ts`. That file resolves and
exports the package from `manifest.ts`; it does not own package identity,
version, or widgets.

Use the portal JSON Schema for the exact third-party widget type and node
shape. Do not copy its pattern into project guidance or infer a type from an
empty catalog response.

All metadata that crosses the worker boundary must satisfy the installed
JSON-value types. Use those types instead of maintaining a separate list of
allowed or prohibited JavaScript values.
