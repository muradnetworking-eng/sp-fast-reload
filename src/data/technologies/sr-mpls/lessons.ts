import type { Block, Source, Unit } from '../../../schemas/content'

const xr = 'IOS XR 7.11.x · ASR 9000 reference'
const xe = 'IOS XE 17 · Access and Edge Routers reference'

export const prerequisites = [
  'Read an IPv4 route and identify its next hop and egress interface. The first two stages introduce link-state SPF and MPLS label switching.',
  'For the practical work, use four MPLS/SR-capable IOS XR nodes with console access, three data interfaces per transit router, and a known-good startup configuration.',
  'Check image, hardware, license and line-card support for SR-MPLS, SR OAM and TI-LFA individually. Compare hardware and software label-stack limits before using policy or repair stacks.',
]

const xrGuide = 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-711x/'
const rfc = (number: number, name: string, scope: string): Source => ({
  title: 'RFC ' + number + ' · ' + name,
  url: 'https://www.rfc-editor.org/rfc/rfc' + number + '.html',
  scope,
})

export const sources: Source[] = [
  rfc(8402, 'Segment Routing Architecture', 'Global and local segments, Node-SIDs, Adj-SIDs and source routing'),
  rfc(8660, 'Segment Routing with the MPLS Data Plane', 'Per-router SRGB mapping and label operations'),
  rfc(8667, 'IS-IS Extensions for Segment Routing', 'Router capability, prefix and adjacency advertisements'),
  rfc(8665, 'OSPF Extensions for Segment Routing', 'OSPFv2 Router Information and Extended Prefix/Link Opaque LSAs'),
  rfc(3032, 'MPLS Label Stack Encoding', 'Label-stack format and special-purpose values'),
  rfc(4182, 'Removing a Restriction on MPLS Explicit NULL', 'Explicit-null behavior with multiple labels'),
  rfc(5036, 'LDP Specification', 'Discovery, sessions and FEC-label mappings'),
  rfc(5286, 'IP Fast Reroute: Loop-Free Alternates', 'Loop-free condition for a directly connected alternate'),
  rfc(8661, 'Segment Routing MPLS Interworking with LDP', 'Coexistence, translation boundaries, mapping servers and staged migration'),
  rfc(9256, 'Segment Routing Policy Architecture', 'Headend, color, endpoint, candidate paths, Binding SID and steering'),
  rfc(9855, 'Topology Independent Fast Reroute Using Segment Routing', 'Post-convergence repair paths, protection scope and transient microloops'),
  rfc(9350, 'IGP Flexible Algorithm', 'Constrained SPF and algorithm-specific SIDs'),
  rfc(8491, 'Signaling Maximum SID Depth Using IS-IS', 'Advertised node and link imposition limits'),
  rfc(3209, 'RSVP-TE Extensions', 'Explicit route signaling and bandwidth admission'),
  rfc(4090, 'Fast Reroute Extensions to RSVP-TE', 'One-to-one and facility backup mechanisms'),
  rfc(8986, 'Segment Routing over IPv6 Network Programming', 'SRv6 locators and endpoint behaviors'),
  { title: 'Cisco ASR 9000 IOS XR 7.11 · SR for IS-IS', url: xrGuide + 'configure-sr-for-is-is-protocol.html', scope: 'XR enablement, Prefix-SID, Adj-SID and database verification' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · Implementing IS-IS', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-is-is.html', scope: 'IPv4 unicast underlay, NET, level and interface configuration' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · SRGB and SRLB', url: xrGuide + 'configure-srgb-srlb.html', scope: 'Range configuration, allocation and conflicts' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · SR for OSPF', url: xrGuide + 'configure-sr-for-ospf-protocol.html', scope: 'OSPFv2 enablement and Opaque LSA verification' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · TI-LFA', url: xrGuide + 'configure-ti-lfa.html', scope: 'Per-prefix repair configuration and link, node and SRLG coverage' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · SR Microloop Avoidance', url: xrGuide + 'configure-sr-microloop-avoidance.html', scope: 'Transient loop mitigation and RIB update delay' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · SR OAM', url: xrGuide + 'using-sr-oam.html', scope: 'SR MPLS echo, traceroute, FEC types and prerequisites' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · SR Mapping Server', url: xrGuide + 'configure-sr-mapping-server.html', scope: 'SID mapping advertisements and LDP/SR stitching examples' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · SR-TE Policies', url: xrGuide + 'configure-sr-te-policies.html', scope: 'Explicit and dynamic paths, activation and verification' },
  { title: 'Cisco ASR 9000 · Cisco Express Forwarding Commands', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/ip-addresses/command/reference/b-ip-addresses-cr-asr9000/b-ipaddr-cr-asr9k_chapter_011.html', scope: 'CEF resolution and label imposition evidence' },
  { title: 'Cisco ASR 9000 · MPLS LDP Commands', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/mpls/command/reference/b-mpls-cr-asr9000/mpls-label-distribution-protocol-commands.html', scope: 'LDP neighbor and binding checks during coexistence' },
  { title: 'Cisco TAC · Configure TI-LFA', url: 'https://www.cisco.com/c/en/us/support/docs/multiprotocol-label-switching-mpls/multiprotocol-label-switching-mpls/217321-configure-topology-independent-loop-fr.html', scope: 'Worked repair selection and CEF examples' },
  { title: 'Cisco IOS XE 17 · IS-IS v4 Node SID', url: 'https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/seg_routing/configuration/xe-17/segrt-xe-17-book/m_seg-routing-isis.html', scope: 'Access and Edge connected-prefix mapping, IS-IS enablement and SR state' },
  { title: 'Cisco IOS XE 17 · ASR 920 Segment Routing', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr920/configuration/guide/segment-routing/17-1-1/b-segment-routing-17-1-asr920/b-segment-routing-17-1-asr920_chapter_010.html', scope: 'Platform-specific IOS XE examples and restrictions' },
  { title: 'Cisco IOS XR 7.11 · NCS 540 Segment Routing', url: 'https://www.cisco.com/c/en/us/td/docs/iosxr/ncs5xx/segment-routing/711x/b-segment-routing-cg-711x-ncs540.pdf', scope: 'NCS 540 configuration and restrictions' },
  { title: 'Cisco Nexus 9000 NX-OS 10.5 · SR with IS-IS', url: 'https://www.cisco.com/c/en/us/td/docs/dcn/nx-os/nexus9000/105x/configuration/label-switching/cisco-nexus-9000-series-nx-os-label-switching-configuration-guide-release-105x/m-segment-routing-is-is.html', scope: 'NX-OS feature prerequisites and IPv4 support scope' },
  { title: 'Cisco Nexus 9000 NX-OS 10.5 · Configuring SR', url: 'https://www.cisco.com/c/en/us/td/docs/dcn/nx-os/nexus9000/105x/configuration/label-switching/cisco-nexus-9000-series-nx-os-label-switching-configuration-guide-release-105x/configuring-segment-routing.html', scope: 'MPLS feature set, interface MPLS and label mapping verification' },
  { title: 'Cisco IOS 15S · MPLS LDP', url: 'https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/mp_ldp/configuration/15-s/mp-ldp-15-s-book/mp-ldp-overview.html', scope: 'Classic IOS MPLS/LDP configuration and verification' },
  { title: 'Cisco TAC · MTU on IOS XR and IOS', url: 'https://www.cisco.com/c/en/us/support/docs/ios-nx-os-software/ios-xr-software/116350-trouble-ios-xr-mtu-00.html', scope: 'Platform-specific MTU measurement and MPLS overhead' },
  { title: 'Cisco Modeling Labs · IOS XRv 9000', url: 'https://developer.cisco.com/docs/modeling-labs/ios-xrv-9000/', scope: 'Virtual node resources and Cisco feature-test scope' },
]

const topology: Block = {
  kind: 'diagram',
  title: 'IS-IS Level 2 lab · bidirectional link costs',
  text: [
    '                 P1 (.2 / SID index 2)',
    '               /  |  \\',
    '            10/   |5  \\10',
    'PE1 (.1 / 1)      |      PE2 (.4 / 4)',
    '            20\\   |   /25',
    '               \\  |  /',
    '                 P2 (.3 / SID index 3)',
    '',
    'Loopback0: 10.0.0.<node>/32     SRGB: 16000–23999',
    'Baseline: PE1 --[16004]--> P1 --[IP]--> PE2',
  ].join('\n'),
}

const platformSummary: Block = {
  kind: 'table',
  headers: ['OS / reference platform', 'What changes'],
  rows: [
    ['IOS XR 7.11 · ASR 9000', 'Configure SRGB globally, SR under IS-IS IPv4 unicast, and the Prefix-SID under the IS-IS loopback address family. Commit and verify active allocation.'],
    ['IOS XR 7.11 · NCS 540', 'Use the NCS-specific Segment Routing guide. Check the exact SKU, image, line card and release for feature support.'],
    ['IOS XE 17 · Access/Edge', 'The guide uses a global connected-prefix SID map and router-level IS-IS activation. Verify syntax, SRGB bounds and repair features for the exact ASR or Catalyst SKU and image.'],
    ['Cisco IOS 15S · legacy MPLS/LDP', 'A legacy LDP deployment may need a dual-capable boundary during migration. Verify IOS LDP with show mpls ldp neighbor and confirm exact image support before selecting a migration role.'],
    ['NX-OS 10.5 · supported Nexus 9000 models', 'Enable the MPLS feature set and SR and IS-IS features. The cited NX-OS IS-IS integration uses IPv4 unicast. Check model-specific interface and overlay support.'],
  ],
}

const adjacency: Block = {
  kind: 'cli', title: 'Confirm PE1’s IS-IS adjacencies', os: xr,
  code: 'show isis adjacency',
  note: 'Start on PE1. Both P1 and P2 should be Up at Level 2. An Up adjacency establishes a link-state exchange. Check the remote advertisement separately.',
}

const advertisements: Block = {
  kind: 'cli', title: 'Find PE2’s advertised Prefix-SID', os: xr,
  code: 'show isis database verbose',
  note: 'Read PE2’s Level 2 link-state PDU on PE1. Also read the SRGB advertised by the selected next hop, P1.',
  output: 'Origin: PE2   | SRGB base: 16000 | range: 8000\nPrefix: 10.0.0.4/32 | Prefix-SID index: 4 | algorithm: 0\nOrigin: P1    | SRGB base: 16000 | range: 8000',
  interpretation: 'This is a field summary of the model. PE2 originates the prefix-to-index binding. P1’s block gives PE1 the value to place on the PE1→P1 link. Range 8000 counts labels and includes indexes 0 through 7999.',
}

const route: Block = {
  kind: 'cli', title: 'Identify the selected next hop', os: xr,
  code: 'show route ipv4 10.0.0.4/32',
  note: 'On PE1, look for the remote /32 via CORE Level 2 and P1 at 10.0.12.1. The baseline sum of link costs is 20. Check PE2’s advertised prefix metric separately.',
}

const cef: Block = {
  kind: 'cli', title: 'Check PE1’s imposition and egress', os: xr,
  code: 'show cef ipv4 10.0.0.4/32 detail',
  note: 'Find the programmed next hop, interface and labels imposed. Compare with the control-plane path. For ECMP, inspect all programmed members.',
  output: 'Model fields on PE1:\nPrefix: 10.0.0.4/32\nNext hop: 10.0.12.1 (P1)\nEgress: GigabitEthernet0/0/0/0\nExpected transport label imposed: 16004',
  interpretation: 'A local label is the label PE1 would receive for this SID. The imposed label is what PE1 transmits to P1. Equal SRGBs make these numbers equal in this lab.',
}

const lfib: Block = {
  kind: 'cli', title: 'Check P1’s label action', os: xr,
  code: 'show mpls forwarding labels 16004',
  note: 'Run on P1. Follow the incoming label to the outgoing interface and next hop.',
  output: 'Model fields on P1:\nLocal label: 16004 | Outgoing operation: Pop\nPrefix: 10.0.0.4/32 | Egress: Gi0/0/0/2 | Next hop: 10.0.24.1',
  interpretation: 'P1 is the last transit router. Pop removes the active transport label before forwarding to PE2. Any lower service label remains for PE2.',
}

const repair: Block = {
  kind: 'cli', title: 'Inspect P1’s repair for the PE2 prefix', os: xr,
  code: 'show isis fast-reroute 10.0.0.4/32 detail',
  note: 'On P1 before failing P1–PE2, look for a backup via P2 at 10.0.23.1 where supported. Record repair type, repair nodes and label information, then check CEF programming. Read the stack derived by the software.',
}

const oam: Block = {
  kind: 'cli', title: 'Test the IS-IS SR transport FEC', os: xr,
  code: 'ping sr-mpls 10.0.0.4/32 fec-type igp isis',
  note: 'From PE1, send an MPLS echo for the forwarding equivalence class (FEC) of the PE2 Prefix-SID. Verify OAM support and echo return reachability first.',
  interpretation: 'Success confirms the tested transport FEC in that direction. A timeout warrants checking reply reachability and OAM support. Test customer services separately.',
}

const blockAllocation: Block = {
  kind: 'cli', title: 'Confirm active SRGB allocation', os: xr,
  code: 'show mpls label table label 16000 detail',
  note: 'Check for an allocated SRGB with base 16000 and size 8000. Compare the active allocation with running configuration and the advertised block.',
}

export const reload: Unit = {
  id: 'reload', title: '15-Min Reload', minutes: 15, dimension: 'Conceptual Knowledge',
  summary: 'Reconstruct the transport path, derive the wire label, and identify the first missing piece of forwarding evidence.',
  blocks: [
    { kind: 'text', text: 'SR-MPLS carries an ordered list of forwarding instructions in the MPLS label stack. Plain IGP SR transports traffic along the shortest path to a Prefix-SID. An ingress SR Policy can impose multiple segments to steer a subset of traffic. Transit routers maintain routes and reusable segment entries, and the headend maintains the policy.' },
    topology,
    { kind: 'list', items: [
      'Verify the IP topology first. An advertised SID needs a usable route and a programmed forwarding action.',
      'Read an index in the receiving router’s SRGB. With the same block everywhere, PE2’s index 4 becomes 16004 at each hop that expects it.',
      'A Node-SID follows the selected algorithm toward the node. A locally scoped Adj-SID takes effect at its owner and selects the advertised adjacency.',
      'At the penultimate hop, check for Pop by default. A lower service label survives penultimate hop popping (PHP). With IPv4 explicit-null for an eligible stack, label 0 reaches the endpoint.',
      'Verify repair programming and measured loss. TI-LFA protects specified failure scenarios where a usable alternate can be installed.',
    ] },
    { kind: 'table', headers: ['If you see…', 'Check next'], rows: [
      ['Healthy IS-IS and a reachable loopback, with no SR label', 'Find the Prefix-SID sub-TLV on the prefix. Check SR activation and the next hop’s advertised SRGB.'],
      ['Correct prefix and index, but labeled traffic drops', 'Compare the sender’s outgoing label with the receiver’s local LFIB. Check MPLS forwarding, egress adjacency, stack depth and MTU.'],
      ['IP reachability recovers slowly after a failure', 'Compare IS-IS repair computation with CEF programming. Check detection, protection scope, alternate reachability and time to convergence.'],
    ] },
    { kind: 'advanced', title: 'Eight IOS XR verification commands', blocks: [adjacency, advertisements, route, blockAllocation, cef, lfib, repair, oam] },
    { kind: 'advanced', title: 'Cisco OS and platform differences', blocks: [platformSummary] },
    { kind: 'advanced', title: 'What might I have forgotten?', blocks: [{ kind: 'list', items: [
      'Can I explain why PE1 sends 16004 to P1 when PE2 advertises index 4, and which router’s SRGB determines that first-hop label?',
      'Can I identify where the top label is popped and what happens to a label below it?',
      'Can I explain why P2’s old shortest path would send an ordinary PE2 segment back to P1 after P1–PE2 fails?',
      'Can I locate the repair entry before testing the failure and distinguish local repair from distributed convergence?',
    ] }] },
  ],
}

export const stages: Unit[] = [
  {
    id: 'understand', title: '1 · Understand the forwarding model', minutes: 15, dimension: 'Conceptual Knowledge',
    summary: 'Start from a routed packet and build up to MPLS and Segment Routing.',
    blocks: [
      { kind: 'text', text: 'An interior gateway protocol (IGP) such as IS-IS or OSPF describes connectivity inside a routing domain. Neighboring routers establish adjacencies and flood link-state information. Each router runs shortest path first (SPF) from its own position, adds the destination prefix metric to the path to its advertiser, and selects next hops. The routing information base (RIB) records selected routes, and the forwarding information base (FIB) makes those routes usable for packet lookups.' },
      { kind: 'text', text: 'MPLS classifies traffic into a forwarding equivalence class (FEC), such as packets going to the same egress loopback. The ingress can push one or more 4-byte label entries. A transit router matches the top incoming label in the label forwarding information base (LFIB), then swaps it, pops it, or applies a programmed stack and egress action. Each entry also carries traffic class, bottom-of-stack and TTL fields.' },
      { kind: 'text', text: 'A segment is one forwarding instruction and a segment identifier (SID) identifies it. A Prefix-SID uses a route to an advertised prefix in a particular algorithm. A Node-SID is a Prefix-SID identifying a specific router, commonly on a unique /32 loopback. A typical local Adjacency-SID (Adj-SID) is owned by the router advertising that directed link. The same numeric local label can mean something different at a different router.' },
      { kind: 'table', headers: ['Question', 'LDP transport', 'IGP SR-MPLS transport'], rows: [
        ['Where does the binding come from?', 'A downstream router allocates a local label and advertises it to peers through a Label Distribution Protocol (LDP) session. Received and local bindings appear in the label information base (LIB).', 'The IGP advertises Prefix-SIDs, SR capabilities and local Segment Routing Global Block (SRGB) ranges. Each SR router resolves the advertised segment for its own forwarding plane.'],
        ['How is the next hop chosen?', 'The IGP-selected next hop determines which downstream LDP binding gets used.', 'The IGP-selected next hop for the Prefix-SID algorithm determines the outgoing label space and forwarding action.'],
        ['How is a path steered?', 'Basic LDP follows IGP reachability. An explicit path requires a separate mechanism such as RSVP-TE.', 'The ingress can impose a sequence of reusable node and adjacency instructions. Transit nodes maintain LFIB state for the instructions they process.'],
        ['What can break with IP routes still present?', 'LDP session, binding, interface MPLS, label or FIB programming.', 'Missing Prefix-SID, invalid SRGB resolution, missing local or remote label programming, or unsupported data-plane operation.'],
      ] },

      { kind: 'advanced', title: 'What moved from the core to the ingress?', blocks: [
        { kind: 'text', text: 'Classic RSVP-TE signals individual label-switched paths (LSPs) across the chosen path. SR steers traffic with the segment list imposed at a headend, which can remove per-policy transit signaling and state. The core still maintains IGP topology, label entries and installed repair state. An SR ingress may obtain policy paths from local configuration, local computation or a controller.' },
        { kind: 'text', text: 'An anycast Prefix-SID identifies a set of routers advertising a shared prefix and common SID for the intended algorithm. Traffic follows the selected shortest path toward a qualifying origin. Consistent anycast-group allocation and label resolution matter when those routers use different SRGBs.' },
      ] },
    ],
  },
  {
    id: 'visualize', title: '2 · Visualize the packet and label stack', minutes: 20, dimension: 'Conceptual Knowledge',
    summary: 'Predict link-by-link forwarding and verify when a label is local, swapped, popped or left beneath the stack.',
    blocks: [
      topology,
      { kind: 'text', text: 'The Segment Routing Global Block (SRGB) is reserved locally for global segments. For one contiguous block, label = base + index and the index must fit inside the count of labels. With multiple advertised ranges, the index is an offset across their ordered ranges. The Segment Routing Local Block (SRLB) is reserved locally for local segments as supported by the implementation. Read the advertisement or LFIB for an automatically allocated Adj-SID.' },
      { kind: 'table', headers: ['Device', 'Input and decision', 'Action and next device'], rows: [
        ['PE1 ingress', 'IPv4 destination 10.0.0.4/32. Via P1 costs 10 + 10 = 20. Via P2, the cheapest suffix is P2→P1→PE2 at cost 5 + 10, for 35 total.', 'Resolve PE2’s index 4 using P1’s SRGB. Push 16004 and send on PE1→P1.'],
        ['P1 transit', 'Incoming top label 16004 maps to PE2’s node segment. Direct link to PE2 has cost 10.', 'Pop the transport label through penultimate hop popping (PHP). Send the underlying IPv4 packet on P1→PE2.'],
        ['PE2 egress', 'Destination is PE2’s own loopback.', 'Deliver the IPv4 packet locally. For a VPN payload the next lookup would use the still-present service label.'],
      ] },
      { kind: 'text', text: 'IS-IS carries SR capability, algorithm and SRGB in Router Capability information, Prefix-SID as a sub-TLV of IP reachability, and Adj-SID in link reachability sub-TLVs. OSPFv2 carries SR capability in Router Information and places Prefix-SID and Adj-SID in Extended Prefix and Extended Link Opaque LSAs. The receiving router needs both the usable topology and the correct SR advertisement to install forwarding.' },
      { kind: 'advanced', title: 'Watch a label swap while the SID stays the same', blocks: [
        { kind: 'text', text: 'Use the converged path after failure of PE1–P1, PE1→P2→P1→PE2. Keep index 4 and the original SRGB on PE1, P1 and PE2. For this calculation only, give P2 an SRGB of 24000–31999. PE1 transmits 24004 to P2. P2 matches its local 24004 and swaps to 16004 using P1’s SRGB. P1 matches 16004 and pops before PE2. Each receiver interprets the same logical SID using its own label space.' },
        { kind: 'text', text: 'On XR, the keyword absolute selects a specific local value in the configured SRGB for a Prefix-SID. Read the resulting index/value and scope in the advertisement before interpreting the wire label. For an IS-IS Prefix-SID, V identifies a value instead of an index and L identifies local significance. An indexed SID with V and L clear uses global index resolution.' },
      ] },
      { kind: 'advanced', title: 'Stack two instructions and force a link', blocks: [
        { kind: 'text', text: 'Select the ordered segments [Node(P2), Adj(P2→PE2)] with an IP payload destined for PE2. PE1’s shortest path to P2 is PE1→P1→P2 at cost 15. Write stacks top first. PE1 sends [16003, P2’s local Adj-SID] to P1. With PHP on the P2 node segment, P1 pops 16003 and sends the now-active Adj-SID directly to P2. P2 recognizes its local label, pops it and forwards on its PE2-facing interface despite its baseline SPF preference via P1.' },
        { kind: 'text', text: 'Read the exact value of P2’s Adj-SID from its advertisement and programming. If the directed link fails, inspect the Adj-SID’s protection properties and candidate-path validity. An unprotected hard adjacency can become unusable even while PE2 remains reachable elsewhere.' },
      ] },
      { kind: 'advanced', title: 'ECMP, explicit-null and no-PHP', blocks: [
        { kind: 'text', text: 'Equal-cost multipath (ECMP) can program multiple next hops for a Prefix-SID. Temporarily set only P2’s outgoing cost to PE2 to 5. P1 now sees cost 10 both directly and via P2. The direct branch pops. The P2 branch sends 16004 to P2, which pops on its direct link to PE2. PE1 still uses P1 as its sole first hop. Check per-member actions and use multiple flows to observe hashing.' },
        { kind: 'text', text: 'With default PHP, the penultimate node removes the active Prefix-SID and transmits toward the owner. No-PHP keeps normal segment termination at the owner. Explicit-null requests a special-purpose label when applicable (0 for IPv4, 2 for IPv6), preserving label treatment to the egress. Implicit-null signals a pop operation. Label 3 is reserved for signaling and never goes on the wire. Confirm the behavior for the actual stack and hardware.' },
      ] },
    ],
  },
  {
    id: 'configure', title: '3 · Configure the underlay and activate SR', minutes: 20, dimension: 'Configuration Knowledge',
    summary: 'Bring up IP and IS-IS before reserving labels and advertising a node segment.',
    blocks: [
      { kind: 'text', text: 'Open the hands-on lab for the per-device baseline and addressing table. Establish the IP underlay on all four routers. Each router has a unique Network Entity Title (NET), which encodes the IS-IS area, system ID and selector. Loopback0 is passive. It advertises a prefix and forms no adjacency. The lab uses point-to-point IS-IS on Ethernet so each physical link has a clear metric and neighbor.' },
      { kind: 'cli', title: 'Configure PE2’s IPv4 underlay and IS-IS', os: xr,
        code: [
          'configure',
          'interface Loopback0',
          ' ipv4 address 10.0.0.4 255.255.255.255',
          ' exit',
          'interface GigabitEthernet0/0/0/0',
          ' ipv4 address 10.0.24.1 255.255.255.254',
          ' no shutdown',
          ' exit',
          'interface GigabitEthernet0/0/0/1',
          ' ipv4 address 10.0.34.1 255.255.255.254',
          ' no shutdown',
          ' exit',
          'router isis CORE',
          ' net 49.0001.0000.0000.0004.00',
          ' is-type level-2-only',
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
          '   metric 25',
          '   exit',
          '  exit',
          ' exit',
          'commit',
          'end',
        ].join('\n'),
        note: 'PE2 console example. Confirm its interface names. Apply the matching initial configurations at P1 and P2. On PE2, confirm both Level 2 adjacencies and remote loopback reachability before enabling SR.',
        interpretation: 'Wide metrics allow extended reachability encoding used by IS-IS SR. The configured address-family router ID also supports traffic engineering (TE). Changing a link metric affects the local outgoing direction unless the peer end changes too.',
      },
      { kind: 'cli', title: 'Reserve labels and enable IS-IS SR forwarding', os: xr,
        code: [
          'configure',
          'segment-routing global-block 16000 23999',
          'router isis CORE',
          ' address-family ipv4 unicast',
          '  segment-routing mpls',
          '  exit',
          ' exit',
          'commit',
          'end',
        ].join('\n'),
        note: 'Apply this in the lab to all four routers after the underlay is stable. The range contains 8000 labels. If allocation conflicts with another client, use the label manager’s active state to diagnose before a disruptive change.',
      },
      blockAllocation,
      { kind: 'cli', title: 'Advertise PE2’s node segment', os: xr,
        code: [
          'configure',
          'router isis CORE',
          ' interface Loopback0',
          '  address-family ipv4 unicast',
          '   prefix-sid index 4',
          '   exit',
          '  exit',
          ' exit',
          'commit',
          'end',
        ].join('\n'),
        note: 'Apply to PE2 after enabling SR under CORE. Repeat with indexes 1, 2 and 3 at PE1, P1 and P2. This attaches an index to a reachable prefix. IS-IS routers derive local labels and outbound label actions from that index and their next hops.',
      },
      advertisements,
      { kind: 'advanced', title: 'IOS XE 17 · Connected-prefix mapping', blocks: [
        { kind: 'cli', title: 'Set and verify PE2’s index in the IOS XE IS-IS model', os: xe,
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
            'end',
            'show isis segment-routing',
          ].join('\n'),
          note: 'Use on a platform matching the IOS XE Access and Edge guide after configuring the connected loopback and working IS-IS instance. Range 1 maps one prefix. Check the exact router, switch or virtual image against its guide for SR and MPLS forwarding support.',
          interpretation: 'Verify SR operational state and the active global block. The IOS XE mapping hierarchy in this reference differs from the XR IS-IS interface address-family configuration.',
        },
      ] },
      { kind: 'advanced', title: 'IOS XR · OSPFv2 variant', blocks: [
        { kind: 'cli', title: 'Enable SR in an existing OSPFv2 process', os: xr,
          code: [
            'configure',
            'router ospf CORE',
            ' segment-routing mpls',
            ' area 0',
            '  interface Loopback0',
            '   prefix-sid index 4',
            '   exit',
            '  exit',
            ' exit',
            'commit',
            'end',
            'show ospf database opaque-area',
          ].join('\n'),
          note: 'Use an existing OSPFv2 area 0 and working IPv4 loopback, with SR-capable transit routers. Find the Prefix-SID in the area-scoped Extended Prefix LSA. Check Router Information for SR capabilities and the SRGB.',
        },
      ] },
      { kind: 'advanced', title: 'Classic IOS and NX-OS command examples', blocks: [
        { kind: 'cli', title: 'Check a legacy LDP handoff', os: 'Cisco IOS 15S · MPLS LDP reference',
          code: 'show mpls interfaces\nshow mpls ldp discovery\nshow mpls ldp neighbor',
          note: 'Run on the legacy LDP router when planning an interworking boundary. Compare discovery interface and operational neighbor with the routed next hop. Collect the binding and forwarding evidence as well.',
        },
        { kind: 'cli', title: 'Read local prefix mapping and SRGB', os: 'Cisco NX-OS 10.5 · supported Nexus 9000',
          code: 'show segment-routing mpls\nshow segment-routing mpls ipv4 connected-prefix-sid-map',
          note: 'On a supported NX-OS model with MPLS and SR features enabled, check the configured block and whether the mapping is an index or absolute value. Follow the Nexus interface and address-family prerequisites.',
        },
      ] },
    ],
  },
  {
    id: 'verify', title: '4 · Verify control plane, forwarding and traffic', minutes: 15, dimension: 'Configuration Knowledge',
    summary: 'Build a chain of evidence from the advertised index to the tested transport path.',
    blocks: [
      { kind: 'text', text: 'Collect both directions. On the forward path, begin with PE1’s adjacency and RIB, then PE2’s advertisement, PE1’s CEF action and P1’s LFIB. Compare the first divergence to a baseline captured before the change. The example outputs summarize expected model fields. Device captures depend on the image and hardware.' },
      adjacency, route, advertisements, cef, lfib, oam,
      { kind: 'cli', title: 'Trace the transport label-switched path', os: xr,
        code: 'traceroute sr-mpls 10.0.0.4/32 fec-type igp isis',
        note: 'Run where SR OAM is available. Interpret responding hops with the LFIB and current IGP topology. Compare with a sourced IP ping from the remote loopback for reachability in both directions.',
        interpretation: 'A regular ICMP ping can pass while the label path or a VPN fails. A successful SR echo validates the tested transport path. Customer payload, service-label termination and MTU need their own probes.',
      },
      { kind: 'advanced', title: 'Relate RIB, CEF and LFIB entries', blocks: [
        { kind: 'text', text: 'The RIB says which prefix and next hops were selected. The CEF prefix entry says what happens when the router classifies an IP packet for that prefix, including any label it imposes. The LFIB describes what the router does with a packet whose active incoming label is already present. Verify the forwarding entry independently of the route and advertised SR capabilities.' },
        { kind: 'text', text: 'In an LDP coexistence rollout, record the LDP binding for the prefix and the SR advertisement, then look at the selected primary and backup impositions. Either protocol may have valid state while only one supplies the chosen outgoing operation.' },
      ] },
    ],
  },
  {
    id: 'troubleshoot', title: '5 · Troubleshoot missing labels and failed repairs', minutes: 20, dimension: 'Troubleshooting Readiness',
    summary: 'Isolate a route, advertisement, resolution, forwarding or repair failure before changing configuration.',
    blocks: [
      { kind: 'table', headers: ['Symptom', 'First decisive evidence', 'Correction and validation'], rows: [
        ['PE2 IP loopback responds but lacks its intended SR label', 'PE2’s /32 is in the remote LSDB with no Prefix-SID, or with the wrong index or algorithm. Compare PE2’s local advertisement to PE1’s copy.', 'Correct the IS-IS loopback address-family Prefix-SID and commit. Confirm updated prefix attributes, PE1 imposition and P1 LFIB. Repeat MPLS echo.'],
        ['SR blackhole limited to one ECMP branch', 'Compare the sender’s outgoing label and the receiver’s LFIB for each member. Check link and label counters, supported label stack depth, and MPLS MTU.', 'Fix the divergent member’s label resolution, interface enablement or programming. Retest multiple hashes, both directions and the largest supported payload.'],
        ['P1–PE2 link has no repair', 'Check the protected egress interface’s FRR settings, the prefix’s computed backup and CEF’s installed backup. Check candidate path and SID availability.', 'Fix configuration or restore an eligible path. Recheck programming before repeating the failure and measuring loss. If the platform cannot program the repair stack, change the design.'],
        ['After a cutover, only legacy PEs are unreachable over MPLS', 'Check the mixed-capability boundary LFIB and the expected Prefix-SID mapping for each legacy FEC. Compare LDP binding state with selected outgoing labels.', 'Restore the proven label path, or repair the mapping and translation boundary. Validate both directions and the service before retiring LDP.'],
      ] },
      { kind: 'text', text: 'Baseline P2 reaches PE2 via P1 at cost 15 instead of its direct cost 25. If P1 loses its PE2 link, an unlabeled detour from P1 to P2 before P2 reconverges could return traffic to P1. A point of local repair (PLR) is the router immediately upstream of the protected failure. It precomputes an alternate in the expected post-failure topology. A repair can add segments to steer past the part of the old topology that would send traffic back.' },
      { kind: 'advanced', title: 'Why P2 fails the local LFA test', blocks: [
        { kind: 'text', text: 'A directly connected neighbor N can be a loop-free alternate for destination D if dist(N,D) < dist(N,S) + dist(S,D), where S is the protecting router. From P1, P2 fails this test for PE2 because 15 = 5 + 10. A repair via P2 must account for its old forwarding through P1. One possible segment list steers through the directed P2→PE2 adjacency, which bypasses that SPF decision. Confirm the actual encoded list and rewrite on the device.' },
      ] },
      repair,
      { kind: 'advanced', title: 'Configure and verify the local repair at P1', blocks: [
        { kind: 'cli', title: 'Enable TI-LFA on P1’s protected PE2-facing link', os: xr,
          code: [
            'configure',
            'ipv4 unnumbered mpls traffic-eng Loopback0',
            'router isis CORE',
            ' interface GigabitEthernet0/0/0/2',
            '  address-family ipv4 unicast',
            '   fast-reroute per-prefix',
            '   fast-reroute per-prefix ti-lfa',
            '   exit',
            '  exit',
            ' exit',
            'commit',
            'end',
          ].join('\n'),
          note: 'Apply on the PLR after baseline SR forwarding works, where the platform supports TI-LFA. The ASR 9000 guide lists the default source command for the automatic SR-TE policy used by a microloop-avoidant path. See the lab for the failure, restore and verification sequence.',
          interpretation: 'The protected egress on P1 is GigabitEthernet0/0/0/2. The alternate after the link failure is through P2 and then PE2. Read the installed repair from IS-IS and CEF.',
        },
      ] },
      { kind: 'advanced', title: 'Protection scope and convergence timeline', blocks: [
        { kind: 'list', items: [
          'Link protection excludes one link. Node protection excludes the primary next-hop router and its attached links. Shared risk link group (SRLG) protection excludes links with a shared failure cause such as a common conduit. An alternate can protect a link while still sharing a node or conduit.',
          'When the local router detects a failure through interface state or a supported mechanism such as BFD, it uses its installed repair. LSP flooding, SPF and RIB/FIB updates follow. Measure the initial repair interval and eventual path separately.',
          'Routers can install the new FIB at different times. TI-LFA helps at the PLR. Compare old and new paths across the domain and consider microloop avoidance where supported. A lower detection timer can increase sensitivity to transient loss and leaves programming time and repair validity as separate issues.',
          'Restoring the link may change the shortest path again. Recheck primary, backup and traffic. Use timestamped probes or traffic counters to estimate the interruption.',
        ] },
      ] },
    ],
  },
  {
    id: 'apply', title: '6 · Apply SR-MPLS to a provider design', minutes: 20, dimension: 'Architecture Readiness',
    summary: 'Plan a staged transport migration and decide whether a service needs explicit steering.',
    blocks: [
      { kind: 'text', text: 'An ISP carries VPNs over an LDP core and needs local link repair on its aggregation paths. Two older PEs remain LDP-only for a quarter. Preserve PE loopbacks and service labels, keep rollback through LDP, and inventory the links, line cards and services in each migration wave.' },
      { kind: 'list', items: [
        'Baseline reachability and service traffic in both directions. Record label protocol, next hops, core MTU, peak traffic and loss during a representative failure. Inventory targeted LDP, pseudowire and RSVP dependencies separately.',
        'Reserve collision-free indexes and a consistently supported SRGB. Stage SR advertisements alongside LDP with conservative forwarding preference. Validate each advertised SID, next-hop SRGB and LFIB programming before changing preference.',
        'If a legacy egress cannot originate a Prefix-SID, a mapping server can advertise its prefix-to-SID mapping. A dual-capable boundary must have the LDP binding and the SR forwarding and translation for that FEC. Confirm that both directions work through all intended boundaries.',
        'Prefer SR in a bounded canary after validating both data planes. Compare service-label resolution, traffic, OAM and FRR. If the canary fails, restore the prior preference while LDP remains operational and verify service traffic before expanding.',
        'Retire LDP after the remaining services and nodes pass dependency checks and the operator has a tested restore procedure. Coordinate removal of LDP–IGP synchronization with the last transport LDP dependency.',
      ] },
      { kind: 'cli', title: 'Compare LDP and the selected forwarding action', os: xr,
        code: 'show mpls ldp bindings 10.0.0.4/32 detail\nshow cef ipv4 10.0.0.4/32 detail',
        note: 'Use during the coexistence phase. Compare the downstream LDP label for the selected neighbor with the programmed imposition. The greenfield lab enables SR alone.',
      },
      { kind: 'table', headers: ['Requirement', 'Approach', 'What to validate'], rows: [
        ['Reach PE loopbacks with minimal change on a legacy core', 'Retain LDP while hardware readiness and rollback are being established.', 'Per-hop LDP continuity, IGP synchronization, restore time and legacy dependencies.'],
        ['Shortest-path MPLS with local repair', 'Use IGP SR-MPLS and TI-LFA on eligible links.', 'SID allocation, alternate paths, imposition depth and actual link, node and SRLG coverage.'],
        ['Steer selected traffic over a deliberate path', 'Use an SR Policy with explicit or dynamically computed candidate paths.', 'Headend steering, selected candidate, behavior when the policy becomes invalid, label budget and path headroom.'],
        ['Require hop-by-hop bandwidth admission', 'Evaluate RSVP-TE and its reservation model, or a controller-based design with explicit capacity accounting and an agreed failure model.', 'Where admission is enforced, headroom under reroute, stale reservations or telemetry, and rollback.'],
      ] },
      { kind: 'advanced', title: 'Candidate paths, stack limits and capacity', blocks: [
        { kind: 'text', text: 'An SR Policy is identified by headend, color and endpoint. The headend selects the highest-preference valid candidate under the policy’s selection rules. A segment list can encode a loose route through Node-SIDs or explicitly force links with Adj-SIDs. A Binding SID can identify a policy on its owner. Inspect the route’s steering association and the policy’s resolved forwarding.' },
        { kind: 'cli', title: 'Check policy selection on an SR-TE headend', os: xr,
          code: 'show segment-routing traffic-eng policy color 100',
          note: 'Use if an SR Policy of this color has been configured. Check endpoint, active preference, validity and resolved segment list. Verify which service is steering into the policy and test the packet path.',
        },
        { kind: 'text', text: 'Budget every entry imposed at each point, including service, policy, entropy where used, and FRR repair labels. Each MPLS stack entry adds 4 bytes. Compare the Maximum SID Depth (MSD) advertisement, the platform’s imposition and parsing limits, and link MTU. Compression through Node-SIDs can save labels while allowing the interior shortest path to change.' },
        { kind: 'text', text: 'Flexible Algorithm lets an IGP domain compute an alternate topology using a shared algorithm definition and constraints, such as an excluded link affinity. Participating routers must agree on the definition and advertise the matching algorithm-specific Prefix-SIDs. That computation can steer classes of traffic without per-destination explicit lists. Measure available capacity and fate sharing separately.' },
      ] },
    ],
  },
  {
    id: 'defend', title: '7 · Defend the design and teach the packet walk', minutes: 20, dimension: 'Instructor Readiness',
    summary: 'Explain the mechanism under questioning and lead a demonstration with observable checkpoints.',
    blocks: [
      { kind: 'text', text: 'Use the four-router lab. Start with a blank label column beside the topology. Ask learners to find PE2’s /32, calculate the sum of link costs, and locate its Prefix-SID index in the flooded database. They should write the receiving router’s SRGB beside each link before calculating the wire label.' },
      { kind: 'table', headers: ['Demonstrate', 'Ask the learner', 'Evidence to require'], rows: [
        ['Normal transport with PHP', 'Why does PE1 send 16004 and why is it absent on the final link?', 'P1’s SRGB and PE2’s index, then P1’s LFIB Pop action and egress next hop.'],
        ['Swap with different SRGBs on the converged alternate', 'What label does P2 receive and transmit if its block starts at 24000?', 'PE1 sends 24004 to P2, P2 sends 16004 to P1, and P1 pops toward PE2.'],
        ['Single-link fault and fast repair', 'Why would a plain detour through P2 be unsafe before P2 updates SPF?', 'P2’s old SPF via P1, P1’s programmed repair where available, and the measured traffic gap plus the converged route.'],
        ['Customer change control', 'What should block a canary if ordinary pings succeed?', 'A missing labeled service path, failed reverse direction, invalid FRR, inadequate stack headroom or a failed service probe.'],
      ] },
      { kind: 'text', text: 'In an interview, state the algorithm, topology, failure scope, receiving SRGB and label order before tracing forwarding. When defending a migration, state the customer requirement, the forwarding mechanism, remaining legacy dependencies, evidence required before change, and rollback trigger.' },
      { kind: 'advanced', title: 'Debrief a student’s explanation', blocks: [
        { kind: 'list', items: [
          'If they derive every outgoing label from the ingress’s SRGB, give P2 a different block and ask which router will receive the first label.',
          'If they assume a Node-SID pins a link, introduce the ECMP case and ask how to force P2→PE2 specifically.',
          'If they equate an Up IGP adjacency with operational SR, show an otherwise healthy /32 advertisement without its Prefix-SID and ask which label state would be missing.',
          'If they claim protection from a successful ping, ask which link, node or shared-risk failure they tested, what backup was installed before failure, and how they measured the interruption.',
        ] },
      ] },
    ],
  },
]
