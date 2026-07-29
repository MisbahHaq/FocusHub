# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Focus Synergy, please report it by opening a confidential issue or emailing the maintainers.

We will acknowledge receipt within 48 hours and provide an estimated timeline for a fix.

Please do not disclose vulnerabilities publicly until they have been addressed.

## Security Practices

- Firebase API keys are injected at build time via environment variables
- No secrets or credentials are committed to the repository
- CSP headers are configured in production deployments
- All data in transit is encrypted via HTTPS/WSS
- Local storage mode keeps data on-device only
