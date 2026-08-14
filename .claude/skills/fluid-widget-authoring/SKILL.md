---
name: fluid-widget-authoring
description: Use when authoring, validating, building, or publishing company or Droplet Fluid Remote DOM widget packages.
---

# Fluid widget authoring

## Choose the workflow

- Standalone Droplet package: use `fluid widget` commands and the package's
  `manifest.ts` plus `fluid.widget.config.ts`.
- Company package inside a portal project: use `fluid portal widget create`,
  register the package in `src/widgets.config.ts`, and publish it with
  `fluid portal deploy`.

Do not copy configuration between these package types. Their owners and
publication endpoints differ.

## Authoring workflow

1. Inspect the project layout and preserve existing work.
2. Confirm whether the package is company-owned in a portal project or linked
   to a Droplet in a standalone widget project.
3. Inspect the current manifest and installed API reference before changing
   package metadata. Use the installed reference for the exact fields, values,
   portal functions, and capabilities supported by this SDK version.
4. Implement the component for missing, partial, and malformed JSON inputs.
5. Make the widget comply with the portal theme. Use semantic CSS variables and
   `colorSelect` fields. The legacy `color` field is deprecated. Add custom
   colors or styling properties only when the theme engine cannot represent an
   explicit product requirement.
6. Keep runtime CSS in the project-root `styles.css` and scope it to the
   widget. Company widget modules must not import CSS; preserve the standalone
   template's guarded worker import.
7. Typecheck, validate, build, and inspect the result in a portal host. Use a
   dry run before an authorized publication.

## Completion checks

- Defaults satisfy the property schema and render a useful initial state.
- Missing and malformed JSON do not crash rendering.
- Every portal function and capability in the component appears in `uses`.
- Keyboard, focus, labels, contrast, and reduced motion work.
- Light and dark themes work without literal color overrides.
- Generated artifacts were inspected but not edited or committed.
- The package version changed if an immutable published package changed.

## References

- [Package authoring](references/package-authoring.md)
- [Property fields](references/property-fields.md)
- [Portal functions](references/portal-functions.md)
- [Runtime, styling, accessibility, and security](references/runtime-and-styling.md)
- [Development and publication](references/workflows.md)
- [Installed widget API](../../../node_modules/@fluid-app/portal-sdk/authoring/widget-api/api.md)

Only one command reference is installed. Use the one that matches the project
type:

- Standalone widget project: [installed `fluid widget` commands](../../../node_modules/@fluid-app/fluid-cli-widget/authoring/commands.md)
- Portal project: [installed `fluid portal` commands](../../../node_modules/@fluid-app/fluid-cli-portal/authoring/commands.md)

If an LSP is unavailable, use the installed API reference. The installed
reference and declarations match the SDK version in this project.

Use the project scripts and installed command reference to select checks for
the current project type.
