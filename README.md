# SP Fast-Reload

A browser-local Cisco service provider engineering workspace. Segment Routing over MPLS is the first developed module. The library includes 19 additional domains marked **Not Yet Developed**.

## Start locally

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Start at **Dashboard**, then use **15-Min Reload** or **Start learning**. The two selectors at the top of the technology viewer recommend a preparation path. Each path links to the same lessons, checks, and cases. Use **Ctrl+K** or **Cmd+K** to search by command, symptom, or concept.

## Repository structure

| Path | Contents |
| --- | --- |
| `src/components/` | Dashboard, library, topic viewer, search, labs, practice, flashcards, and readiness |
| `src/data/library.ts` | Technology taxonomy and module discovery |
| `src/data/technologies/sr-mpls/` | SR-MPLS refresher, seven learning stages, implementation and lab, troubleshooting, scenarios, interviews, training, cards, and primary sources |
| `src/schemas/` and `src/lib/` | Content contract, path assembly, search index, content validation, and downloads |
| `src/state/` | Versioned local progress, review scheduling, and evidence |
| `public/downloads/sr-mpls/` | Lab topology, student workbook, instructor key, configurations, ZIP, and Anki deck |
| `tests/` | Progress and module checks, topology assertions, and production browser acceptance |
| `.github/workflows/deploy.yml` | GitHub Actions build and Pages deployment |

## Use the SR-MPLS module

- **Emergency refresh and progressive study.** Follow a 15-minute refresher or seven stages from the forwarding model through design and teach-back. The viewer also has technical review, lab, senior interview, architecture, and instructor paths.
- **Implementation and lab.** Build a four-router Level 2 IS-IS SR-MPLS core. Verify SID advertisements, ingress label imposition, PHP, and precomputed repair. Compare steady-state and post-failure paths. The workbook gives manual CML/EVE-NG setup instructions, with separate student tasks and instructor solutions.
- **Troubleshooting and design.** Choose an investigation before seeing a diagnosis. Work through customer designs for LDP migration, protection, bandwidth admission, and SRv6 adoption.
- **Assessment and retention.** Reveal solutions on demand, self-score a mock interview, review a spaced repetition deck, and record lab experience against seven readiness dimensions. Dashboard totals and weak subtopics come from your recorded activity.

The lab uses Cisco ASR 9000 IOS XR 7.11.x documentation as its primary command reference and includes a scoped IOS XE 17.x comparison. Technical references and review date appear in the viewer. Expected CLI results are explicitly illustrative. Automated checks cover topology addressing, config consistency, label-index and link-cost expectations. The configuration has not been executed on a Cisco router or emulator. Check your exact image, release and platform for OAM, repair, supported stack depth, and dataplane fidelity before relying on those capabilities.

## Verify the build

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The browser test serves `dist` beneath `/sp-fast-reload/`, opens bookmarked hash routes directly, reloads them, exercises the study flows and checks file downloads. To use an existing Chromium or Chrome executable, set `SP_RELOAD_CHROME` to its absolute path. Use `npm run preview` to preview the production build at the local URL printed by Vite.

## Deploy to personal GitHub Pages

1. Create an empty `sp-fast-reload` repository under your personal account on github.com. Choose repository visibility according to your account's Pages support.
2. Set your personal Git author identity in this checkout if you plan to amend or make future commits. The initial local commit uses a project identity to keep work account details out of public Git metadata.
3. Run the following commands with your account name.

   ```sh
   git remote add origin https://github.com/YOUR-ACCOUNT/sp-fast-reload.git
   git push -u origin main
   ```

4. Open **Settings → Pages** and select **GitHub Actions** as the source. In **Actions**, run **Build and deploy to GitHub Pages** if the first push ran before Pages was enabled.
5. Open the `github-pages` deployment URL from the successful run. Confirm that `#/technology/sr-mpls/guide/verify` loads directly and after refresh. Download a lab file and check the navigation from the deployed URL.

Vite uses a relative base and React Router uses `HashRouter`, so the static host receives requests for the repository root and assets. The workflow is configured and the repository-subpath build is verified locally. Publication requires an authenticated personal GitHub repository with Pages enabled.

## Back up progress and export cards

Use **My Readiness → Export Progress (JSON)** to save a portable backup. In another browser, open **My Readiness → Import Progress (JSON)**, select the file, and confirm **Replace progress**. Use **Reset progress** and confirm to start over. The backup includes notes you entered, so store it accordingly. Each browser profile and site origin has its own data.

Use **Flashcards / Anki → Export Anki TSV** to export the selected technology and subtopic. In Anki, use a note type with fields `ID`, `Front`, and `Back`. Map the final column to tags and enable HTML. Use `ID` as the first field for stable import matching. The full SR-MPLS deck is also available as an `.apkg` in the app. All 18 cards imported into a fresh collection with the Anki backend and re-imported without duplicates. To regenerate it after changing the source cards, run `python -m pip install genanki==0.13.1` followed by `python scripts/build-anki.py` after `npm ci`.

## Add the next technology

Follow [Adding a technology](docs/ADDING-MODULES.md), which includes a reusable Codex instruction template.
