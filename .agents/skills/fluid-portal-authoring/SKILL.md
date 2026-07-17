---
name: fluid-portal-authoring
description: Use when modifying this generated Fluid portal project through the supported pull/edit/push/version workflow, including portal/ JSON, themes, navigations, screens, profiles, local validation, and distinguishing portal definition sync from widget artifact deployment.
---

# Fluid Portal Authoring

Use this skill before changing a generated Fluid portal project.

## Supported authoring model

This template is a Fluid portal shell plus a local copy of the Fluid OS portal definition.
The supported workflow is:

1. Pull the remote portal definition into `portal/`.
2. Edit the pulled JSON files locally.
3. Validate and preview locally.
4. Push the JSON changes back to the remote working/draft definition.
5. Create and activate a version when the pushed definition should go live.

In generated portal projects, routes, portal structure, screens, themes, profiles, and definition metadata are owned by Fluid OS JSON under `portal/` after pull.

## Important files and directories

- `src/main.tsx`: portal shell bootstrap. Keep this small.
- `src/portal.config.ts`: portal SDK integration and widget/package exports when present.
- `src/index.css`: app-level CSS imports and global styles.
- `portal/`: pulled Fluid OS definition JSON. This is the primary editing surface for portal content.
- `.portal-sync/`: generated sync metadata used by pull/push diffing. Do not edit by hand.
- `.fluidrc`: generated CLI profile binding for this portal project.
- `.agents/skills/fluid-widget-authoring/SKILL.md`: widget authoring guidance when this portal owns widget packages or widget manifests.

## Pull before editing

Run:

```bash
pnpm pull
```

Expected result:

- `portal/` contains local JSON for Fluid OS resources such as screens, themes, navigations, profiles, and definition metadata.
- `.portal-sync/` contains sync state used to compute future diffs.
- `.fluidrc` pins the CLI profile when the project was created with a profile.

Pull before making changes unless you intentionally want to overwrite local work. If local JSON and remote state may both have changed, inspect the diff before pushing.

## Edit pulled portal JSON

Work inside `portal/` for portal definition changes.

Guidelines:

- Keep JSON valid and deterministic.
- Preserve stable IDs, slugs, and cross-resource references unless intentionally changing them.
- Update references together. If a navigation item points to a screen/theme/profile slug or ID, make sure the target exists in `portal/`.
- Prefer small, reviewable edits. One portal content change per PR is easier to validate.
- Do not hand-edit `.portal-sync/`; it is sync metadata, not source content.
- Do not invent unsupported fields. Match the shapes produced by `pnpm pull`.

## Profile matching & preview identity (the #1 trap)

Profile `permissions` (roles, ranks, countries, platform) are evaluated against **whoever is logged in — including the preview session**. A profile that doesn't match the current viewer silently falls back to the `default` profile, and the portal renders the system-default customer experience (sidebar: Shop / Messaging / Contacts / Profile / Orders / Subscriptions / Products). Nothing errors; it just looks like your changes vanished.

- Build and preview on the `default` (or unrestricted) profile FIRST; add role/rank/country segmentation LAST, once the experience works.
- Never invent role or rank strings — they must match the company's configured values.
- "Wrong sidebar / my screens don't show" debug order: (1) does the active profile's permissions match the previewing member? (2) does that profile's NAVIGATION reference the screen? (3) is the draft pushed — and for live, was a version activated? Name which layer failed.

## Validate locally

Run the checks that match the change:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

For portal JSON changes, also run a push dry run or validation command if available in your CLI version. If a command reports broken cross-references, fix the JSON references before pushing.

Use local preview for visual/content changes:

```bash
pnpm dev
```

Expected result: the portal shell starts and can load the local pulled portal definition for preview where supported by the SDK/tooling.

## Push definition changes

Run:

```bash
pnpm push
```

What push does:

- Reads local `portal/` JSON.
- Compares it against `.portal-sync/` state.
- Shows or applies a diff to the remote working/draft Fluid OS definition.
- Updates the remote draft/working state.

What push does not do:

- It does not create a live Fluid OS version by itself.
- It does not upload hosted portal shell assets from `dist/`.
- It does not publish widget runtime artifacts.

After a successful push, inspect the remote portal definition if possible and run the app locally or against the target environment.

## Publish a live portal version

After pushing and verifying the working/draft definition, create and activate a version when the change should become live:

```bash
pnpm exec fluid portal version create --activate
```

Use this only when the pushed definition is ready for users. If activation should be coordinated with a release or content review, stop and ask the project owner before running it.

## Distinguish the three deploy/sync paths

Do not mix these up:

- `pnpm push` / `fluid portal push`: syncs `portal/` JSON to the remote working/draft Fluid OS definition.
- `fluid portal version create --activate`: snapshots the remote working/draft definition and makes it live.
- GitHub Actions or hosting deployment: uploads the built portal shell assets from `dist/`.
- `fluid portal deploy`: publishes company-owned widget runtime artifacts. It is not the portal JSON push command and it is not the hosted shell asset deployment.

## Widget work inside a portal project

Company-owned portal widgets are still supported. Use the widget scaffold command, then follow the copied `fluid-widget-authoring` skill for detailed manifest, property schema, theme token, validation, build, and publish rules.

```bash
pnpm widget:create my-widget
# or
pnpm exec fluid portal widget create my-widget
```

Short version:

- Keep widget code under the scaffolded `src/widgets/<name>/` directory.
- Keep widget metadata serializable.
- Keep `defaultProps` aligned with property schema defaults.
- Use semantic theme tokens.
- Import runtime CSS from the widget build graph.
- Validate/build widget artifacts before publishing them.

## Preflight checklist

Before considering portal work complete:

- [ ] Pulled the latest remote definition or intentionally worked from current local JSON.
- [ ] Edited only supported files for the change.
- [ ] Preserved JSON validity and cross-resource references.
- [ ] Kept portal structure, routes, and content changes in pulled Fluid OS JSON under `portal/`.
- [ ] Ran typecheck/lint/build or the closest available checks.
- [ ] Ran push only when the local `portal/` diff was understood.
- [ ] Created/activated a version only when the definition should go live.
