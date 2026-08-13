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

## Screen structure: every screen needs a container root

**Rule: a screen's `component_tree` must hold exactly one container node at the top, and every other widget must be inside its `props.children`.**

The container types are `ContainerWidget`, `LayoutWidget`, and `CardWidget`. `ContainerWidget` is the default choice for a page root; the admin builder writes one on every screen it authors.

```json
{
  "name": "UGC",
  "component_tree": [
    {
      "id": "ContainerWidget-ugc-root",
      "type": "ContainerWidget",
      "props": {
        "gapSize": "md",
        "padding": 4,
        "children": [{ "id": "…", "type": "…", "columnIndex": 0, "props": {} }]
      }
    }
  ]
}
```

A screen with bare top-level widgets and no container root **renders correctly in preview and in the live portal**, so nothing you can see locally will tell you it is wrong. What breaks is the admin visual builder: only container widgets receive the edit-mode child-management callbacks (`onAddChild`, `onWidgetSelect`, child delete/duplicate), so a screen without a container root offers **no drop zones**. A human opening that screen in the builder cannot drag anything onto it.

This is the single most likely defect in an agent-authored screen, because the failure is invisible from every surface an agent can check.

- Put a container root on every screen you create, without exception.
- Only these three types are containers by default. A `NestedWidget`, `SpacerWidget`, or any other widget at the root does not satisfy this rule.
- Containers nest. A column layout inside the root is `LayoutWidget` in the root's `children`.
- When mirroring an existing screen, copy its root container rather than lifting its children out.

## Add a new page and put it in the menu

A page = a **screen** (a `component_tree` of widgets) + a **navigation item** that points at it. A screen with no nav item is unreachable; a nav item whose screen reference doesn't resolve is silently dropped in local preview and refused at push. Both live in `portal/`.

1. Create `portal/screens/<slug>.json`: `{ "name": "Rewards", "component_tree": [ ... ] }`. Give every node an `id` and a widget `type` from the catalog below. The **filename is the resource slug**; an inline `slug` field is optional and is not what cross-resource resolution uses.
2. Add a navigation item to each profile that should see it. Local JSON uses the screen **slug**, not a numeric backend id: `{ "label": "Rewards", "slug": "rewards", "screen": "rewards", "source": "user", "position": 2, "children": [] }`. Use `children[]` for a nested group. Add it to the profile's `mobile_navigation` too for mobile.
3. Link to it with a `LinkWidget` in screen mode. Use the screen slug rather
   than a URL path so the portal shell handles navigation. `LinkWidget` props for the example above:

   ```json
   {
     "linkType": "screen",
     "screenSlug": "rewards"
   }
   ```

   Carousel slides use their separate `buttonLink` property; set that to the
   path `/rewards`.

4. Preview on the profile local dev serves (default/first), then push and activate a version to go live.

### Bootstrapping a brand-new empty definition

`fluid portal pull` legitimately returns zero screens/themes/navigations/profiles for a newly created portal. Do not search for hidden starter resources and do not move the routes into `src/`. Create a complete minimal definition locally:

`portal/screens/home.json`

```json
{
  "name": "Home",
  "component_tree": [
    {
      "id": "ContainerWidget-home-root",
      "type": "ContainerWidget",
      "props": {
        "background": {
          "type": "solid",
          "color": "background"
        },
        "gapSize": "md",
        "padding": 4,
        "children": [
          {
            "id": "TextWidget-home-welcome",
            "type": "TextWidget",
            "columnIndex": 0,
            "props": {
              "title": "Welcome",
              "titleColor": "foreground",
              "description": "Your portal is ready.",
              "descriptionColor": "foreground",
              "background": {
                "type": "solid",
                "color": "background"
              },
              "padding": 4,
              "borderRadius": "md"
            }
          }
        ]
      }
    }
  ]
}
```

`portal/navigations/main.json` (create a parallel `mobile.json` with `"platform": "mobile"`)

```json
{
  "name": "Main Navigation",
  "platform": "web",
  "navigation_items": [
    {
      "label": "Home",
      "slug": "home",
      "icon": "home",
      "position": 1,
      "screen": "home",
      "source": "user",
      "parent_id": null,
      "children": []
    }
  ]
}
```

`portal/profiles/default.json`

```json
{
  "name": "Default Profile",
  "default": true,
  "permissions": {
    "countries": [],
    "ranks": [],
    "roles": [],
    "platform": []
  },
  "navigation": "main",
  "mobile_navigation": "mobile",
  "themes": []
}
```

Create additional screen files and add their slug to both navigations before previewing. `fluid portal push` creates files listed as new, records their backend mappings, then creates navigations and profiles in dependency order. “No mapping found” applies to a file incorrectly treated as changed/deleted, not to a valid new file.

If you create `portal/themes/<slug>.json`, it must contain the complete
`{ "name", "active", "config" }` shape. A theme with only `name` and
`active` can appear harmless in local preview but the API rejects it. Copy a
pulled theme's full `config` object and then change its `id`, `name`, and token
values; do not invent a partial config.

