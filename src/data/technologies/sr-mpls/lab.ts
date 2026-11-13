import type { Block, Lab, Unit } from '../../../schemas/content'

const xr = 'Cisco IOS XR · ASR 9000 7.11.x'
const xe = 'Cisco IOS XE 17 · Access and Edge Routers'
const diagram: Block = {
  kind: 'diagram',
  title: 'Four routers, five point-to-point links',
  text: [
    '       10              10',
    ' PE1 ------- P1 ------------- PE2',
    '   \\          |               /',
    ' 20 \\         | 5            / 25',
    '     -------- P2 ------------',
    'Every metric applies in both directions at baseline.',
  ].join('\n'),
}
const links: Block = {
  kind: 'table',
  headers: ['Link', 'Endpoint A', 'Endpoint B', 'Metric each way'],
  rows: [
    ['10.0.12.0/31', 'PE1 Gi0/0/0/0 · 10.0.12.0', 'P1 Gi0/0/0/0 · 10.0.12.1', '10'],
    ['10.0.13.0/31', 'PE1 Gi0/0/0/1 · 10.0.13.0', 'P2 Gi0/0/0/0 · 10.0.13.1', '20'],
    ['10.0.23.0/31', 'P1 Gi0/0/0/1 · 10.0.23.0', 'P2 Gi0/0/0/1 · 10.0.23.1', '5'],
    ['10.0.24.0/31', 'P1 Gi0/0/0/2 · 10.0.24.0', 'PE2 Gi0/0/0/0 · 10.0.24.1', '10'],
    ['10.0.34.0/31', 'P2 Gi0/0/0/2 · 10.0.34.0', 'PE2 Gi0/0/0/1 · 10.0.34.1', '25'],
  ],
}
const identities: Block = {
  kind: 'table',
  headers: ['Node', 'Loopback0', 'IS-IS NET', 'Prefix-SID index', 'Label in the shared SRGB'],
  rows: [
    ['PE1', '10.0.0.1/32', '49.0001.0000.0000.0001.00', '1', '16001'],
    ['P1', '10.0.0.2/32', '49.0001.0000.0000.0002.00', '2', '16002'],
    ['P2', '10.0.0.3/32', '49.0001.0000.0000.0003.00', '3', '16003'],
    ['PE2', '10.0.0.4/32', '49.0001.0000.0000.0004.00', '4', '16004'],
  ],
}
const addressPE1: Block = {
  kind: 'cli',
  title: 'PE1 · Number the links and Loopback0',
  os: xr,
  code: [
    'configure',
    'hostname PE1',
    'interface Loopback0',
    ' ipv4 address 10.0.0.1 255.255.255.255',
    ' exit',
    'interface GigabitEthernet0/0/0/0',
    ' ipv4 address 10.0.12.0 255.255.255.254',
    ' no shutdown',
    ' exit',
    'interface GigabitEthernet0/0/0/1',
    ' ipv4 address 10.0.13.0 255.255.255.254',
    ' no shutdown',
    ' exit',
    'commit',
    'end',
  ].join('\n'),
  note: 'Repeat with the corresponding file for the other three routers. Both addresses of each /31 are point-to-point endpoints. Confirm actual interface names before applying.',
}
const isisPE1: Block = {
  kind: 'cli',
  title: 'PE1 · Configure Level 2 IS-IS',
  os: xr,
  code: [
    'configure',
    'router isis CORE',
    ' is-type level-2-only',
    ' net 49.0001.0000.0000.0001.00',
    ' address-family ipv4 unicast',
    '  metric-style wide',
    '  router-id Loopback0',
    '  exit',
    ' interface Loopback0',
    '  passive',
    '  address-family ipv4 unicast',
    '   exit',
    '  exit',
    ' interface GigabitEthernet0/0/0/0',
    '  point-to-point',
    '  address-family ipv4 unicast',
    '   metric 10',
    '   exit',
    '  exit',
    ' interface GigabitEthernet0/0/0/1',
    '  point-to-point',
    '  address-family ipv4 unicast',
    '   metric 20',
    '   exit',
    '  exit',
    ' exit',
    'commit',
    'end',
  ].join('\n'),
  note: 'Use unique system IDs in the NET. IPv4 unicast under each routed port enables this topology there. Passive Loopback0 advertises the prefix without forming a neighbor. The router ID identifies the node in the IPv4 topology. The interface metric applies in the outbound direction.',
}
const underlayCheck: Block = {
  kind: 'cli',
  title: 'PE1 · Check links, adjacencies, and routes',
  os: xr,
  code: 'show ipv4 interface brief\nshow isis adjacency\nshow route ipv4 10.0.0.4/32\nping 10.0.0.4 source 10.0.0.1',
  note: 'Run after committing all four IS-IS configurations. Source the ping from Loopback0 so the return path also depends on the routed underlay.',
  output: 'Expected fields (illustrative)\nIS-IS Level 2 neighbors  P1 and P2, Up\nRoute to 10.0.0.4/32    Via 10.0.12.1, Gi0/0/0/0\nLoopback-to-loopback     Echo requests receive replies',
  interpretation: 'Shortest link sum is 10 + 10 = 20. The displayed prefix metric may also include the metric PE2 advertises for Loopback0. An absent route with both neighbors up calls for checking PE2’s LSP and passive loopback, then RIB selection.',
}
const srPE2: Block = {
  kind: 'cli',
  title: 'PE2 · Reserve the range and originate SID index 4',
  os: xr,
  code: [
    'configure',
    'segment-routing global-block 16000 23999',
    'router isis CORE',
    ' address-family ipv4 unicast',
    '  segment-routing mpls',
    '  exit',
    ' interface Loopback0',
    '  address-family ipv4 unicast',
    '   prefix-sid index 4',
    '   exit',
    '  exit',
    ' exit',
    'commit',
    'end',
  ].join('\n'),
  note: 'Apply the equivalent stage to all four nodes using their own indexes. The range is the documented XR default and is explicit here to show the contract. IS-IS activates MPLS on its active interfaces and advertises a Prefix-SID for the loopback.',
}
const sidCheck: Block = {
  kind: 'cli',
  title: 'PE1 · Verify what IS-IS received and resolved',
  os: xr,
  code: 'show mpls label table label 16000 detail\nshow isis database verbose\nshow isis route sr-only',
  note: 'Use the local allocation command for PE1’s SRGB and the PE2 LSP for what PE2 advertised. In the PE2 LSP look for both router capability and the extended IPv4 reachability entry.',
  output: 'Expected fields (illustrative)\nPE1 label table: SRGB start 16000, size 8000\nPE2 Router Capability: SRGB base 16000, range 8000\nPE2 IPv4 reachability: 10.0.0.4/32, Prefix-SID index 4, Algorithm 0, N=1',
  interpretation: 'Base and range identify how a receiver maps index values on that router. Index 4 is the fifth position. The N flag marks a node segment on this loopback. A plain IPv4 reachability entry can be present while its Prefix-SID sub-TLV is missing.',
}
const ingressCheck: Block = {
  kind: 'cli',
  title: 'PE1 · Prove the imposed label',
  os: xr,
  code: 'show route ipv4 10.0.0.4/32\nshow cef ipv4 10.0.0.4/32 detail',
  note: 'The RIB shows the selected IP path. Read the active CEF next hop and its label rewrite to determine what traffic uses.',
  output: 'Expected fields (illustrative)\nPrefix      10.0.0.4/32\nNext hop    10.0.12.1 via Gi0/0/0/0\nLabel push  16004',
  interpretation: 'PE1 sends 16000 + 4 because P1’s SRGB is the receiving block on the first hop. PE1’s own local LFIB is a separate lookup for traffic arriving already labeled.',
}
const transitCheck: Block = {
  kind: 'cli',
  title: 'P1 · Follow the incoming label to PE2',
  os: xr,
  code: 'show mpls forwarding labels 16004 detail',
  note: 'Read the active row on P1. If the image prints No ID or a different prefix representation, correlate the label with CEF and the IS-IS advertisement.',
  output: 'Expected fields (illustrative)\nLocal label  Outgoing action  Interface    Next hop\n16004        Pop              Gi0/0/0/2    10.0.24.1',
  interpretation: 'P1 receives 16004, pops it as the penultimate hop, and forwards to PE2. A single-label probe is IP on that final wire. A VPN service label beneath the transport label would remain for PE2.',
}
const oamEnable: Block = {
  kind: 'cli',
  title: 'All routers · Enable MPLS OAM when supported',
  os: xr,
  code: 'configure\nmpls oam\n exit\ncommit\nend',
  note: 'Use this optional block for MPLS OAM checks on supporting images. A parser or feature limitation does not prevent inspecting CEF, the LFIB, and an MPLS-capable link capture.',
}
const oamCheck: Block = {
  kind: 'cli',
  title: 'PE1 · Test IP reachability and the SR FEC',
  os: xr,
  code: 'ping 10.0.0.4 source 10.0.0.1\nping sr-mpls 10.0.0.4/32 fec-type igp isis\ntraceroute sr-mpls 10.0.0.4/32 fec-type igp isis',
  note: 'The forwarding equivalence class (FEC) is the destination and forwarding context tested by the MPLS probe. Use MPLS OAM when the image supports it.',
  output: 'Expected evidence (illustrative)\nIP echo receives replies.\nSR echo succeeds for PE2’s IS-IS Prefix-SID.\nSR trace follows P1 and reaches PE2 at baseline.',
  interpretation: 'An IP echo alone leaves open whether the intended label-switched path was used. Pair the probe with PE1’s imposed label and P1’s rewrite. An OAM timeout alone may be a probe or reply-path problem. Locate the first divergence with trace, LFIB, and capture.',
}
const stackedProbe: Block = {
  kind: 'cli',
  title: 'PE1 · Trace an ordered two-segment stack (optional)',
  os: xr,
  code: 'traceroute sr-mpls multipath labels 16003,16004 output interface GigabitEthernet 0/0/0/0 nexthop 10.0.12.1',
  note: 'Use the restored baseline and enable MPLS OAM on supporting images. This custom Nil-FEC trace supplies a label stack and initial adjacency. It tests the stack’s forwarding path without steering ordinary traffic into a policy.',
  output: 'Expected label operations (illustrative)\nPE1 → P1    Push [16003, 16004]\nP1  → P2    Pop 16003, send [16004]\nP2  → P1    Swap 16004 for 16004\nP1  → PE2   Pop 16004',
  interpretation: 'Each segment runs its own shortest-path instruction. Returning through P1 is intentional because the active segment changed from P2 to PE2. The path makes progress through the ordered stack and does not repeat indefinitely.',
}
const protectionPE1: Block = {
  kind: 'cli',
  title: 'PE1 · Protect the local interface toward P1',
  os: xr,
  code: [
    'configure',
    'ipv4 unnumbered mpls traffic-eng Loopback0',
    'router isis CORE',
    ' interface GigabitEthernet0/0/0/0',
    '  address-family ipv4 unicast',
    '   fast-reroute per-prefix',
    '   fast-reroute per-prefix ti-lfa',
    '   exit',
    '  exit',
    ' exit',
    'commit',
    'end',
  ].join('\n'),
  note: 'Per-prefix FRR enables backup calculation for traffic using that interface as primary. TI-LFA allows a segment list when a conventional alternate is unsafe. The unnumbered statement supplies the default source for an automatic SR-TE policy if required. Apply the stage to all nodes and inspect the affected router before testing.',
}
const protectionCheck: Block = {
  kind: 'cli',
  title: 'PE1 and P1 · Inspect the preinstalled backup before failure',
  os: xr,
  code: 'show isis fast-reroute 10.0.0.4/32 detail\nshow cef ipv4 10.0.0.4/32 detail\nshow mpls forwarding labels 16004 detail',
  note: 'Identify the point of local repair (PLR), the primary interface, and a backup that avoids it. Read the outgoing label actions and protection type from your image.',
  output: 'Expected backup candidates in this model (illustrative)\nPE1 primary → P1, backup first hop → P2 (10.0.13.1)\nP1 primary → PE2, backup first hop → P2 (10.0.23.1)',
  interpretation: 'PE1 can use P2 as a loop-free link alternate back toward P1 and PE2. At P1, P2’s intact shortest path to PE2 returns to P1. A repair must constrain forwarding beyond that first hop, for example with P2’s local adjacency segment toward PE2. Read the computed stack rather than assuming a dynamic Adj-SID number.',
}
const recovery: Block = {
  kind: 'cli',
  title: 'Preview the configuration rollback',
  os: xr,
  code: 'show configuration commit list\nshow configuration rollback changes last 1 diff',
  note: 'Capture the commit ID before a change. On an isolated router with a confirmed single relevant last commit, rollback configuration last 1 reverts it. In a shared change window, review the exact diff and use an approved targeted reversal. Restore working service and recheck CEF, the LFIB, and probes.',
}

