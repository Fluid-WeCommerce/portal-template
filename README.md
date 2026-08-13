# fluid-portal-starter

A Fluid portal shell, local portal-definition workspace, and optional company
Remote DOM widget package.

## Start development

Requirements: Node.js, pnpm, and a Fluid CLI login or API token for remote
portal operations.

```bash
pnpm install
pnpm pull
pnpm dev
```

`pnpm dev` runs `fluid portal dev`, normally at http://localhost:5173. When
`portal/definition.json` is absent, it pulls the linked working definition
before starting. Pass `-- --skip-pull` only when the missing local definition
is intentional. The CLI installs portal JSON and widget-development Vite
plugins; bare Vite does not provide the same preview.

Localhost does not receive the production HttpOnly member handoff cookie.
Authenticated screens can return HTTP 401 even when local JSON and custom pages
render correctly.

## Project map

| Path | Owner and lifecycle |
| --- | --- |
| `.fluidrc` | Author-owned link to the remote portal definition. Change only when intentionally relinking. |
| `.env.example` | Committed environment template. Copy values to `.env` or `.env.local`; do not put secrets in the example. |
| `.env`, `.env.local` | Local credentials and overrides. Never commit. |
| `.gitignore` | Source-control exclusions for local, generated, and secret files. |
| `.oxlintrc.json` | Generated lint configuration. Change only when project lint policy changes. |
| `package.json` | Project scripts and dependencies. Author-owned after scaffold creation. |
| lockfile | Dependency resolution. Commit when dependency changes are intentional. |
| `tsconfig.json`, `vite.config.ts` | TypeScript and Vite build configuration. |
| `index.html` | Vite HTML entry and portal mount element. |
| `README.md` | Human setup, lifecycle, and recovery guidance. |
| `AGENTS.md`, `CLAUDE.md` | Root coding-agent guidance. `CLAUDE.md` points to the canonical `AGENTS.md`. |
| `portal/definition.json` | Pulled or author-edited portal metadata. Its `$schema` owns valid fields. |
| `portal/screens/` | Local screen resources. File names are screen slugs. |
| `portal/navigations/` | Local web or mobile navigation resources. References use file slugs. |
| `portal/profiles/` | Profile matching and navigation/theme assignments. |
| `portal/themes/` | Complete theme resources. Partial theme configs are invalid. |
| `.portal-sync/` | Pull/push snapshots used for drift and diff calculation. Generated; never edit or commit. |
| `src/main.tsx` | Portal shell entry. |
| `src/portal.config.ts` | Custom React page registration and portal shell configuration. |
| `src/widgets.config.ts` | Company widget package registration for development and `fluid portal deploy`. |
| `src/widgets/` | Company Remote DOM widget source when present. |
| `src/index.css` | Portal shell styling. Use portal semantic theme tokens. |
| `src/vite-env.d.ts` | Vite environment type declarations. |
| `.github/workflows/deploy.yml` | CDN build and shell-asset deployment workflow. |
| `.agents/skills/fluid-portal-authoring/` | Portal task procedures and reference guidance. |
| `.agents/skills/fluid-widget-authoring/` | Widget task procedures and reference guidance. |
| `.claude/skills/` | Compatibility view of the same skills. Do not maintain divergent instructions. |
| `dist/` | Generated portal shell assets from `pnpm build`. |
| `.fluid/widget-dist/` | Generated company widget publication artifacts. |
| `.fluid/widget-build/`, `.fluid/tmp/` | Generated temporary widget build state. |
| `.fluid-portal-scaffold-pending` | Transient create/clone marker used during interrupted scaffolds. |
| `node_modules/` | Installed dependencies. Generated. |

## Environment

| Variable | Use |
| --- | --- |
| `VITE_API_URL` | Optional browser BFF override. When absent, dev resolves the signed-in company and proxies `/api` to its tenant portal host. |
| `VITE_ASSET_BASE` | Production base URL for portal shell assets. |
| `FLUID_API_BASE` | Optional Fluid CLI API-base override. |
| `FLUID_API_TOKEN` | Fluid CLI token. The older `FLUID_TOKEN` name is also accepted. |

## Edit, validate, and review

Edit only the required resources under `portal/`. Follow each file's `$schema`.
The file name, not the display name, is the slug used by navigation, profiles,
and theme references. Use each resource's schema for the exact widget-tree and
cross-reference contract.

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm exec fluid portal doctor
git diff
```

Before a remote write, run `pnpm pull` when the remote working definition may
have changed. If local and remote changes conflict, preserve local edits, pull
the current state, reapply the intended change, and review the new diff.

## Push and activate

Push validates and writes the remote working definition. It writes resource
groups in phases; an earlier group can succeed before a later group fails. Fix
the reported phase and rerun after checking remote and `.portal-sync/` state.

Activation is separate. `fluid portal push --yes --activate` creates and
activates a live version only after every push phase succeeds. Do not activate
unless the task authorizes a live release.

A network-enabled third-party widget requires interactive approval. In a
non-interactive run, add `--allow-network-widgets`; `--yes` alone does not grant
network access. The grant is exact to package ID, package version, and
capability version and becomes stale when any value changes.

## Build and deployment boundaries

- `pnpm build` creates portal shell assets in `dist/`.
- `.github/workflows/deploy.yml` uploads `dist/` to GCS and invalidates Cloud
  CDN. Configure `GCP_PROJECT`, `GCS_BUCKET`, `CDN_URL_MAP`, `CDN_HOSTNAME`,
  `CDN_INVALIDATION_PATH`, and repository secret `GCP_SA_JSON`.
- `fluid portal deploy` builds and publishes company widget runtime artifacts
  from `src/widgets.config.ts` through `.fluid/widget-dist/`.

`fluid portal deploy` does not push portal JSON, activate a portal version, or
upload the portal shell. The GitHub workflow does not publish portal JSON or
widget package versions.

## Detailed guidance

- `.agents/skills/fluid-portal-authoring/SKILL.md`
- `.agents/skills/fluid-widget-authoring/SKILL.md`
- Installed portal API contract:
  `node_modules/@fluid-app/portal-sdk/authoring/portal-api/api.md`
- Installed portal command contract:
  `node_modules/@fluid-app/fluid-cli-portal/authoring/commands.md`
