---
name: fluid-portal-authoring
description: Use when changing Fluid portal screens, navigation, profiles, themes, definition JSON, preview behavior, draft state, or live versions in this project.
---

# Fluid portal authoring

## Decide the remote effect

- Local only: edit, preview, validate, diff, and build.
- Working definition: pull reads remote state; push writes the remote draft.
- Live definition: version activation changes what end users receive.
- Runtime artifacts: portal deploy publishes company widget code.
- Hosted shell: the generated GitHub workflow uploads `dist/` to the CDN.

These operations are independent. Do not substitute one for another.

## Workflow

1. Inspect `git status` and preserve existing work.
2. Run `pnpm pull` unless the task intentionally starts from newer local JSON.
3. Inspect the affected files and their versioned `$schema` values.
4. Edit only the required resources under `portal/`.
5. Validate cross-resource slugs, network grants, and theme compatibility. Run
   the checks that cover the change, then inspect the diff.
6. Run `pnpm push` only when remote draft changes are authorized.
7. Create or activate a version only when a live release is authorized.

Do not edit `.portal-sync/`. Keep IDs, file slugs, navigation targets, theme
names, and profile references consistent.

Push is phased and can partially succeed. Read the reported phase and inspect
remote state before retrying. `--yes` does not approve widget network access;
use interactive approval or `--allow-network-widgets`. Activate only after all
push phases succeed and only when a live release is authorized.

## References

- Follow each portal JSON file's `$schema` for resource fields and widget props.
- [Portal JSON and resource relationships](references/portal-json.md)
- [Widgets and runtime choices](references/widgets-and-runtime.md)
- [Preview, synchronization, deployment, and recovery](references/workflows.md)
- [Installed portal API](../../../node_modules/@fluid-app/portal-sdk/authoring/portal-api/api.md)
- [Installed portal commands](../../../node_modules/@fluid-app/fluid-cli-portal/authoring/commands.md)

If an LSP is unavailable, use the installed API reference. The installed
reference and declarations match the SDK version in this project.

Use `.agents/skills/fluid-widget-authoring/SKILL.md` when the task changes a
widget package rather than portal JSON.

Use the project scripts and installed command reference to select checks for
the change.
