# BITIG - MULTI-AGENT EDITOR PIPELINE GUIDE

A documented, trackable editorial workflow for AI agents. Bitig follows the Facilitator Pattern: it never calls an LLM. The pipeline gives an external orchestrator (a human, a script, or an AI agent like Claude Code) a machine-readable conveyor belt over the tools from the analytics, review, and diagnostics suites.

## The Six Default Roles

`bitig pipeline:init` writes `pipeline.json` to the project root with six roles, executed in order per chapter:

| #   | Role id          | Completes via                                                                      | Artifact under `diagnostics/`         |
| --- | ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | `chapter-review` | `analyze:context` → `analyze:report`                                               | `diagnostic_<coords>.json`            |
| 2   | `continuity`     | `review:context --type continuity` → `review:report`                               | `review_continuity_<coords>.json`     |
| 3   | `style`          | `review:context --type style` → `review:report`                                    | `review_style_<coords>.json`          |
| 4   | `proofreader`    | `check --story-names` + `analyze:prose --json`, fix in place, then `pipeline:done` | `pipeline_proofreader_<coords>.json`  |
| 5   | `fact-checker`   | `context <coords>` (citations included), verify, then `pipeline:done`              | `pipeline_fact-checker_<coords>.json` |
| 6   | `final-editor`   | read all reports, apply fixes, `update:metadata --synopsis`, then `pipeline:done`  | `pipeline_final-editor_<coords>.json` |

A role counts as **done** for a chapter when its artifact file exists under `diagnostics/`. Roles 1-3 produce artifacts automatically through their report commands; roles 4-6 are marked explicitly:

```bash
bitig pipeline:done proofreader 1.2 --file notes.json   # notes.json is optional free-form JSON
```

`pipeline.json` is user-editable: reorder roles, delete ones you do not need, or add your own (`id`, `title`, `description`, `contextCommand`, `reportCommand`, `artifact` — commands and artifacts support the `{coords}` placeholder).

## The Orchestration Loop

For each chapter, loop until `pipeline:next` reports completion:

```bash
bitig pipeline:next 1.2
# → NEXT ROLE: Continuity Agent (`continuity`)
#   Context command:  bitig review:context 1.2 --type continuity
#   Report command:   bitig review:report 1.2 --type continuity --file <findings.json> --learn

# 1. Run the context command, hand its output to the agent for that role
# 2. Save the agent's output and run the report command
# 3. Repeat:
bitig pipeline:next 1.2
# ... until:
# → 🎉 All pipeline roles are complete for chapter 1.2!
```

Track progress at any time:

```bash
bitig pipeline:status 1.2    # per-role checklist for one chapter
bitig pipeline:status        # per-chapter progress table (e.g. 4/6)
```

## Re-running a Role

Delete the role's artifact under `diagnostics/` and the role becomes pending again:

```bash
rm diagnostics/review_style_1.2.json
bitig pipeline:next 1.2      # → Style Agent again
```

## Recommended Agent Wiring

- Give each role a fresh agent conversation seeded only with its context command output — roles are deliberately narrow so contexts stay small.
- Use `--learn` on the review report commands so accepted findings persist into `memory.json` and reach future writing agents automatically.
- The `final-editor` role should read every `diagnostics/*_<coords>.json` file, apply the accepted fixes to the chapter markdown, refresh the synopsis (`bitig update:metadata <coords> --synopsis "..."`), and only then run `pipeline:done final-editor <coords>`.
