# Runtime, styling, accessibility, and security

## Component behavior

Use semantic HTML, accessible names, keyboard operation, visible focus, useful
alt text, logical heading order, and reduced-motion handling. Guard unsafe
array and object access, clean up effects, and keep rendering deterministic.

## Theme and CSS

Use the theme contract supplied by the host. Inspect the active theme and the
installed theme API for the exact semantic variables; do not copy a partial
token list into widget guidance.

Theme compliance is the default, not an optional polish step. A widget should
inherit the active theme for colors, typography, spacing, radii, borders,
focus, and charts. Do not hardcode a visual value or expose a custom styling
property when a semantic token represents the same intent. Use the
`colorSelect` property field for author-selectable semantic colors. The legacy
`color` field is deprecated. Use arbitrary colors only for a product-specific
value that cannot be semantic, and verify contrast in every supported theme.

Keep styles in the generated project's root `styles.css`. The standalone
template keeps a guarded import in its worker entry, and both widget build
flows include the root stylesheet in their output. Scope selectors to the
widget and do not depend on global `body` styles.

## Security and network access

Follow the worker isolation boundary in the installed runtime contract. Do not
assume that browser or host application facilities are available. Declare every
portal function and capability in `uses`.

Add `networkAccess` only for public HTTP APIs after package review and
placement consent. The grant is bound to the package ID, package version, and
capability version. Fluid does not add credentials, cookies, tokens, or
headers. The widget's `RequestInit`, including credential mode, remains in
effect.

Treat worker network access as approved public HTTP fetch, not as general
browser or server access. The runtime reference owns the exact destination and
ambient-API policy. Native redirects and DNS results are not revalidated.
Never embed secrets, credentials, private endpoints, or tenant tokens. Use a
typed host portal function or server application instead.
