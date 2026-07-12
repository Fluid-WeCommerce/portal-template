# AGENTS.md

Guidance for AI coding tools working in this generated Fluid portal project.

This project is primarily authored through the Fluid OS portal definition sync workflow. Author portal structure, routes, and content through pulled Fluid OS JSON under `portal/` unless a human explicitly asks for a different architecture.

## Source of truth

- Use `.agents/skills/fluid-portal-authoring/SKILL.md` for portal definition work.
- Use `.agents/skills/fluid-widget-authoring/SKILL.md` for company widget creation with `pnpm widget:create`, widget manifests, property schemas, runtime CSS, validation, build, and publish work.
- `.claude/skills/...` contains the same generated skills for Claude-compatible tools.

## Portal workflow

1. Run `pnpm pull` to sync the remote Fluid OS definition into `portal/`.
2. Edit the pulled JSON under `portal/`.
3. Validate locally with `pnpm typecheck`, `pnpm lint`, and `pnpm build` when applicable.
4. Run `pnpm push` to sync local `portal/` JSON back to the remote working/draft definition.
5. Run `pnpm exec fluid portal version create --activate` only when the pushed definition should become live.

Do not edit `.portal-sync/` by hand. It is generated sync metadata.

## Command boundaries

- `pnpm pull` / `fluid portal pull`: downloads the portal definition into `portal/`.
- `pnpm push` / `fluid portal push`: updates the remote working/draft definition from local JSON.
- `fluid portal version create --activate`: publishes the remote working/draft definition as the live version.
- `pnpm build`: builds the hosted portal shell assets into `dist/`.
- `fluid portal deploy`: publishes company-owned widget runtime artifacts, not portal JSON and not shell assets.

## Quality bar

- Keep portal JSON valid and references consistent.
- Preserve stable IDs and slugs unless the change intentionally renames them.
- Keep the portal shell thin; do not fork SDK internals into this app.
- For widget changes, use `pnpm widget:create <name>` / `fluid portal widget create <name>` and follow the copied `fluid-widget-authoring` skill before editing manifests or schemas.
