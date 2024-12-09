# Nero Chain Documentation

This is the official documentation for Nero Chain
(https://docs.nerochain.io/)

## Prerequisites

- Node.js ^20.11.1
- Yarn v3.8.3

## Install dependencies:

```bash
yarn install
```

## Run the development server:

```bash
yarn dev
```

## Preview Environments

When you create a PR from a feature/* branch, the following will happen automatically:
1. Amplify will deploy a preview environment
2. A preview URL will be added as a PR comment

### Branch Naming Convention
- New features: `feature/feature-name`
- Bug fixes: `fix/fix-description`
- Releases: `release/version`

### Notes
- Preview environment deployment takes a few minutes
- Preview URLs become invalid when the PR is merged or closed
