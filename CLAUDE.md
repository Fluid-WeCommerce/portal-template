# AGENTS.md

Guidance for AI coding tools working in this generated Fluid portal project.

This project is primarily authored through the Fluid OS portal definition sync workflow. Author portal structure, routes, and content through pulled Fluid OS JSON under `portal/` unless a human explicitly asks for a different architecture.

## Source of truth

- Use `.agents/skills/fluid-portal-authoring/SKILL.md` for portal definition work.
- Use `.agents/skills/fluid-widget-authoring/SKILL.md` for company Remote DOM widget creation with `pnpm widget:create`, package descriptors, property schemas, runtime CSS, validation, build, and publish work.
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

- **Every screen needs a container root.** A screen's `component_tree` must hold exactly one `ContainerWidget` / `LayoutWidget` / `CardWidget` at the top, with all other widgets inside its `props.children`. Without it the screen still renders, but the admin visual builder has no drop zones and a human cannot drag anything onto the page. See the `fluid-portal-authoring` skill.
- **Choose the right system before building.** A company portal widget runs in a locked-down worker with no network access, so it can only present Fluid's own data (via capabilities or data sources) or props. Anything needing an API key, OAuth, webhooks, or server-side work is a **Mist app** — a hosted app with its own `public_url`, surfaced through a droplet (identity/credentials) plus a placement record, and embedded by **the Mist's public URL**. The droplet is the app's identity, not the app. See the `fluid-portal-authoring` skill.
- **Droplet widgets are registered widget types, not embeds.** Use `droplet.<scope>.<dropletId>.<Name>` with real props. Do not point an `EmbedWidget` at a droplet's `/embed` route — that is the `?dri=`-gated admin surface and will render blank.
- **Do not infer that a widget type does not exist because an API did not list it.** Widget-related endpoints are scoped differently and legitimately return empty. When unsure of a `type` or prop shape, ask the human to drag the widget onto a scratch screen in the admin builder, then `pnpm pull` and read the truth.
- Keep portal JSON valid and references consistent.
- Preserve stable IDs and slugs unless the change intentionally renames them.
- Keep the portal shell thin; do not fork SDK internals into this app.
- Keep custom page registration in `src/portal.config.ts` and widget package source in `src/widgets.config.ts`.
- For widget changes, use `pnpm widget:create <name>` / `fluid portal widget create <name>` and follow the copied `fluid-widget-authoring` skill before editing package definitions or schemas.
