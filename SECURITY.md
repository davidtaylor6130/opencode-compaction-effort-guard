# Security Policy

## Supported versions

Security fixes are applied to the latest release and the main branch.

## Reporting a vulnerability

Do not include sensitive details in a public issue. Use GitHub private vulnerability reporting through the repository Security tab when available. If private reporting is unavailable, contact the maintainer through the GitHub profile before sharing technical details.

For non-sensitive correctness problems, open a normal GitHub issue with:

- OpenCode version
- operating system
- plugin configuration with secrets removed
- exact command or session variant used
- expected and observed behavior

## Security properties

The plugin:

- modifies parameters only for the built-in agent named compaction
- never contacts a network service
- has no third-party dependencies
- stores only the selected effort level
- writes state atomically with owner-only permissions
- treats missing, malformed, or unsupported state as the configured safe default