## Decide first: portal widget, or Mist app?

Before building anything custom, work out which system the feature belongs to. This is the most expensive decision to get wrong in portal work, and the deciding question is not "internal or external data" — it is **does this need a server that can hold a secret.**

### A company portal widget has no network access by default

Portal widgets run as Remote DOM packages inside a locked-down Web Worker. A widget can use standard worker `fetch` only when it declares `uses: [networkAccess]` and the portal author approves the warning. The grant is stored on the widget node and bound to the current package and capability versions. Existing network-enabled widgets retain consent when those versions change; adding network access to a widget that did not previously have it requires review.

Fluid does not add credentials, tokens, cookies, or headers. Direct requests to `fluid.app`, the current portal origin, loopback, and private-network addresses are blocked. Native redirects are not inspected, and worker execution does not isolate the reputation of `*.fluid.app`; approval is therefore a package-trust decision. WebSocket, EventSource, WebTransport, and streaming-specific APIs remain unavailable.

Without that declaration and grant, a portal widget's data comes from exactly three places:

- props written into the screen JSON
- built-in host capabilities — `account`, `store`, `products`, `content`, `mySite`, `todos`, `calendar`, `points`, `localization`, and friends
- **data sources**, which the host resolves and passes into props (`api` with a Fluid preset, `custom` for hand-picked Fluid resources, `static` for literal data)

### A Mist app is the app; the droplet is its identity

A Mist app is a hosted application with its own backend and a `public_url`. It can hold secrets, call any external API, receive webhooks, and do server-side work. Fluid surfaces it through integration records that **all point at that same `public_url`**:

| Record           | What it is                                                                                                                        | Per mist |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Droplet**      | Identity and credentials — `FLUID_DROPLET_UUID` / `_SECRET` / `_WEBHOOK_AUTH_TOKEN`, OAuth scopes, install lifecycle and webhooks | one      |
| **Mobile embed** | A placement in the mobile app: `embed_url` plus a required cover image and height                                                 | many     |
| **Drop zone**    | A placement in an admin page/zone slot                                                                                            | many     |

**The droplet is not the app.** It is the app's identity and permission record. The Mist app is the thing that runs, and it is what an embed points at.

### The decision

1. **Needs an API key, OAuth, webhooks, background jobs, or any server-side work** → build a **Mist app**. Attach a droplet for credentials and install lifecycle, add a placement surface, and embed the **Mist's public URL**.
2. **Presents Fluid's own data** (orders, products, account, shares, subscriptions, content) → build a **company portal widget** and read it through a capability or a preset data source. No hosting, no secrets, no deploy pipeline.
3. **Presents public, unauthenticated, CORS-enabled JSON and nothing more** → a portal widget with an `api` data source pointing at an absolute endpoint works. The host fetches it, so it runs in the browser and cannot hold a credential — the moment authentication enters, this becomes case 1.

Ask the user which of these their feature is when it is not obvious from the request. A feature that "pulls in data from <third-party service>" is case 1 essentially every time.

### Embedding a Mist app in a portal screen

Point the embed at the **Mist's public URL**, or at a purpose-built widget route the Mist app serves. Those routes are built to be iframed and need no installation parameter.

**Do not point an embed at the droplet's `/embed` route.** That is the admin dashboard surface and requires a `?dri=` installation parameter; without one it renders "Missing installation" or a blank frame.

If the Mist app already publishes registered widget types (see below), prefer those over an iframe embed — they compose properly with the screen and the builder.

## Choosing a widget (recommend built-ins before custom code)

Use the `type` value in a `component_tree` node. Reach for what already exists:

- Layout: `ContainerWidget`, `LayoutWidget` (columns/grid), `NestedWidget`, `SpacerWidget`, `SeparatorWidget`
- Hero/media: `CarouselWidget` (rotating hero slides w/ CTA), `ImageWidget`, `VideoWidget`
- Content: `TextWidget`, `BulletListWidget`, `CardWidget`, `AlertWidget`, `TableWidget`, `ChartWidget`, `CalendarWidget`
- Commerce/member: `ShopWidget`, `PointsWidget` (rewards balance), `RecentActivityWidget`, `ToDoWidget`
- Links/sharing: `LinkWidget`, `QuickLinksWidget`, `QuickShareWidget`, `ListWidget`
- Platform: `EmbedWidget` (iframes an arbitrary URL into a screen), `MySiteWidget`

`TextWidget` renders its `title` and `description` as plain text. Do not put
HTML in either field; markup is escaped and displayed literally.

An unregistered `type` renders nothing. Data-driven UI a built-in can't express (a member-specific dashboard) needs a custom widget package — a separate concern from this definition-editing workflow; note it to the user rather than hand-rolling code here.

### Droplet widgets are real widget types, not embeds

An installed droplet (UGC, and others) contributes **registered widget types**, addressed exactly like any other widget:

