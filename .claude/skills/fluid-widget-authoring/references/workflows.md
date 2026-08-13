# Development and publication

## Standalone widget project

Use the installed command reference for the complete command tree, arguments,
options, defaults, and current authentication requirements. The commands below
show the normal verification and publication sequence; they are not a command
catalog.

```bash
pnpm typecheck
pnpm validate
pnpm build
pnpm run widget:publish --dry-run
pnpm run widget:publish
```

Validation, build, and dry-run publication can use the Droplet ID already in
`fluid.widget.config.ts`. Actual publication requires Fluid CLI
authentication. Interactive linking also requires authentication; linking with
an explicit Droplet ID does not need a lookup.

Do not edit content under `.fluid/`. There is no separate preview application;
use a portal or builder host with the development endpoints documented by the
installed CLI reference.

## Company widget package in a portal project

Create a package with `fluid portal widget create`, then use the portal
project's typecheck, lint, build, and development host. `fluid portal deploy`
builds and publishes company widget artifacts from `src/widgets.config.ts`.
It does not publish portal JSON or deploy portal application assets.

The portal command tree has no `publish` command. Standalone packages publish
with `fluid widget publish`.

## Recovery

- Missing Droplet ID: link the standalone project or supply the Droplet
  option.
- Invalid owner: use `company` for portal-project packages and `droplet` for
  standalone packages.
- Invalid package key or version: use URL-safe identifiers and semantic
  versions without build metadata.
- Missing CSS: restore the generated root stylesheet and its standalone worker
  import when applicable.
- Build failure: preserve source and configuration, remove only generated
  output when a clean build is required, then rerun the failed command.
- Published versions are immutable; publish a new version instead of reusing
  one.
