# Fluid portal project guidance

## Task routing

- Use `.agents/skills/fluid-portal-authoring/SKILL.md` for portal JSON, custom
  pages, preview, pull, diff, push, versions, activation, and shell deployment.
- Use `.agents/skills/fluid-widget-authoring/SKILL.md` for company or Droplet
  Remote DOM widgets, property schemas, theme compliance, portal functions,
  capabilities, and widget publication.

## Sources of truth

- Each file under `portal/` follows its versioned `$schema`. The schema owns
  exact fields, widget props, validation constraints, defaults, and examples.
- Installed SDK declarations and `node_modules/@fluid-app/portal-sdk/authoring/`
  own exact public APIs.
- Installed CLI references own command syntax, options, and defaults.
- The skills provide task procedure, safety boundaries, verification, failure
  handling, and recovery. Do not replace that guidance with copied field lists.
- `.portal-sync/`, `.fluid/`, and `dist/` are generated. Never edit them.

## Repository and remote-state rules

- Preserve existing work. Inspect `git status` before pull, scaffold, format,
  or generation commands.
- Keep screen, navigation, profile, and theme file slugs consistent with every
  cross-resource reference.
- Pull can overwrite local portal JSON only when its force behavior is
  explicitly selected. Preserve local work before resolving remote drift.
- Push changes the remote working definition. It does not make that definition
  live unless activation is also requested.
- Activation, version creation, widget publication, and CDN deployment are
  separate remote changes. Run only the operation authorized by the task.
- `--yes` skips ordinary confirmation. It does not approve network-enabled
  widgets. Non-interactive approval requires `--allow-network-widgets`.
- Treat a multi-phase operation as partially complete until every phase result
  is known. Never assume an earlier successful phase rolled back.
- Follow the portal theme for custom pages and widgets. Widget authors must use
  semantic theme tokens and `colorSelect`; the legacy `color` field is
  deprecated.
