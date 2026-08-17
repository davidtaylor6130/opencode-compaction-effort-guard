# Contributing

Thanks for helping improve OpenCode Compaction Effort Guard.

## Requirements

- Node.js 20 or newer
- Git
- OpenCode for optional integration testing

The plugin has no runtime or development dependencies.

## Local checks

Run every check before opening a pull request:

~~~sh
node --check compaction-effort-guard.mjs
node --test
git diff --check
~~~

## Development workflow

1. Fork or clone the repository.
2. Create a focused branch.
3. Keep the plugin dependency-free unless a dependency is unavoidable and justified.
4. Add or update tests for every behavior change.
5. Update README.md and CHANGELOG.md when user-visible behavior changes.
6. Open a pull request describing the problem, implementation, and validation.

## Design constraints

- Only requests for the built-in compaction agent may be modified.
- Normal agents and provider/model configuration must remain untouched.
- Session variants must not override the saved compaction effort.
- Invalid or corrupt state must fail safely to the configured default.
- State writes must remain private and crash-safe.
- OpenCode-specific limitations must be documented rather than hidden.

## Commit style

Use short imperative subjects, for example:

~~~text
Harden compaction state writes
Add status command coverage
~~~
