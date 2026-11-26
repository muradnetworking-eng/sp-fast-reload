# Adding a technology

Choose one entry from `src/data/library.ts` and retain its ID. Add a directory named for the ID under `src/data/technologies/`. Export a named `technology` satisfying the `Technology` contract from its `index.ts`. The library loads it automatically.

1. Split the content into lessons, platform-specific recipes, lab and solutions, troubleshooting, scenarios, assessments, instructor guidance, and flashcards. Use the SR-MPLS module as a structure reference.
2. Use the stage IDs `understand`, `visualize`, `configure`, `verify`, `troubleshoot`, `apply`, and `defend`. Set the refresher ID to `reload`. The existing path engine uses these stages and the other content types.
3. Keep module-wide content IDs unique and stable. Preserve IDs when updating a lesson or review card so bookmarks, progress, and review history remain usable. Give replacement activities new IDs when they assess a different skill.
4. List primary sources and their scope, document the exact CLI OS and applicable platform or release, and record the review date. Use distinct labels for modeled results and device captures.
5. Add relative download paths below `public/downloads/<id>/`. Include a topology, addressing, student tasks, staged configs, final configs, and separate instructor solutions. Provide manual setup steps when emulator import compatibility is unverified.
6. Use `checkContent` in a test for the new module. Validate important model invariants for the lab and check search, deep links, review scheduling, and all seven paths in the production build. Add browser checks when the module introduces a distinct behavior or regression risk.
7. For an Anki package, register stable deck and model identifiers in `scripts/build-anki.py`, run it with `--technology <id>`, and add the relative package path to `ankiPackage`. Keep existing identifiers and card GUID inputs stable when revising a deck.

## Reusable Codex instruction

```text
Develop [TECHNOLOGY AND LIBRARY ID] as the next complete module in the existing
SP Fast-Reload repository. Read README.md, docs/ADDING-MODULES.md,
src/schemas/content.ts and the SR-MPLS module before editing.

Use primary Cisco and IETF references. Cite each platform-specific command set
and feature dependency and record a source review date. Use fictional lab
addresses and public sources. Report which examples were modeled, source-checked,
and executed, with the exact platform and release if you ran a device test.

Implement the 15-Min Reload and all seven stages. Reuse them across the existing
seven preparation paths. Include a staged Cisco lab with initial and final
configs, evidence-based fault tickets, architecture tradeoffs, senior interview
questions with scoring criteria, instructor prep with separate solutions, and
stable flashcard IDs. Explain what each verification check establishes and give
reproducible manual lab instructions if emulator import is unverified.

Use the existing schemas, UI, search, local persistence, readiness, and deployment
workflow. Keep stable IDs for existing content. Add the module contract and lab
checks, then run npm ci, typecheck, lint, unit tests, build and browser acceptance.
Report actual test results and runtime lab or deployment gaps.
```