export const implement: Unit[] = [
  {
    id: 'xr-underlay',
    title: 'Build the IOS XR underlay',
    summary: 'Prove Level 2 adjacency, Loopback0 reachability, and the intended primary path.',
    dimension: 'Configuration Knowledge',
    minutes: 8,
    blocks: [diagram, links, identities, addressPE1, isisPE1, underlayCheck, recovery],
  },
  {
    id: 'xr-sid-deployment',
    title: 'Activate IS-IS SR-MPLS',
    summary: 'Reserve the SRGB, advertise loopback indexes, and inspect control-plane resolution.',
    dimension: 'Configuration Knowledge',
    minutes: 8,
    blocks: [
      { kind: 'text', text: 'Start with converged wide-metric IS-IS, MPLS-capable ports and images, label headroom, and an agreed SID inventory. Verify payload MTU plus the additional label stack on all links in the primary and repair paths. Keep LDP available if it carries any active service.' },
      srPE2,
      sidCheck,
      { kind: 'text', text: 'For a brownfield rollout, stage SR capability with LDP available, confirm every intended primary and backup path, then pilot the IOS XR IS-IS address-family preference segment-routing mpls sr-prefer. Track both the SR label rewrite and service traffic. To revert preference, restore the pre-change configuration and prove the LDP forwarding path before removing SR state. Avoid changing a live SRGB as a routine correction.' },
      recovery,
    ],
  },
  {
    id: 'xr-forwarding-verification',
    title: 'Prove label forwarding and reachability',
    summary: 'Match the ingress rewrite with the transit LFIB and MPLS OAM.',
    dimension: 'Configuration Knowledge',
    minutes: 8,
    blocks: [ingressCheck, transitCheck, oamEnable, oamCheck,
      { kind: 'text', text: 'When an interface capture is available, observe 16004 at the top of the MPLS stack on PE1–P1 and the IP payload after PHP on P1–PE2 for the one-label loopback probe. Select the same flow in both captures. A lower service label in a VPN stack would alter the second observation.' }],
  },
  {
    id: 'xr-link-protection',
    title: 'Configure and verify TI-LFA',
    summary: 'Precompute the repair, read the programmed backup, then compare with converged SPF.',
    dimension: 'Configuration Knowledge',
    minutes: 10,
    blocks: [
      { kind: 'text', text: 'Confirm support for TI-LFA and the required imposed label depth on the actual image, forwarding hardware, and protected traffic class. Verify enough capacity and MPLS MTU on the repair path. The baseline exercise uses link protection.' },
      protectionPE1, protectionCheck,
      { kind: 'text', text: 'Node protection excludes the neighboring router and therefore all paths through it. SRLG (shared risk link group) protection excludes links that fail together, such as circuits in one duct. Verify the exclusion in the computed repair and topology. Failure detection time, FIB programming, and post-convergence microloops are distinct concerns.' },
      recovery,
    ],
  },
  {
    id: 'xe-node-sid',
    title: 'IOS XE 17 configuration differences',
    summary: 'Map the connected prefix in global SR configuration and verify operational IS-IS SR state.',
    dimension: 'Configuration Knowledge',
    minutes: 6,
    blocks: [
      { kind: 'text', text: 'This IOS XE variant assumes an existing IPv4 Level 2 IS-IS underlay named CORE and a local Loopback0 of 10.0.0.4/32 already advertised by CORE. Confirm your specific ASR, NCS, or Catalyst model, software image, and feature license before using the reference. Check whether TI-LFA and SR OAM are supported separately.' },
      {
        kind: 'cli',
        title: 'IOS XE · Add an IPv4 connected Prefix-SID map',
        os: xe,
        code: [
          'configure terminal',
          'segment-routing mpls',
          ' connected-prefix-sid-map',
          '  address-family ipv4',
          '   10.0.0.4/32 index 4 range 1',
          '   exit-address-family',
          '  exit',
          ' exit',
          'router isis CORE',
          ' metric-style wide',
          ' segment-routing mpls',
          ' end',
        ].join('\n'),
        note: 'The global SR process owns the connected prefix map. The IS-IS process enables SR for its IPv4 topology. Use the target release guide for an SRGB override if the operational default differs.',
      },
      {
        kind: 'cli',
        title: 'IOS XE · Check SR state, SRGB, and LFIB',
        os: xe,
        code: 'show isis segment-routing\nshow isis segment-routing global-block\nshow mpls forwarding-table',
        note: 'Read the configured and operational states separately. A valid allocated block and an enabled IS-IS SR topology are prerequisites. Inspect a remote router for the learned Prefix-SID and rewrite to index 4.',
        output: 'Expected fields (illustrative)\nSR state             Enabled\nIPv4 operational     Enabled\nDefault block        Start 16000, range 8000 (confirm on image)',
        interpretation: 'The SRGB is receiver-specific even in a mixed XR/XE core. Cisco documents the XE SR-over-LDP preference under segment-routing mpls → set-attributes → address-family ipv4 using sr-label-preferred. Back out preference first during a dual-plane rollback.',
      },
    ],
  },
]
const shutP1ToPE2: Block = {
  kind: 'cli',
  title: 'P1 · Isolate the P1–PE2 link during the lab',
  os: xr,
  code: 'configure\ninterface GigabitEthernet0/0/0/2\n shutdown\n exit\ncommit\nend',
  note: 'Apply only to the cabled training link and with console access. Run probes from PE1 before, during, and after this step. Keep a capture on both ends of P1–P2 or P2–PE2 when available.',
}
const restoreP1ToPE2: Block = {
  kind: 'cli',
  title: 'P1 · Restore the link',
  os: xr,
  code: 'configure\ninterface GigabitEthernet0/0/0/2\n no shutdown\n exit\ncommit\nend',
  note: 'Wait for Level 2 adjacency to return. Repeat ingress CEF, P1 LFIB, SR OAM, and the preinstalled backup checks.',
}
const adjustP2Metric: Block = {
  kind: 'cli',
  title: 'P2 · Make the P2→PE2 metric 5 for the ECMP exercise',
  os: xr,
  code: 'configure\nrouter isis CORE\n interface GigabitEthernet0/0/0/2\n  address-family ipv4 unicast\n   metric 5\n   exit\n  exit\n exit\ncommit\nend',
  note: 'Change this one outbound metric only. Inspect P1’s CEF and LFIB for two equal-cost next hops. Restore metric 25 with the same CLI hierarchy after capturing evidence.',
}
const solution: Unit = {
  id: 'lab-solutions',
  title: 'Instructor solutions and evidence checkpoints',
  summary: 'Compare your observed paths, labels, repair, and fault evidence.',
  dimension: 'Lab Experience',
  minutes: 10,
  blocks: [
    { kind: 'table',
      headers: ['Task', 'Expected evidence', 'Reasoning'],
      rows: [
        ['Underlay', 'PE1/P1/P2/PE2 have 2/3/3/2 Level 2 neighbors, respectively. PE1 resolves 10.0.0.4/32 through 10.0.12.1.', 'PE1→P1→PE2 has link sum 20, below 35 through P2 and P1 and 45 through P2 directly. Read the loopback prefix metric in the origin LSP.'],
        ['SR activation', 'PE2 advertises index 4 and SRGB base 16000/range 8000. PE1 imposes 16004 toward P1.', 'The index names the segment; the first receiver’s SRGB selects the on-wire MPLS label.'],
        ['LFIB and packet capture', 'P1 receives 16004 and pops it toward 10.0.24.1. The single-label packet is IP on the final link.', 'PE2 requests default PHP. If an explicit-null or another service label is present, the final wire still has a label.'],
        ['PE1–P1 link failure', 'PE1’s alternate starts at 10.0.13.1. After convergence the path is PE1→P2→P1→PE2, link sum 35.', 'Link protection can still use P1 from P2. Losing P1 as a node instead forces PE1→P2→PE2 with link sum 45.'],
        ['P1–PE2 link failure', 'P1’s alternate starts at 10.0.23.1. After convergence the path is PE1→P1→P2→PE2, link sum 40 (P1’s portion is 30).', 'PE1 retains P1 as primary next hop. P2’s old route goes through P1 at cost 15, so P1’s immediate repair must prevent P2 returning that traffic. The repair may encode a local P2→PE2 adjacency segment.'],
        ['ECMP variation', 'On P1, direct PE2 and P2 each cost 10 after the temporary change. The PE2 row pops and the P2 row sends 16004 if both paths are installed.', 'P2 now forwards directly to PE2 with PHP. PE1 has a single first hop P1 even though P1 has two equal-cost choices.'],
      ],
    },
    {
      kind: 'text',
      text: 'Ticket 1. Compare PE2’s 10.0.0.4/32 extended reachability entry on PE1 with the pre-fault snapshot. The prefix and SR capability remain, but removing PE2’s Prefix-SID removes its sub-TLV. Restore prefix-sid index 4 on PE2’s IS-IS Loopback0 IPv4 unicast. Verify the re-advertisement, PE1’s active 16004 rewrite, P1’s Pop entry, and SR OAM. An IP ping may still pass while the SID is absent.',
    },
    {
      kind: 'text',
      text: 'Ticket 2. On P1, inspect the primary interface and the computed backup for the PE2 prefix. Gi0/0/0/2 lacks per-prefix FRR after the injected removal. Restore both fast-reroute per-prefix and fast-reroute per-prefix ti-lfa under that interface’s IS-IS IPv4 unicast context. Confirm the alternate via P2 is computed and installed before failing the link. If still absent, verify P2’s adjacency-SID advertisement, backup topology, forwarding support, and label depth.',
    },
    {
      kind: 'text',
      text: 'Grade the evidence chain. Ask for one interface/next-hop observation, one RIB-versus-LFIB distinction, and one on-wire or SR OAM result. Count control-plane prediction as a simulation, and record lab verification after observing the forwarding behavior on the target lab.',
    },
  ],
}

