# BITIG - AI REVIEW SUITE GUIDE (Continuity, Style & Plot Holes)

Bitig follows the Facilitator Pattern: it never calls an LLM. The review suite packages editorial context for an external AI agent and records the agent's findings, mirroring the `analyze:*` quality-scoring loop.

## The Review Loop

```bash
# 1. Package the review material for the agent
bitig review:context <coords> --type continuity
bitig review:context <coords> --type style
bitig review:context all --type plotholes        # book-wide (plotholes only)

# 2. The external AI agent analyzes the package and writes a findings JSON
#    matching the schema embedded in the package (e.g. findings.json)

# 3. Render the ASCII findings table and log it under diagnostics/
bitig review:report <coords> --type continuity --file findings.json

# Optionally feed accepted findings back into agent memory:
bitig review:report <coords> --type continuity --file findings.json --learn
```

## Findings JSON Schema

```json
{
  "findings": [
    {
      "severity": "high | medium | low",
      "kind": "continuity | style | plothole",
      "entityId": "optional story-bible id (character/place/event/thread)",
      "coords": "optional chapter coordinates like 1.2",
      "quote": "optional short quote from the manuscript",
      "explanation": "what is wrong and why (required)"
    }
  ],
  "summary": "optional overall assessment"
}
```

`explanation` is the only required field per finding. Reports are logged to `diagnostics/review_<type>_<coords>.json`. With `--learn`, each finding's explanation is appended to `memory.json` feedback (chapter scope for `X.Y` coordinates, global scope for `all`), so subsequent `bitig context` packs warn future writing agents automatically.

## What Each Review Type Packages

- **continuity** (chapter-scoped): the STORY BIBLE block relevant to the chapter (character cards, timeline neighborhood, open threads, world rules), the FULL event chronology, and the chapter text. The agent hunts for contradictions in traits, knowledge, injuries, locations, timeline order, and world rules.
- **style** (chapter-scoped): recorded memory (feedback/style/routines), every character's `speechStyle`, locally computed prose metrics (`analyze:prose` JSON), and the chapter text. The agent evaluates voice consistency and suggests concrete rewrites.
- **plotholes** (chapter or `all`): book structure with synopses, full event chronology, **setup events without a payoff** (Chekhov's guns), open plot threads, and world rules — deliberately synopses-based rather than full text so book-wide review stays within context limits. The agent flags unresolved setups, abandoned threads, unexplained knowledge, and foreshadowing opportunities.

## Division of Labor with `bitig check`

`bitig check` already catches the mechanically computable subset (dangling ids, unknown coordinates, date/order conflicts, unused entities). The review instructions explicitly tell the agent NOT to re-report those — review findings should be semantic judgments only.

## Keeping the Story Bible Current

The review quality is bounded by the story bible's accuracy. After each writing pass, record changes with `bitig add:event`, `bitig update:character`, and `bitig update:thread` before running reviews.
