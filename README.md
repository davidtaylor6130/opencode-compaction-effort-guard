# OpenCode Compaction Effort Guard

[![CI](https://github.com/davidtaylor6130/opencode-compaction-effort-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/davidtaylor6130/opencode-compaction-effort-guard/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/davidtaylor6130/opencode-compaction-effort-guard)](https://github.com/davidtaylor6130/opencode-compaction-effort-guard/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Dependencies: none](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](compaction-effort-guard.mjs)

**Choose any reasoning effort for normal OpenCode work while keeping hidden compaction on its own independently controlled effort.**

OpenCode copies the active session variant into compaction and merges that variant after compaction-agent options. This dependency-free plugin applies the saved compaction effort at the final <code>chat.params</code> hook, after OpenCode has finished merging provider, model, agent, and variant settings.

## Features

- Normal session variants and compaction effort remain independent.
- Compaction defaults safely to <code>none</code>.
- Persistent slash-command selection with status reporting.
- Selector-like entries in OpenCode's slash-command palette.
- Atomic, owner-only state storage.
- Safe fallback for missing, malformed, or unsupported state.
- No network access, third-party dependencies, provider changes, or npm package.

## Quick start

### 1. Install the single plugin file

~~~sh
install -d -m 700 ~/.config/opencode/plugins
curl -fsSL https://raw.githubusercontent.com/davidtaylor6130/opencode-compaction-effort-guard/main/compaction-effort-guard.mjs \
  -o ~/.config/opencode/plugins/compaction-effort-guard.mjs
chmod 600 ~/.config/opencode/plugins/compaction-effort-guard.mjs
~~~

### 2. Register it

Add the plugin to <code>~/.config/opencode/opencode.jsonc</code>. Keep existing plugin entries:

~~~jsonc
{
  "plugin": [
    "./plugins/compaction-effort-guard.mjs"
  ],
  "agent": {
    "compaction": {
      "reasoningEffort": "none"
    }
  }
}
~~~

The agent setting documents the intended baseline. The final plugin hook is what prevents a selected session variant from overriding it.

### 3. Restart and verify OpenCode

~~~sh
opencode debug config | jq '{
  plugin,
  compaction_agent: .agent.compaction,
  commands: (.command | keys | map(select(startswith("compaction-effort"))))
}'
~~~

The plugin should resolve as a <code>file://</code> URL and the command list should contain the entries documented below.

## Usage

Set or inspect the effort with the main command:

~~~text
/compaction-effort none
/compaction-effort minimal
/compaction-effort low
/compaction-effort medium
/compaction-effort high
/compaction-effort xhigh
/compaction-effort off
/compaction-effort status
~~~

Calling <code>/compaction-effort</code> without an argument also reports status. <code>off</code> is an alias for <code>none</code>.

For the closest supported experience to OpenCode's native variant selector, type:

~~~text
/compaction-effort-
~~~

Then choose from the slash-command palette:

~~~text
/compaction-effort-none
/compaction-effort-minimal
/compaction-effort-low
/compaction-effort-medium
/compaction-effort-high
/compaction-effort-xhigh
/compaction-effort-off
/compaction-effort-status
~~~

### Example behavior

| Session variant | Compaction setting | Effective result |
|---|---|---|
| <code>xhigh</code> | <code>none</code> | normal xhigh, compaction none |
| <code>low</code> | <code>none</code> | normal low, compaction none |
| <code>xhigh</code> | <code>medium</code> | normal xhigh, compaction medium |
| <code>medium</code> | <code>low</code> | normal medium, compaction low |

## Configuration

The global state file is:

~~~text
~/.config/opencode/compaction-effort-guard.json
~~~

It contains only a schema version and the selected effort. Writes use a temporary file, atomic replacement, and owner-only permissions.

Optional plugin settings can be passed with OpenCode's tuple syntax:

~~~jsonc
{
  "plugin": [
    [
      "./plugins/compaction-effort-guard.mjs",
      {
        "defaultEffort": "low",
        "stateFile": "/absolute/path/to/compaction-effort-guard.json"
      }
    ]
  ]
}
~~~

| Option | Default | Purpose |
|---|---|---|
| <code>defaultEffort</code> | <code>none</code> | Safe value used before a selection exists or when state is invalid |
| <code>stateFile</code> | OpenCode global config directory | Override the persistence location, primarily for managed setups and tests |

Unsupported defaults fall back to <code>none</code>.

## How it works

OpenCode's request merge order is:

~~~text
provider defaults
  -> model options
  -> agent options
  -> selected session variant
  -> chat.params plugin hooks
~~~

The plugin changes exactly one final parameter when the active agent name is <code>compaction</code>:

~~~js
if (input.agent === "compaction") {
  output.options.reasoningEffort = readSavedCompactionEffort();
}
~~~

Normal agents pass through untouched.

Relevant upstream sources:

- [Compaction copies the session variant](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/compaction.ts)
- [Variant options merge after agent options](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/llm/request.ts)
- [Native plugin command/dialog limitation](https://github.com/anomalyco/opencode/issues/28292)

## OpenCode UI limitation

Server plugins cannot currently register a native picker dialog identical to <code>/variants</code>. The selector-style slash entries are the closest supported interface.

OpenCode also routes custom slash commands through a normal model turn. The plugin saves the setting before that turn and rewrites the prompt to request a one-line confirmation. The confirmation does not control or persist the setting; the plugin already did that.

## Compatibility

- Verified with OpenCode 1.17.20.
- Requires the <code>config</code>, <code>command.execute.before</code>, and <code>chat.params</code> plugin hooks.
- Requires Node.js-compatible built-ins supplied by the OpenCode plugin runtime.
- Designed for any provider that accepts <code>reasoningEffort</code> in model options.

## Development

The repository has no install step and no dependency lockfile.

~~~sh
node --check compaction-effort-guard.mjs
node --test
git diff --check
~~~

CI runs the same checks on Node.js 20, 22, and 24. See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