const nodes = ['PE1', 'P1', 'P2', 'PE2']
const downloadBase = 'downloads/sr-mpls'
export const lab: Lab = {
  setup: {
    id: 'lab-setup',
    title: 'Build the four-router XR lab',
    summary: 'Cable a topology where one alternate is naturally loop-free and another requires explicit repair.',
    dimension: 'Lab Experience',
    minutes: 12,
    blocks: [
      { kind: 'text', text: 'Use four IOS XR MPLS-capable routers. The syntax baseline is ASR 9000 7.11.x. In CML, create four IOS XRv 9000 nodes. In EVE-NG, create four XRv 9000 QEMU nodes using a supported template and a properly licensed image. Compare actual interface numbers with the table and keep the logical mapping consistent in the configs. Four virtual routers require adequate host resources.' },
      diagram,
      links,
      identities,
      { kind: 'text', text: 'Cable the five links as shown. Bring up one console per node and snapshot each clean image. Check show version and show ipv4 interface brief before pasting. Confirm the selected image’s IS-IS SR-MPLS, TI-LFA, and OAM support before grading those milestones. Virtual timing and throughput depend on the host. ASR 9000 documentation is the CLI reference. The downloadable instructions and configs are for a manual build and have not been executed on Cisco hardware or an emulator.' },
      { kind: 'text', text: 'Apply stage 01 to all four nodes for initial addressing. Stage 02 adds Level 2 IS-IS, stage 03 adds SR-MPLS, and stage 04 adds TI-LFA. Keep the final configurations as instructor references. Verify every stage before continuing.' },
    ],
  },
  milestones: [
    {
      id: 'lab-underlay',
      title: '1 · Establish the IPv4 underlay',
      summary: 'Build interface addressing and Level 2 IS-IS before reserving labels.',
      dimension: 'Lab Experience',
      minutes: 12,
      blocks: [
        { kind: 'list', items: [
          'Apply each router’s stage 01 file and test both directions of every /31 link.',
          'Apply each stage 02 file and record every Level 2 adjacency. Check PE1 has neighbors P1 and P2, and PE2 has P1 and P2.',
          'Calculate the least-cost PE1→PE2 path before running the route check. Record the next hop, outgoing interface, and PE2’s advertised loopback metric.',
        ] },
        underlayCheck,
      ],
    },
    {
      id: 'lab-activate-sr',
      title: '2 · Install and verify the SID plan',
      summary: 'Activate SR across all hops and prove PE2’s index is advertised.',
      dimension: 'Lab Experience',
      minutes: 12,
      blocks: [
        { kind: 'text', text: 'Check each stage 03 file for its node-specific index before committing on all four routers. Compute the highest valid index in the 8,000-label range. Confirm which LSP describes the SRGB and which reachability entry carries the index.' },
        srPE2,
        sidCheck,
        { kind: 'text', text: 'Checkpoint. On PE1 find PE2’s prefix, algorithm, SID, and N flag. Find the P2→PE2 adjacency toward 10.0.34.1 in P2’s LSP and identify one dynamic Adj-SID from the corresponding adjacency advertisement if the image exposes it. Record the advertising node and direction before using the number in any explanation.' },
      ],
    },
    {
      id: 'lab-forwarding',
      title: '3 · Test the labeled path and ECMP',
      summary: 'Predict what appears on each link and compare it with forwarding evidence.',
      dimension: 'Lab Experience',
      minutes: 12,
      blocks: [
        { kind: 'text', text: 'For PE1’s loopback-sourced IPv4 probe, write the label stack with top first on each link before checking the routers. Run these commands in the order of packet transit. If your emulator can capture a link, compare the Ethernet MPLS traffic on the first link with the matching echo packet on the last.' },
        ingressCheck, transitCheck, oamEnable, oamCheck, stackedProbe, adjustP2Metric,
      ],
    },
    {
      id: 'lab-protection',
      title: '4 · Fail a link and compare local repair with convergence',
      summary: 'Observe the programmed repair before failing the primary path.',
      dimension: 'Lab Experience',
      minutes: 15,
      blocks: [
        { kind: 'list', items: [
          'Run the PE1→PE2 probe before enabling FRR and save the baseline. If a platform supports a timestamped probe stream or link capture, use it to observe the interruption.',
          'Apply stage 04 on all four routers. Verify the backup at PE1 and P1 before inducing failure. If the image lacks a working TI-LFA data plane, use the topology and LFIB model to predict repair and still observe distributed SPF convergence.',
          'With the topology restored, isolate PE1 Gi0/0/0/0 toward P1 and compare the immediate repair at PE1 with the converged path. Restore the interface and confirm the primary path before the next experiment.',
          'Repeat at P1 toward PE2. P1 is now the repair point. Capture the first-hop change and any MPLS labels, then repeat the same show commands after IGP convergence and record the new SPF path.',
          'Run the failure only while connected to lab consoles. Restore each link before isolating another. Report probe timing and capture granularity when discussing observed packet loss.',
        ] },
        protectionCheck, shutP1ToPE2, restoreP1ToPE2,
      ],
    },
    {
      id: 'lab-faults',
      title: '5 · Diagnose two controlled faults',
      summary: 'Locate the first failed dependency and capture a before/after record.',
      dimension: 'Lab Experience',
      minutes: 12,
      blocks: [
        { kind: 'text', text: 'Use a partner to inject each ticket while you troubleshoot without seeing the change. If working solo, write the initial hypotheses before opening the fault controls. Start each ticket from a restored baseline.' },
        { kind: 'list', items: [
          'Ticket 1. PE1 still learns 10.0.0.4/32. An SR-specific probe for that prefix no longer verifies. Determine whether the break is in the origin advertisement, route selection, or the LFIB.',
          'Ticket 2. PE1 can reach PE2 in steady state. The repair point lacks a preinstalled backup for a failure on the direct P1–PE2 link. Determine which router and interface own the protection and what is missing.',
          'For each ticket record the symptom, hypothesis, decisive command, missing or incorrect field, correction, and validation. Resolve one ticket before beginning the next.',
        ] },
        {
          kind: 'advanced',
          title: 'Instructor only · fault controls',
          blocks: [
            { kind: 'cli', title: 'Ticket 1 · Withdraw PE2’s Prefix-SID', os: xr,
              code: 'configure\nrouter isis CORE\n interface Loopback0\n  address-family ipv4 unicast\n   no prefix-sid index 4\n   exit\n  exit\n exit\ncommit\nend',
              note: 'Use on PE2 after confirming baseline. Keep Loopback0 and IS-IS active. Capture the new LSP version before the student begins.' },
            { kind: 'cli', title: 'Ticket 2 · Disable protection on P1 toward PE2', os: xr,
              code: 'configure\nrouter isis CORE\n interface GigabitEthernet0/0/0/2\n  address-family ipv4 unicast\n   no fast-reroute per-prefix ti-lfa\n   no fast-reroute per-prefix\n   exit\n  exit\n exit\ncommit\nend',
              note: 'Use on P1. Leave link addressing, IGP, and SR configured. Check the intended missing repair with the fault present before handing over.' },
          ],
        },
      ],
    },
  ],
  solutions: solution,
  downloads: [
    { title: 'Manual build and student workbook', path: downloadBase + '/README.md' },
    { title: 'Instructor workbook', path: downloadBase + '/instructor.md' },
    { title: 'Topology and addressing JSON', path: downloadBase + '/topology.json' },
    { title: 'All lab configuration files (ZIP)', path: downloadBase + '/xr-configs.zip' },
    ...nodes.map(node => ({ title: node + ' final XR configuration', path: downloadBase + '/final/' + node + '.cfg' })),
  ],
}
