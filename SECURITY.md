# Security Policy

## Supported Versions

This project is an early prototype. Security fixes target the latest public version only.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a Vulnerability

Please do not open a public issue for a vulnerability.

Use GitHub's private vulnerability reporting if it is enabled for this repository. If it is not enabled, contact the repository owner through GitHub and provide:

- A clear description of the issue
- Steps to reproduce
- Affected Windows version
- Whether the issue requires local access, user interaction, or elevated privileges
- Any logs, screenshots, or proof-of-concept details that help confirm the risk

## Security-Sensitive Areas

This project touches Windows APIs that can affect user privacy or system behavior:

- Screenshot capture
- Active window/process inspection
- Camera and microphone state
- Core Audio capture endpoint state
- Shell launches and URI handlers
- Media session metadata
- Elevated `pnputil` repair flows

Changes in these areas should be reviewed conservatively and documented clearly.

## Disclosure

After a report is confirmed, maintainers will try to provide a fix or mitigation in the next release and credit reporters when requested.
