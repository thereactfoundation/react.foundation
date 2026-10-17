# Contributing to React Foundation

Thanks for contributing to the React Foundation website.

We operate with a **high bar for clarity, correctness, and maintainability**. This document outlines how to contribute effectively.

---

## Guiding Principles

- **Clarity over cleverness**
- **Tests before implementation**
- **Small, focused changes**
- **Explicit over implicit behavior**

---

## Getting Started

```bash
git clone https://github.com/react-foundation-dev/react.foundation.git
cd react.foundation
npm install
npm run dev
```

Before opening a PR, run the relevant checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## Workflow

### 1. Pick or Create an Issue

- Check existing issues first
- If creating a new one, use the closest matching issue template
- Use the content template for corrections to copy, links, or site information
- Include enough detail for maintainers to finalize acceptance criteria and a test plan

### 2. Branching

```bash
git checkout -b fix/<issue-id>-short-description
```

Use `feature/<issue-id>-short-description` for feature work and `docs/<issue-id>-short-description` for documentation-only changes.

### 3. Test-First Development (Required)

For behavior changes, write tests before implementation:

1. Reproduce the issue or define the new expected behavior
2. Add a test that captures that behavior
3. Confirm the test fails before the fix when practical
4. Implement the smallest change that passes the test
5. Refactor only after the test passes

### 4. Code Standards

- Follow existing patterns
- Avoid unnecessary abstractions
- Keep functions small and readable
- Prefer explicit naming

### 5. Commit Messages

Use clear, structured messages:

```text
Fix: resolve map popup navigation bug (#47)
```

Sign off every commit with `git commit -s`. This adds a `Signed-off-by` line for the [Developer Certificate of Origin](https://developercertificate.org/). The DCO check on each PR fails if a commit has no `Signed-off-by` line, or if its email does not match the commit author.

To sign off commits that are already on your branch:

```bash
# Replace 2 with the number of commits on your branch
git rebase --signoff HEAD~2
git push --force-with-lease
```

### 6. Pull Request Requirements

Every PR must:

- Link to an issue
- Explain why no issue is needed when there is no linked issue
- Include a clear summary
- Include a test plan
- Add or update tests
- Have every commit signed off (DCO)
- Pass CI

---

## Review Process

PRs are evaluated on:

- Correctness
- Test coverage
- Simplicity
- Maintainability

We may request changes even for working code if it does not meet standards.

Maintainers follow the detailed issue triage and PR review workflow in
[`.github/MAINTAINER_WORKFLOWS.md`](./MAINTAINER_WORKFLOWS.md).

---

## Labels

We use structured labels:

- `type:bug`
- `type:feature`
- `type:content`
- `type:ecosystem`
- `priority:P0` through `priority:P3`
- `status:needs-info`, `status:ready`, `status:blocked`, `status:in-progress`
- `good-first-issue`

---

## Code of Conduct

Be respectful, constructive, and professional. Harassment or toxic behavior will not be tolerated.

---

## Questions?

Open an issue with the `status:needs-info` label.
