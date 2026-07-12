# BITIG - STORY BIBLE GUIDE (Characters, Plot Timeline & World Building)

Bitig manages fiction consistency data in three optional JSON files under your assets directory (default `./assets`):

- `characters.json` — character profiles, relationships, arcs, speech styles.
- `plot.json` — plot threads and a chronological event timeline.
- `world.json` — places, organizations, species, technologies, world rules, and a lore dictionary.

All three files are optional. Projects without them behave exactly as before. All cross-references use string `id` values (kebab-case recommended). Every entity supports `aliases` (used for name matching in chapter text) and free-form `notes`. The system works for non-fiction too: characters = real persons, events = historical events, lore = glossary.

---

## 1. Scaffolding

```bash
bitig story:init                          # creates all three template files
bitig story:init --only characters,plot   # limit to specific files
bitig story:init --force                  # overwrite existing files
bitig init --fiction                      # new project + story bible templates
```

## 2. JSON Schemas

### characters.json

```json
{
  "version": 1,
  "characters": [
    {
      "id": "aylin",
      "name": "Aylin Demir",
      "aliases": ["Ay", "Dr. Demir"],
      "role": "protagonist",
      "status": "alive",
      "birthDate": "1990-04-12",
      "deathDate": null,
      "summary": "One-paragraph identity summary injected into context.",
      "physical": {
        "age": 34,
        "height": "1.68m",
        "hair": "black",
        "eyes": "green",
        "distinguishingMarks": ["scar on left hand"]
      },
      "personality": ["stubborn", "loyal"],
      "speechStyle": "Short sentences, avoids jargon.",
      "goals": ["find her brother"],
      "arc": [{ "coords": "1.1", "state": "naive, trusts the institute" }],
      "relationships": [
        { "characterId": "murat", "type": "brother", "description": "estranged since 2010" }
      ],
      "firstAppearance": "1.1",
      "tags": [],
      "notes": ""
    }
  ]
}
```

`birthDate`/`deathDate` accept ISO dates **or** free-form story-calendar strings; arithmetic consistency checks only run on parseable dates. `role` is a free string (suggested: protagonist, antagonist, supporting, minor, narrator, historical-figure).

### plot.json

```json
{
  "version": 1,
  "threads": [
    {
      "id": "missing-brother",
      "title": "The search for Murat",
      "summary": "Main mystery.",
      "status": "open",
      "introducedIn": "1.1",
      "resolutionCoords": null
    }
  ],
  "events": [
    {
      "id": "ev-train-crash",
      "title": "The Haydarpaşa train crash",
      "summary": "Murat disappears in the crash.",
      "type": "setup",
      "payoffFor": null,
      "date": "2010-08-17",
      "order": 10,
      "coords": ["1.2"],
      "characterIds": ["aylin", "murat"],
      "placeIds": ["haydarpasa"],
      "threadIds": ["missing-brother"],
      "consequences": [],
      "notes": ""
    }
  ]
}
```

`order` is an integer for explicit chronological ordering (fictional calendars supported — dates optional). `type` is `event | setup | payoff`; `payoffFor` references a setup event id (used by future plot-hole analysis). `coords` lists the chapters where the event is narrated. `threads.status` is `open | resolved | abandoned`.

### world.json

Six categories with a uniform shape (`id`, `name`/`title`/`term`, `aliases`, `description`/`definition`, `notes`):

- `places` — extra fields: `type`, `parentId`, `coords`, `tags`
- `organizations` — extra fields: `type`, `memberCharacterIds`, `placeIds`
- `species` — extra field: `traits`
- `technologies` — extra field: `rules`
- `rules` — `{ id, title, description, scope }` — standing world laws, ALWAYS injected into context
- `lore` — `{ id, term, aliases, definition }` — glossary / lore dictionary

## 3. CRUD Commands

```bash
# Characters
bitig add:character aylin --name "Aylin Demir" --role protagonist --summary "..." --alias "Ay,Dr. Demir"
bitig update:character aylin --json '{"speechStyle": "Short sentences.", "relationships": [{"characterId": "murat", "type": "brother"}]}'
bitig delete:character aylin
bitig list:characters            # ASCII table
bitig list:characters aylin      # full JSON card

# Plot
bitig add:thread missing-brother --title "The search for Murat"
bitig add:event ev-crash --title "The crash" --date 2010-08-17 --order 10 --coords 1.2 --characters aylin,murat --places haydarpasa --threads missing-brother
bitig update:thread missing-brother --status resolved --coords 3.4
bitig list:events --thread missing-brother

# World
bitig add:world place haydarpasa --name "Haydarpaşa Station" --type building --summary "..."
bitig add:world rule no-time-travel --title "No time travel" --summary "Flashbacks are memory only."
bitig add:world lore bitig --name "bitig" --summary "Old Turkic for 'book, inscription'."
bitig list:world place
```

Rich fields (relationships, arc, physical, consequences) are set via `--json '<object>'` or `--file <path.json>` — this is the recommended path for AI agents. Explicit flags override `--json` values.

## 4. Context Injection

`bitig context <coords>` automatically injects a STORY BIBLE block when story files exist:

- **Characters in scope** (full cards): characters whose name/alias appears in the target or preceding chapter, are tagged on events at those coordinates, or whose arc/firstAppearance matches. Everyone else appears as a compact one-line roster.
- **Timeline**: events at the target/preceding coordinates plus their chronological neighbors.
- **Open plot threads** with their introduction points.
- **World reference**: entries mentioned in the text or referenced by the selected events.
- **World rules**: always injected in full.

Filter layers with `--story characters,plot` or disable with `--story none`.

## 5. Consistency Checks

`bitig check` validates story data whenever the files exist:

- JSON parse errors, duplicate ids, dangling id references (errors)
- Coordinates pointing to non-existent chapters (warning)
- Timeline conflicts: `date` ordering contradicting `order` (error), duplicate `order` values, unparseable dates without `order` (warnings)
- Characters not yet born / already dead at event dates, age vs birthDate mismatches (warnings)
- Non-reciprocal relationships and unused characters/places (warnings)
- `bitig check --story-names` additionally scans for capitalized mid-sentence words occurring 3+ times that match no registered name (opt-in heuristic; skipped for German).

## 6. AI Agent Workflow Loop

1. `bitig context <coords>` — read the prompt pack including the STORY BIBLE block.
2. Write/edit the chapter markdown.
3. Record what changed so the story bible stays current:
   - `bitig add:event <id> --title "..." --coords <coords> --characters <ids>`
   - `bitig update:character <id> --json '{"arc": [...]}'`
   - `bitig update:thread <id> --status resolved --coords <coords>`
4. `bitig check` — verify no consistency errors were introduced.
5. Continue with the standard loop (`capture`, `analyze:context`, `analyze:report`, `learn`, `update:metadata`).
