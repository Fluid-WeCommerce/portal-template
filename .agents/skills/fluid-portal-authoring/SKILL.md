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
- `src/portal.config.ts`: custom page registration for the portal SDK.
- `src/widgets.config.ts`: company Remote DOM widget package source.
- `src/index.css`: app-level CSS imports and global styles.
- `portal/`: pulled Fluid OS definition JSON. This is the primary editing surface for portal content.
- `.portal-sync/`: generated sync metadata used by pull/push diffing. Do not edit by hand.
- `.fluidrc`: generated CLI profile binding for this portal project.
- `.agents/skills/fluid-widget-authoring/SKILL.md`: Remote DOM widget authoring guidance when this portal owns widget packages.

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

## Add a new page and put it in the menu

A page = a **screen** (a `component_tree` of widgets) + a **navigation item** that points at it. A screen with no nav item is unreachable; a nav item whose screen reference doesn't resolve is silently dropped in local preview and refused at push. Both live in `portal/`.

1. Create `portal/screens/<slug>.json`: `{ "name": "Rewards", "component_tree": [ ... ] }`. Give every node an `id` and a widget `type` from the catalog below. Match the shape `pnpm pull` produced.
2. Add a navigation item to each profile that should see it: `{ "label": "Rewards", "slug": "rewards", "screen_id": <id> }` (mirror how sibling items in that navigation reference their screens — by `screen_id` or `slug`). Use `children[]` for a nested group. Add to `mobile_navigation` too for mobile.
3. Link to it with a `ButtonWidget`/`LinkWidget` (or a carousel slide `buttonLink`) using the path `/rewards`.
4. Preview on the profile local dev serves (default/first), then push and activate a version to go live.

## Choosing a widget (recommend built-ins before custom code)

Use the `type` value in a `component_tree` node. Reach for what already exists:

- Layout: `ContainerWidget`, `LayoutWidget` (columns/grid), `NestedWidget`, `SpacerWidget`, `SeparatorWidget`
- Hero/media: `CarouselWidget` (rotating hero slides w/ CTA), `ImageWidget`, `VideoWidget`
- Content: `TextWidget`, `BulletListWidget`, `CardWidget`, `AlertWidget`, `TableWidget`, `ChartWidget`, `CalendarWidget`
- Commerce/member: `ShopWidget`, `PointsWidget` (rewards balance), `RecentActivityWidget`, `ToDoWidget`
- Links/sharing: `LinkWidget`, `ButtonWidget`, `QuickLinksWidget`, `QuickShareWidget`, `ListWidget`
- Platform: `EmbedWidget` (drops a Mist app into a screen), `MySiteWidget`, `CatchUpWidget`

An unregistered `type` renders nothing. Data-driven UI a built-in can't express (a member-specific dashboard) needs a custom widget package — a separate concern from this definition-editing workflow; note it to the user rather than hand-rolling code here.

## System screens and how to reach them

The portal ships built-in screens addressed by nav slug: `profile` (alias `account`), `orders`, `subscriptions`, `messaging`, `contacts`, `shop`, `customers`, `my-site`, `share/*`, `app-download`. To expose one, add a navigation item with that slug to the profile — `messaging` and `contacts` only appear when a nav item includes them, and `messages`/`my-site` are rep-only (a non-rep member sees the fallback). These are core surfaces the admin builder keeps; author your own pages alongside them in `portal/` and let the definition stay the source of truth so drag-and-drop editing keeps working.

## Validate locally

Run the checks that match the change:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

For portal JSON changes, know that validation is asymmetric:

- **Local preview is lenient.** The dev server builds its manifest from `portal/` and silently skips malformed JSON files and silently drops navigation items whose `screen` reference does not resolve. A screen that "just vanished" from the preview with no error usually means broken JSON or a broken reference in the file you last edited.
- **Push is strict.** `pnpm push` validates cross-references (navigation → screen, profile → navigation/theme) before writing anything and refuses the entire push if any reference is broken.

Use local preview for visual/content changes:

```bash
pnpm dev
```

Expected result: the portal CLI pulls the definition when `portal/` is missing, then starts the shell against the local portal JSON. Use `pnpm dev` instead of bare `vite` so the pull and manifest preflight run.

Two local-preview rules that read as bugs if you do not know them:

- The local manifest always serves the profile with `default: true` (or the first profile file if none is default). Profile `permissions` are **not** evaluated locally — edits to any other profile will never appear in the local preview. Permission matching only happens on the deployed portal against the real logged-in member.
- The logged-in session is still real: rep-only screens (`messages`, `my-site`) render the customer fallback when the member is not rep-eligible.

## Push definition changes

Run:

```bash
pnpm push
```

What push does, in order (it stops at the first failing gate):

1. **Invisible git sync.** Push auto-commits the whole working tree (`git add -A`; `.gitignore` is the only exclusion boundary — keep secrets in `.env`, never in tracked files) and pushes to the portal's Fluid-provisioned git repository. A "Skipped git sync — <reason>" note is non-fatal and the content push continues. A _failed_ git push aborts the whole command with your changes committed locally — reconcile (usually `git pull --rebase`) and rerun.
2. **Snapshot diff.** Compares `portal/` against `.portal-sync/` state. "Nothing to push" means no local edits since the last pull/push.
3. **Cross-reference validation.** Refuses the entire push, before any write, if a navigation item references a missing screen or a profile references a missing navigation/theme.
4. **Phased write.** Screens and themes first, then navigations, then profiles. A failed phase skips later phases, and only successfully pushed files advance the snapshot — fix the error and rerun to push the remainder. "No mapping found for <type> slug" means the resource was never pulled/created remotely; re-pull.

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

## Work on this portal from another machine

The project's source lives in a Fluid-provisioned git repository (kept in sync by push). To continue work elsewhere:

```bash
fluid login
fluid portal clone <app-name>
cd <app-name>
fluid portal pull
```

Clone mints its own short-lived git credentials — do not hand out raw repository URLs or tokens.

## Debug order when something looks wrong

Work these in order and report which one failed:

1. Logged in? Auth errors say `Run fluid login first`.
2. Right directory? Push errors about missing `portal/` or `.portal-sync/` mean you are not in the pulled project (or never pulled).
3. Local preview showing stale/missing content? Check for malformed JSON or broken references in the file you last edited (local preview drops them silently), and confirm you edited the profile the local preview serves (`default: true`).
4. Push refused? Read the cross-reference validation errors — they name the file and the missing slug.
5. Push partially failed? Fix the reported phase error and rerun; the snapshot only advanced for files that succeeded.
6. Users do not see the change? Push updates the draft only — create/activate a version.

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
