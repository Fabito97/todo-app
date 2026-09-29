#!/bin/bash
# .agents/hooks/post_task.sh
# Quality gate. Called after a skill completes work, and by the /slice and /verify workflows.
#
# Usage: bash .agents/hooks/post_task.sh <skill-name> [fast|full]
#   fast (default): lint + typecheck + unit/API tests
#   full:           fast + end-to-end tests
#
# Exit code is non-zero if any gate fails. For the incremental-orchestrator, a
# missing required npm script is a failure, not a skip, so the gate can never
# silently pass on a project that has no checks.

SKILL_NAME=${1:-unknown}
MODE=${2:-fast}

echo "Task completed by skill: $SKILL_NAME (gate mode: $MODE)"

# Only builders are gated. Doc and planning skills just report.
if [ "$SKILL_NAME" != "incremental-orchestrator" ]; then
  echo "No quality gate configured for skill '$SKILL_NAME'."
  exit 0
fi

if [ ! -f package.json ]; then
  echo "GATE FAILED: no package.json in $(pwd). Run /bootstrap first."
  exit 1
fi

has_script() {
  node -e "const s=(require('./package.json').scripts)||{}; process.exit(s['$1']?0:1)"
}

run_step() {
  local name=$1
  local required=$2
  if has_script "$name"; then
    echo "--- npm run $name"
    if ! npm run "$name" --silent; then
      echo "GATE FAILED at step: $name"
      exit 1
    fi
  elif [ "$required" = "required" ]; then
    echo "GATE FAILED: required npm script '$name' is missing from package.json. Run /bootstrap."
    exit 1
  else
    echo "--- skipping optional step: $name"
  fi
}

run_step lint required
run_step typecheck required
run_step test required

if [ "$MODE" = "full" ]; then
  run_step e2e required
fi

echo "GATE PASSED ($MODE)"
exit 0
