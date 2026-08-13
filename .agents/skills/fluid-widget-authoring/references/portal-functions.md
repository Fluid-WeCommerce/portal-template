# Portal-function guidance

Use the installed widget API for the complete set of portal functions, their
arguments, return types, errors, and capability declarations. Do not maintain
a function or capability list in this skill.

Call portal functions directly and put the same function values in the
widget's `uses` array. Do not write a parallel capability-name list. The worker
and host enforce those declarations. If a call reports that it was not
declared, add the called function value to `uses` and rebuild the package.

Treat every returned value as the documented allowlisted view, not as a raw
tenant API response. Worker code has no tenant API client. Handle unavailable
or partial data without crashing the widget.

For a company-specific operation, define one typed portal function in a module
shared by the worker package and portal host. Register its host implementation
through the portal's remote-widget configuration. Use the installed worker and
host API references for the exact definition, implementation, and error
contracts.

Do not override a built-in function or register the same custom function more
than once. Inputs and outputs must satisfy the installed JSON-value types.
