#!/usr/bin/env bash
set -euo pipefail

# Resolve known PR conflicts for Node.js migration files.
# Usage:
#   scripts/resolve-pr-conflicts.sh ours    # keep current branch versions (default)
#   scripts/resolve-pr-conflicts.sh theirs  # keep target branch versions

STRATEGY="${1:-ours}"
if [[ "$STRATEGY" != "ours" && "$STRATEGY" != "theirs" ]]; then
  echo "Invalid strategy: $STRATEGY (use 'ours' or 'theirs')" >&2
  exit 1
fi

FILES=(
  ".env.example"
  "README.md"
  "docker-compose.yml"
  "src/server.js"
  "src/tunnels.js"
  "test/tunnels.test.js"
)

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository" >&2
  exit 1
fi

if [[ -z "$(git ls-files -u)" ]]; then
  echo "No merge conflicts detected."
  exit 0
fi

for f in "${FILES[@]}"; do
  if git ls-files -u -- "$f" | grep -q .; then
    git checkout --"$STRATEGY" -- "$f"
    git add "$f"
    echo "Resolved $f using '$STRATEGY'"
  fi
done

if [[ -n "$(git ls-files -u)" ]]; then
  echo "Some conflicts remain. Run: git status" >&2
  exit 2
fi

echo "All listed conflicts resolved. Next: git commit"
