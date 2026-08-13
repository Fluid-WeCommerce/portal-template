# Portal JSON

## Resource graph

Portal resources live under `portal/`. The file name is the resource slug used
by cross-resource references. An inline display name does not replace it.

- `screens/<slug>.json` defines a route and its widget tree.
- `navigations/<slug>.json` defines ordered web or mobile entries.
- `profiles/<slug>.json` selects navigation resources, themes, and member
  permission filters.
- `themes/<slug>.json` contains the complete structured theme configuration.

A screen can contain zero or one root widget. For a populated screen that must
support builder child placement, select a registered container from the
current schema or builder catalog. Use the schema for its exact type and child
property; do not copy those contracts into this guide.

## Navigation

A navigation entry uses the screen file slug. Follow the navigation file's
`$schema` for its exact fields, values, and examples.

Navigation controls discoverability; it is not the only route resolver. A
valid screen can still be opened directly by its slug when its route and
profile gates allow it. Preview preserves an unresolved navigation entry but
cannot attach its screen ID. Push rejects invalid references.

Do not maintain a system-screen slug list in guidance. Select system screens
from the current builder or generated screen-picker contract, then pull the
definition and preserve the emitted slug and access rules.

## Widgets

The widget schema owns the complete node contract, including the distinction
between built-in and third-party widget properties. Confirm a widget and its
properties from the current schema, catalog, or builder-authored JSON instead
of copying any part of that contract here or inferring it from an empty API
response.

## Empty definitions and themes

An empty definition can have no screens, themes, navigations, or profiles.
Build a complete resource graph before push. Copy a pulled theme when the full
current shape is needed; a partial config is invalid. The theme file's schema
owns its exact fields and token structure.
