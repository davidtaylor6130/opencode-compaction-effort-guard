# OpenCode Compaction Effort Guard

A tiny, dependency-free OpenCode plugin that prevents the active session's reasoning variant from leaking into the hidden compaction agent.

## Why

OpenCode compaction uses a dedicated hidden agent, but it also copies the active session variant. Request options are merged in this order:

1. provider defaults
2. model options
3. agent options
4. selected session variant

That means selecting `low`, `medium`, or `xhigh` can override `agent.compaction.reasoningEffort`. This plugin runs at the final `chat.params` hook and forces only the `compaction` agent back to `none`. Normal agents are untouched.

## Install

Download the plugin into your global OpenCode plugin directory:

```sh
mkdir -p ~/.config/opencode/plugins
curl -fsSL https://raw.githubusercontent.com/davidtaylor6130/opencode-compaction-effort-guard/main/compaction-effort-guard.mjs \
  -o ~/.config/opencode/plugins/compaction-effort-guard.mjs
```

Register it in `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "plugin": ["./plugins/compaction-effort-guard.mjs"],
  "agent": {
    "compaction": {
      "reasoningEffort": "none"
    }
  }
}
```

Restart OpenCode. You can then select any normal-session variant while compaction remains non-reasoning.

## Behavior

| Selected session effort | Normal agent | Compaction agent |
|---|---|---|
| `low` | `low` | `none` |
| `medium` | `medium` | `none` |
| `high` | `high` | `none` |
| `xhigh` | `xhigh` | `none` |
| `none` | `none` | `none` |

## Test

```sh
node --test
```

## How it works

The plugin uses OpenCode's `chat.params` hook, which receives the final request parameters after model, agent, and variant option merging:

```js
if (input.agent === "compaction") {
  output.options.reasoningEffort = "none";
}
```

Relevant OpenCode source:

- [Compaction copies the session variant](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/compaction.ts)
- [Variant options merge after agent options](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/llm/request.ts)

## Scope

This guards `reasoningEffort` for OpenCode's built-in agent named `compaction`. It does not modify providers, models, prompts, tool use, context limits, or ordinary agents.

## License

MIT
