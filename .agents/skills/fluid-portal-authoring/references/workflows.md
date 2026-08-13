# Preview, synchronization, and deployment

## Local preview

Use `pnpm dev`, which runs `fluid portal dev`. The CLI reads the local portal
resources, pulls when `portal/` is missing, and installs its Vite integration.
Do not replace it with bare Vite for portal definition work.

When `VITE_API_URL` is unset, development resolves the signed-in company and
proxies `/api` to its tenant portal host. The override changes routing, not
authentication. Localhost does not have the HttpOnly member handoff cookie, so
authenticated screens can return HTTP 401.

Preview can skip malformed JSON. It preserves unresolved navigation entries
without attaching a screen ID. It selects the profile marked `default: true`,
or the first profile when none is marked default, and does not reproduce every
production permission decision.

## Pull, push, and versions

Use the installed command reference for the complete command tree, arguments,
options, and defaults. Pull reads the remote working definition, push writes
the working definition, and version activation changes the live definition.
Treat those as separate effects even when one command can combine phases.

`--yes` does not approve a newly network-enabled widget. Use interactive
approval or add `--allow-network-widgets` after package review.

Push writes screens and themes, then navigations, then profiles. A failed phase
skips later phases. Successful resources can advance their sync snapshot, so
fix the reported phase and rerun instead of assuming the entire operation was
rolled back.

## Deployment boundaries

- `pnpm build` creates portal application assets in `dist/`.
- `.github/workflows/deploy.yml` uploads those assets to the configured CDN.
- `fluid portal deploy` builds and publishes company widget artifacts from
  `src/widgets.config.ts`.
- `fluid widget publish` publishes a standalone Droplet widget package.

Portal deploy does not push portal JSON, activate a portal version, publish
standalone widgets, or upload the portal application bundle.

Read the generated workflow and its adjacent environment template for the
complete deployment-variable contract. Do not copy that list into this skill.

## Recovery

- Authentication failure: correct the selected profile or token and retry.
- Invalid JSON or reference: fix the named local resource and validate again.
- Remote drift: preserve local edits, pull, reapply the intended diff, and
  push again.
- Failed activation: inspect remote version state before creating another
  version.
- Another machine: use `fluid portal clone <app-name>`, then pull.
