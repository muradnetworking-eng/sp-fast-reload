# SP Fast-Reload

A browser-local Cisco service provider engineering workspace with developed L2VPN, MPLS L3VPN, MPLS Foundations, Segment Routing over MPLS, and BGP / MP-BGP modules. The library includes 15 additional domains marked **Not Yet Developed**.

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
| `src/data/technologies/<id>/` | Independent L2VPN, MPLS L3VPN, MPLS Foundations, SR-MPLS, and BGP modules with a refresher, seven learning stages, recipes and lab, troubleshooting, scenarios, interviews, training, cards, and primary sources |
| `src/schemas/` and `src/lib/` | Content contract, path assembly, search index, content validation, and downloads |
| `src/state/` | Versioned local progress, review scheduling, and evidence |
| `public/downloads/<id>/` | Lab topology, student workbook, instructor key, configurations, ZIP, and Anki deck for each developed module |
| `tests/` | Progress and module checks, topology assertions, and production browser acceptance |
| `.github/workflows/deploy.yml` | GitHub Actions build and Pages deployment |

## Use the L2VPN module

Open **Technology Library → L2VPN**. Start with the point-to-point VPWS packet walk, then add a three-PE VPLS service and inspect MAC learning, unknown-destination flooding, and pseudowire split horizon. Separate customer VLAN classification, PW identity, service labels, and core transport throughout the lessons.

The eight-router lab uses five IOS XR provider routers and three IOS XE customer routers. CE1 and CE2 share a VLAN 100 VPWS service; all three CEs participate in VLAN 200 VPLS. The PEs normalize each local service tag before Ethernet PW transport. Build the underlay, attachment circuits, VPWS, and VPLS in separate checkpoints. The workbook includes IPv4/IPv6 CE traffic, MAC and label evidence, fault injection, restoration, and a VLAN translation experiment. The student tasks and instructor solutions are separate downloads.

Control-plane session state, negotiated PW state, core LSP tests, and customer Ethernet delivery establish different evidence. The lessons cover control words, service and transport MTU, VCCV, MAC aging and movement, flooding and loop controls, redundancy, signaling alternatives, and migration to EVPN. Platform and release support are qualified for each command set. The baseline is a manually constructed teaching topology; the configurations and modeled outputs have not been executed on Cisco devices or emulators.

Progress, preferences, bookmarks, and flashcard reviews use the independent `l2vpn` namespace. Existing backups retain the other modules' records.

## Use the MPLS L3VPN module

Open **Technology Library → MPLS L3VPN**. Follow a customer route from PE–CE learning into a VRF, VPNv4/VPNv6 advertisement, route-target import, and programmed forwarding. Trace the service and transport labels independently, including the VPN label that remains after transport PHP.

The nine-router lab uses two IOS XR PEs, two P routers, an IP-only route reflector, and four IOS XE customer routers. ACME and BETA deliberately reuse their IPv4 and IPv6 addresses. Build the underlay, VRFs, explicit PE–CE policies, VPNv4 service, and VPNv6 service in separate checkpoints. Download the student workbook, instructor solutions, initial and final configurations, fault scripts, and optional tenant-isolation and same-AS experiments.

Matching pings alone cannot prove isolation when the destination addresses overlap. Inspect the VRF and RT state and use the optional ACME-only test prefix to check both permitted reachability and absence from BETA. Advanced lessons cover static and OSPF PE–CE routing, same-AS loop prevention, shared services and hub-and-spoke policies, route-reflector scale, Inter-AS A/B/C, and Carrier Supporting Carrier. Advanced interconnection designs require additional topology and release-specific validation; the supplied baseline is a single-provider service.

CLI references use ASR 9000 IOS XR 7.11.x and scoped IOS XE 17.x examples. Labels and expected outputs are modeled. The configuration sets have not been executed on Cisco devices or emulators. Study, practice, notes, and reviews use their own `mpls-l3vpn` progress namespace alongside the existing modules.

## Use the MPLS Foundations module

Open **Technology Library → MPLS Foundations**. Start with a FEC and follow the selected IP next hop to the downstream LDP binding and the installed label action. The refresher and seven learning stages explain discovery and session establishment, label distribution, PHP and explicit-null, TTL and traffic-class handling, MTU budgets, and verification of the actual LSP.

