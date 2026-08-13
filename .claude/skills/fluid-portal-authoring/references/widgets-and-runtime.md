# Widgets and runtime choices

## Built-in widgets

Use the current portal schema and builder catalog for the complete built-in
widget set and each widget's props. Do not maintain category, type, or prop
lists in this guide. An unregistered type renders no widget.

## Company widget package

Use a company widget package for Remote DOM UI authored in a portal project.
Author it under `src/widgets/` and register it in `src/widgets.config.ts`.
Packages can use serializable props, declared host portal functions, and
approved public HTTP access. `fluid portal deploy` publishes these widget
artifacts.

## Standalone Droplet widget package

Use the standalone widget project and `fluid widget publish` for a package
associated with an existing Droplet. Do not mix its
`fluid.widget.config.ts` layout with the company widget package layout.

## Server application

Use a Mist application or another server component for secrets, OAuth,
webhooks, private APIs, background work, and other server behavior. Remote DOM
workers receive no host cookies, storage, API client, or credentials. Do not
invent an embed URL or iframe contract. Use only routes and integration
contracts supplied by the application.

## Network access

Widget network access requires the declared `networkAccess` capability and an
author-approved placement grant. The builder shows a warning when the widget
is added and keeps a customization banner visible while the capability is
present. The grant is bound to the exact package and capability versions. A
change invalidates the grant and requires approval again. In the CLI, `--yes`
does not approve this capability; a non-interactive push needs
`--allow-network-widgets`.

Granted requests use native fetch from the worker origin. Fluid does not add
credentials, cookies, tokens, or headers. The widget's own `RequestInit`
values, including credential mode, remain in effect.

The runtime reference owns the exact blocked-destination and ambient-API
contract. Native fetch redirects and DNS results are not revalidated, so
approval is a package trust decision. Any portal data exposed to the widget can
be sent to an external service, and worker isolation does not protect the
browser reputation of `*.fluid.app`.

## Theme behavior

Built-in and third-party widgets should follow the active theme. Prefer
semantic colors, typography, spacing, radii, borders, focus, and chart tokens.
For widget property schemas, use `colorSelect` so authors choose a semantic
token. The legacy `color` field is deprecated. Do not add arbitrary colors or
styling properties when the theme engine already expresses the intended role.
