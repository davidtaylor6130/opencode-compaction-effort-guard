# OpenCode Compaction Effort Guard

A tiny, dependency-free OpenCode plugin that prevents the active session's reasoning variant from leaking into the hidden compaction agent.

## Why

OpenCode compaction uses a dedicated hidden agent, but it also copies the active session variant. Request options are merged in this order:

1. provider defaults
2. model options
3. agent options
4. selected session variant

That means selecting low, medium, or xhigh can override agent.compaction.reasoningEffort. This plugin runs at the final chat.params hook and restores the independently configured compaction effort. Normal agents are untouched.

## Install

Download the plugin into your global OpenCode plugin directory:

~~~sh
mkdir -p ~/.config/opencode/plugins
curl -fsSL https://raw.githubusercontent.com/davidtaylor6130/opencode-compaction-effort-guard/main/compaction-effort-guard.mjs \
  -o ~/.config/opencode/plugins/compaction-effort-guard.mjs
~~~

Register it in ~/.config/opencode/opencode.jsonc:

~~~jsonc
{
  "plugin": ["./plugins/compaction-effort-guard.mjs"],
  "agent": {
    "compaction": {
      "reasoningEffort": "none"
    }
  }
}
~~~

Restart OpenCode.

## Set compaction effort

Use the main slash command with an argument:

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

For a selector-like experience, type /compaction-effort- in the slash-command palette and choose one of the registered entries:

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

The selection persists globally in:

~~~text
~/.config/opencode/compaction-effort-guard.json
~~~

Off is an alias for none. With no saved selection, the default is none.

### Current OpenCode UI limitation

OpenCode server plugins cannot register a native picker dialog like the built-in /variants command. These discoverable slash-command entries are the closest supported interface. OpenCode also sends custom slash commands through a normal model turn, so setting or checking the value produces a short confirmation response.

## Behavior

| Selected session effort | Selected compaction effort | Result |
|---|---|---|
| xhigh | none | Normal xhigh, compaction none |
| low | none | Normal low, compaction none |
| xhigh | medium | Normal xhigh, compaction medium |
| medium | low | Normal medium, compaction low |

The two selections remain independent.

## Test

~~~sh
node --test
~~~

## How it works

The plugin uses OpenCode's chat.params hook, which receives final request parameters after model, agent, and variant option merging:

~~~js
if (input.agent === "compaction") {
  output.options.reasoningEffort = readSavedCompactionEffort();
}
~~~

Relevant OpenCode source:

- [Compaction copies the session variant](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/compaction.ts)
- [Variant options merge after agent options](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/llm/request.ts)
- [Native plugin command/dialog limitation](https://github.com/anomalyco/opencode/issues/28292)

## Scope

This guards reasoningEffort for OpenCode's built-in agent named compaction. It does not modify providers, models, prompts, tool use, context limits, or ordinary agents.

## License

MIT
