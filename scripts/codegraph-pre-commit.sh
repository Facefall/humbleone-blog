#!/usr/bin/env sh

# Refresh the CodeGraph index before each commit.
# Fails open so a missing CLI or index error does not block commits.

set -eu

root="$(git rev-parse --show-toplevel)"
cd "$root"

if ! command -v codegraph >/dev/null 2>&1; then
  printf '%s\n' 'codegraph: CLI not found, skipping pre-commit index' >&2
  exit 0
fi

if [ ! -d .codegraph ]; then
  printf '%s\n' 'codegraph: .codegraph not initialized, skipping (run: codegraph init)' >&2
  exit 0
fi

if ! codegraph index -q .; then
  printf '%s\n' 'codegraph: index failed, commit continues' >&2
fi

exit 0
