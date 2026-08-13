# Property fields

Property fields define the builder editor and generated portal JSON Schema.
Put the prop description on the field that produces that prop. Do not create a
separate prop-description section.

Every prop-producing field needs a stable `key`, clear `label`, precise
`description`, and a valid default when the field supports one. Use the
installed API reference for the current field types, options, and required
members.

Section headers and separators organize the editor and do not produce props.

## Theme-aware fields

Use `colorSelect` when an author must choose a color. Its value comes from the
theme engine's semantic color-token contract. The legacy `color` field is
deprecated. Do not add new uses. Avoid arbitrary color controls unless an
explicit product requirement cannot use the theme engine.

Apply the same rule to other visual properties. Prefer theme typography,
spacing, radii, borders, and shadows over widget-owned values. If a necessary
custom style can override a theme-derived value, mark it `advanced`, provide a
theme-compatible default, and describe the compatibility cost.

## Data sources

If a prop exists only as a data-source result, document it on the canonical
data-source field rather than in a parallel prop list. Keep each target prop's
description with that mapping and keep the schema's target-prop declaration in
sync. Use the installed property-field API for the exact mapping shape and
per-item configuration contract.

Components must accept missing, empty, partial, or malformed data and render a
useful empty state. Prefer props and host data sources to direct network
requests.