```json
{
  "id": "…",
  "type": "droplet.ugc.drp_fuwamfg3licz1l4yocpkjos12t9vhcrh.MakeAVideoCta",
  "props": {
    "headline": "…",
    "eyebrow": "…",
    "ctaLabel": "…",
    "dri": "",
    "apiBaseUrl": "…"
  }
}
```

The shape is `droplet.<scope>.<dropletId>.<WidgetName>`, and the props are ordinary JSON the builder writes.

**Do not reach for `EmbedWidget` to render a droplet's UI.** `EmbedWidget` iframes a URL, and a droplet's `/embed` route is the _admin dashboard_ surface, which requires a `?dri=` installation parameter — pointing an `EmbedWidget` at it renders "Missing installation" or a blank frame. That mistake looks reasonable and fails quietly.

**Absence from an API is not evidence a widget type does not exist.** These endpoints are scoped differently and will each come back empty or 404 for a droplet widget that is installed and working:

| Endpoint                           | Why it looks empty                                       |
| ---------------------------------- | -------------------------------------------------------- |
| `/api/droplets` (`app_extensions`) | Does not list contributed widget types                   |
| `/__widget-packages__`             | Dev-server route for _unpublished company_ packages only |
| `/api/app/widget-packages`         | Portal-session scoped; 404s for a CLI token              |
| `/api/company/mobile_widgets`      | **This one lists installed droplet widgets**             |

**When you cannot confirm a widget's type or prop shape from an API, ask the human to drag it onto a scratch screen in the admin builder and then `pnpm pull`.** The pulled JSON is ground truth for both the `type` string and the exact props. Do this instead of inferring from absence, and do it early — it costs one message and replaces a chain of confident guesses.

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

- `fluid portal dev` injects `portalDevPlugin()` and `backendDevPlugin()` programmatically. Do not add either plugin to `vite.config.ts`; doing so creates scaffold drift and is unnecessary. If the command falls back to bare Vite, fix the dependency/config error that triggered the fallback instead of permanently wiring the plugin.
- With no `VITE_API_URL` override, the CLI resolves the signed-in company and proxies `/api` to `https://<subdomain>.portal.fluid.app`. Portal member endpoints do **not** live on `api.fluid.app` or `<subdomain>.fluid.app`; repeated 404s from those hosts are a proxy-target error.
- The local manifest always serves the profile with `default: true` (or the first profile file if none is default). Profile `permissions` are **not** evaluated locally — edits to any other profile will never appear in the local preview. Permission matching only happens on the deployed portal against the real logged-in member.
- A direct localhost preview does **not** have a real portal-member session. The tenant BFF authenticates with an HttpOnly `portal_tenant_user_id` cookie created by the production/Rails handoff, not the Fluid CLI token. Local custom pages, navigation, and definition content still work, but Shop, Orders, Contacts, rep-only screens, and other member-data surfaces may return 401 or remain unauthenticated. A host fix that merely changes an error boundary into permanent skeletons is not successful authentication. Verify signed-in behavior through a real tenant handoff environment.

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

For an explicitly approved non-interactive release, use
`fluid portal push --yes --activate`. It performs the same two stages but
activates only after every push phase succeeds; malformed or partially-pushed
definitions exit non-zero and are not activated.

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
3. Built-in screens returning 404? Confirm the proxy target is `<subdomain>.portal.fluid.app`, not `api.fluid.app` or `<subdomain>.fluid.app`.
4. Built-in screens returning 401 or permanent skeletons? Localhost lacks the portal handoff cookie; use a real tenant handoff environment for authenticated-member verification.
5. Local preview showing stale/missing definition content? Check for malformed JSON or broken references in the file you last edited (local preview drops them silently), and confirm you edited the profile the local preview serves (`default: true`).
6. Push refused? Read the cross-reference validation errors — they name the file and the missing slug.
7. Push partially failed? Fix the reported phase error and rerun; the snapshot only advanced for files that succeeded.
8. Users do not see the change? Push updates the draft only — create/activate a version.
9. Screen renders fine but the admin builder shows no drop zones on it? The screen is missing its container root. See "Screen structure: every screen needs a container root".
10. A widget renders blank or says "Missing installation"? You likely used `EmbedWidget` against a droplet's `/embed` route instead of the droplet's registered widget `type`.

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
- [ ] **Every screen created or modified has a single container root (`ContainerWidget` / `LayoutWidget` / `CardWidget`) with all other widgets in its `props.children`.** Preview cannot detect this; check the JSON.
- [ ] Chose portal widget vs Mist app deliberately — anything needing a secret, OAuth, webhooks, or server-side work is a Mist app, not a portal widget.
- [ ] Any embed points at a Mist's public URL or a widget route, never at a droplet's `?dri=`-gated `/embed`.
- [ ] Used registered widget `type` values for droplet/company widgets, not an `EmbedWidget` pointed at a droplet route.
- [ ] Confirmed any uncertain widget `type` or prop shape against builder-authored JSON rather than inferring it.
- [ ] Created/activated a version only when the definition should go live.