The four-router IOS XR lab uses a three-link primary path, PE1–P1–P2–PE2, so ingress push, transit swap, and penultimate pop occur on separate routers. OSPF and LDP are built in stages. Alternate links support failure and ECMP experiments. Later checkpoints cover explicit-null, IGP/LDP synchronization, and scoped TTL/MTU exercises. Download the student workbook, separate instructor solutions, staged configurations, and complete final configurations from the lab viewer.

Labels in examples are symbolic or explicitly illustrative. Record the labels allocated by your own images and compare the sender's rewrite to the next router's incoming lookup. The IPv4 baseline can fall back to ordinary IP in some LDP failure states, so record whether a probe proves IP reachability or labeled forwarding. A service-label packet walk explains the extra dependency when the core cannot route the customer destination. Device and emulator execution remain pending.

## Use the SR-MPLS module

- **Emergency refresh and progressive study.** Follow a 15-minute refresher or seven stages from the forwarding model through design and teach-back. The viewer also has technical review, lab, senior interview, architecture, and instructor paths.
- **Implementation and lab.** Build a four-router Level 2 IS-IS SR-MPLS core. Verify SID advertisements, ingress label imposition, PHP, and precomputed repair. Compare steady-state and post-failure paths. The workbook gives manual CML/EVE-NG setup instructions, with separate student tasks and instructor solutions.
- **Troubleshooting and design.** Choose an investigation before seeing a diagnosis. Work through customer designs for LDP migration, protection, bandwidth admission, and SRv6 adoption.
- **Assessment and retention.** Reveal solutions on demand, self-score a mock interview, review a spaced repetition deck, and record lab experience against seven readiness dimensions. Dashboard totals and weak subtopics come from your recorded activity.

The lab uses Cisco ASR 9000 IOS XR 7.11.x documentation as its primary command reference and includes a scoped IOS XE 17.x comparison. Technical references and review date appear in the viewer. Expected CLI results are explicitly illustrative. Automated checks cover topology addressing, config consistency, label-index and link-cost expectations. The configuration has not been executed on a Cisco router or emulator. Check your exact image, release and platform for OAM, repair, supported stack depth, and dataplane fidelity before relying on those capabilities.

## Use the BGP / MP-BGP module

Open **Technology Library → BGP / MP-BGP**. Use the refresher to recover session, policy, next-hop, and best-path checks, or follow the seven stages from a first route advertisement to architecture and instruction.

The practical lab uses four IOS XR core routers and two IOS XE customer routers. First build IPv4 and IPv6 unicast peering through a route reflector, including the routes required by the transit router. Then move the customer interfaces into the CORAL VRF and build VPNv4/VPNv6 distribution over an MPLS/LDP core. The workbook explains each conversion and provides complete global and VPN checkpoints. An optional second CE link supports preference and failover experiments. The single-reflector base lab has explicit availability limits.

Troubleshooting starts from observed symptoms and hides the diagnosis until you choose a check. Exercises cover address-family capabilities, policy disposition, attribute comparison, route reflection, RIB/FIB resolution, and the separate service and transport labels. Architecture cases, mock interviews, instructor preparation, and flashcards reuse the same mechanisms and lab plan.

Progress, preferences, bookmarks, and review histories are scoped by technology. Existing SR-MPLS JSON backups remain compatible. CLI is referenced to IOS XR 7.11.x and scoped IOS XE 17.x guides. Expected outputs are modeled, and device or emulator execution is pending.

## Verify the build

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The browser test serves `dist` beneath `/sp-fast-reload/`, opens bookmarked hash routes directly, reloads them, exercises all five modules, checks file downloads, and verifies isolation of their study and review data. To use an existing Chromium or Chrome executable, set `SP_RELOAD_CHROME` to its absolute path. Use `npm run preview` to preview the production build at the local URL printed by Vite.

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

Use **Flashcards / Anki → Export Anki TSV** to export the selected technology and subtopic. In Anki, use a note type with fields `ID`, `Front`, and `Back`. Map the final column to tags and enable HTML. Use `ID` as the first field for stable import matching. Each developed module has an `.apkg` download. To regenerate a deck after changing source cards, install `genanki==0.13.1` in a Python environment after `npm ci`, then run `python scripts/build-anki.py --technology <id>` with `l2vpn`, `mpls-l3vpn`, `mpls-foundations`, `bgp`, or `sr-mpls`. The builder verifies the package's SQLite integrity, stable note GUIDs, card linkage, and exact source fields before replacing the output file.

## Add the next technology

Follow [Adding a technology](docs/ADDING-MODULES.md), which includes a reusable Codex instruction template.
