#!/bin/bash
# .agents/hooks/check_setup.sh
# Read-only. Reports whether this project folder has everything the workflows need.
# Usage: bash .agents/hooks/check_setup.sh   (run from the project root)

PROBLEMS=0
ok()   { echo "  OK       $1"; }
miss() { echo "  MISSING  $1"; PROBLEMS=1; }
old()  { echo "  OUTDATED $1"; PROBLEMS=1; }

echo "Project folder: $(pwd)"
echo
echo "Kit files (copied with .agents/ and AGENTS.md):"
for f in AGENTS.md \
         .agents/rules/nextjs-todo.md \
         .agents/workflows/spec.md .agents/workflows/plan.md \
         .agents/workflows/slice.md .agents/workflows/autopilot.md \
         .agents/hooks/post_task.sh \
         .agents/templates/todo-nextjs/requirements.md \
         .agents/templates/todo-nextjs/task.md; do
  [ -f "$f" ] && ok "$f" || miss "$f"
done

echo
echo "Kit version:"
if [ -f .agents/rules/nextjs-todo.md ]; then
  grep -q "^## Versions" .agents/rules/nextjs-todo.md \
    && ok "rules file describes the versions (localStorage, then routes + database)" \
    || old "rules file has no Versions section. Re-copy .agents/ and AGENTS.md from the latest kit."
  grep -q "Service structure" .agents/rules/nextjs-todo.md \
    && ok "rules file describes the service structure under src/" \
    || old "rules file has no service structure. Re-copy .agents/ and AGENTS.md from the latest kit."
fi
[ -f .agents/workflows/plan.md ] && { grep -q "Status V" .agents/workflows/plan.md \
    && ok "plan workflow records approval per version" \
    || old "plan workflow is from an older kit. Re-copy .agents/ from the latest kit."; }

echo
echo "Project documents (created by /spec and /plan; not needed before you start):"
if [ -f requirements.md ]; then
  ok "requirements.md"
  grep -q "^## Versions" requirements.md \
    && ok "requirements.md has a Versions section" \
    || echo "  NOTE     requirements.md has no Versions section. /spec will add one."
else
  echo "  not yet  requirements.md (/spec creates it from the built-in template)"
fi
[ -f task.md ] && ok "task.md" || echo "  not yet  task.md (/plan creates it)"
[ -f implementation_plan.md ] && ok "implementation_plan.md" || echo "  not yet  implementation_plan.md (/plan creates it)"

echo
echo "Tools:"
for t in git node npm; do
  command -v "$t" >/dev/null 2>&1 && ok "$t $($t --version 2>/dev/null | head -1)" || miss "$t (install it)"
done
[ -d .git ] && ok "git repository" || miss "git repository (run: git init -b main)"

echo
if [ "$PROBLEMS" -eq 0 ]; then echo "SETUP OK"; else echo "SETUP HAS PROBLEMS (see above)"; fi
exit $PROBLEMS
