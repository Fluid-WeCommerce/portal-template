# fluid-portal-starter

A Fluid portal shell built with `@fluid-app/portal-sdk` and the Fluid portal CLI.

This starter is designed for the Fluid OS definition workflow: pull the portal definition into local JSON, edit `portal/`, push the working/draft definition back to Fluid OS, then create and activate a version when it should go live.

## What's included

- **Portal shell** — Vite builds the hosted SDK shell assets.
- **Portal definition sync** — `pnpm pull` and `pnpm push` manage local Fluid OS JSON under `portal/`.
- **Deployment workflow** — GitHub Actions can build and upload the hosted shell assets in `dist/`.
- **Widget authoring support** — `pnpm widget:create <name>` scaffolds company-owned portal widgets.
- **AI authoring kit** — generated `AGENTS.md`, `CLAUDE.md`, `.agents/skills/...`, and `.claude/skills/...` files explain the supported portal and widget workflows.

## Quick start

```bash
pnpm install
pnpm pull
pnpm dev
```

Open the local URL printed by Vite, usually [http://localhost:5173](http://localhost:5173).

Useful commands:

```bash
pnpm dev        # Start Vite
pnpm build      # TypeScript build plus production bundle
pnpm preview    # Preview dist locally
pnpm typecheck  # TypeScript checks
pnpm lint       # OxLint
pnpm pull       # fluid portal pull
pnpm push       # fluid portal push
pnpm widget:create <name>  # scaffold a company-owned portal widget
```

Set `VITE_API_URL` in `.env` if you need to point the SDK at a non-default Fluid API host.

## Project structure

```text
.
├── AGENTS.md                                      # AI-agent guidance
├── CLAUDE.md                                      # Bridge to AGENTS.md
├── .agents/skills/fluid-portal-authoring/         # Portal sync workflow skill
├── .agents/skills/fluid-widget-authoring/         # Widget authoring skill
├── .claude/skills/fluid-portal-authoring/         # Claude-compatible copy
├── .claude/skills/fluid-widget-authoring/         # Claude-compatible copy
├── .github/workflows/deploy.yml                   # Hosted shell asset deployment
├── src/
│   ├── main.tsx                                   # createPortal bootstrap
│   ├── index.css                                  # Tailwind and SDK globals
│   ├── portal.config.ts                           # Custom page registration
│   ├── widgets.config.ts                          # Remote DOM widget package source
│   └── widgets/                                   # Created by pnpm widget:create
├── portal/                                        # Created/refreshed by fluid portal pull
└── .portal-sync/                                  # Generated sync metadata
```

## Supported portal authoring workflow

### 1. Pull remote Fluid OS definitions

```bash
pnpm pull
```

This runs `fluid portal pull` and writes `portal/` plus `.portal-sync/`.

- `portal/` contains local JSON for Fluid OS resources such as screens, themes, navigations, profiles, and definition metadata.
- `.portal-sync/` contains generated sync state for future diffs. Do not edit it by hand.

Pull before editing unless you intentionally want to work from the current local JSON.

### 2. Edit `portal/` JSON

Make portal definition changes inside `portal/`.

Guidelines:

- Keep JSON valid and deterministic.
- Preserve stable IDs, slugs, and cross-resource references unless intentionally changing them.
- Update related files together when a resource reference changes.
- Do not invent unsupported fields. Match the shapes produced by `pnpm pull`.
- Keep changes small enough to review.

### 3. Validate locally

Run checks that match the change:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

For visual/content changes, use local preview:

```bash
pnpm dev
```

Expected result: the portal shell starts and can load the local pulled portal definition where supported by the SDK/tooling.

### 4. Push local definition changes

```bash
pnpm push
```

This runs `fluid portal push`, compares local `portal/` JSON against sync state, and updates the remote working/draft definition.

Push does **not** publish changes live by itself.

### 5. Publish a live Fluid OS version

When the pushed working/draft definition is ready for users:

```bash
pnpm exec fluid portal version create --activate
```

Only run this when activation is intended. If publishing needs content, design, or release approval, stop and ask first.

## Command boundaries

Do not mix these up:

- `fluid portal pull` downloads the remote portal definition into `portal/`.
- `fluid portal push` syncs local `portal/` JSON to the remote working/draft definition.
- `fluid portal version create --activate` makes the remote working/draft definition live.
- `pnpm build` creates hosted shell assets in `dist/`.
- GitHub Actions deploys hosted shell assets from `dist/`.
- `fluid portal deploy` publishes company-owned widget runtime artifacts. It does not push portal JSON and does not upload hosted shell assets.

## Widget work

Company-owned portal widgets are supported through the portal widget scaffold:

```bash
pnpm widget:create stock-ticker
# or
pnpm exec fluid portal widget create stock-ticker
```

The scaffold writes widget source under `src/widgets/<name>/` and wires the widget manifest for portal tooling. Then use the generated widget authoring skill:

- `.agents/skills/fluid-widget-authoring/SKILL.md`
- `.claude/skills/fluid-widget-authoring/SKILL.md`

That skill covers widget manifests, property schemas, theme variables, runtime CSS, validation, build, and publish workflows.

## Hosted shell deployment

The included GitHub Actions workflow builds the portal and uploads `dist/` to Google Cloud Storage plus Cloud CDN.

1. Push to `main` or run the workflow manually.
2. The workflow runs `pnpm build`.
3. It syncs `dist/` to `gs://portals-cdn/fluid-portal-starter/assets/`.
4. It invalidates the CDN cache for this portal's asset prefix.

Setup:

1. Create a GCP service account with Storage Object Admin and Compute Load Balancer Admin roles.
2. Add the service account JSON key as a GitHub Actions secret named `GCP_SA_JSON`.
3. Set `CDN_HOSTNAME` in `.github/workflows/deploy.yml` to your Cloud CDN load balancer domain.
4. Update `GCP_PROJECT` and `CDN_URL_MAP` if your project differs from the defaults.

## AI authoring kit

Generated projects include portable guidance for AI coding tools:

- `AGENTS.md` — canonical project instructions.
- `CLAUDE.md` — plain-file bridge to `AGENTS.md`.
- `.agents/skills/fluid-portal-authoring/SKILL.md` — portal pull/edit/push/version workflow.
- `.agents/skills/fluid-widget-authoring/SKILL.md` — widget authoring and validation workflow.
- `.claude/skills/...` — Claude-compatible copies generated from the same template skill files.

## Learn more

- Fluid Commerce Documentation: https://docs.fluidcommerce.com
- Vite Documentation: https://vite.dev
- React Documentation: https://react.dev
