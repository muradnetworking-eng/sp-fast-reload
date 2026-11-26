import type { Block, Source, Unit } from '../../../schemas/content'

const xr = 'IOS XR 7.11.x · ASR 9000 reference'
const xe = 'IOS XE 17.x · supported MPLS router reference'
const xrGuide = 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/mpls/configuration/guide/b-mpls-cg-asr9000-711x/'
const xrCommands = 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/mpls/command/reference/b-mpls-cr-asr9000/'
const xeGuide = 'https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/mpls/b-mpls/'
const rfc = (number: number, title: string, scope: string): Source => ({
  title: 'RFC ' + number + ' · ' + title,
  url: 'https://www.rfc-editor.org/rfc/rfc' + number + '.html',
  scope,
})

export const prerequisites = [
  'Identify an IPv4 destination prefix, selected route, recursive next hop and outgoing interface. The first stages introduce every MPLS-specific term.',
  'Use four MPLS-capable routers with the lab’s OSPF area 0, stable Loopback0 addresses and console access. Initial, staged and final configurations use a manual build.',
  'Check exact image, line-card and emulator support for MPLS forwarding, MPLS OAM, label stack depth and MTU. The examples are documentation-reviewed and require device verification on your selected image.',
]

export const sources: Source[] = [
  rfc(3031, 'Multiprotocol Label Switching Architecture', 'FEC, label spaces, label control and forwarding architecture'),
  rfc(3032, 'MPLS Label Stack Encoding', 'Four-byte stack entries, bottom-of-stack and special-purpose labels'),
  rfc(5036, 'LDP Specification', 'Discovery, transport roles, sessions, mappings, retention and distribution control'),
  rfc(3443, 'TTL Processing in MPLS Networks', 'Uniform, pipe and short-pipe TTL including PHP and nested tunnels'),
  rfc(4182, 'Removing a Restriction on MPLS Explicit NULL', 'Explicit-null use above another label in a stack'),
  rfc(5462, 'MPLS Label Stack Entry EXP Field Renamed TC', 'Traffic Class field terminology'),
  rfc(3270, 'MPLS Support of Differentiated Services', 'E-LSP/L-LSP concepts, class treatment and tunneling models'),
  rfc(4364, 'BGP/MPLS IP VPNs', 'Service versus transport labels and PE forwarding context'),
  rfc(5443, 'LDP IGP Synchronization', 'Classic synchronization dependency. The lab uses the documented IOS XR 7.11 mechanism.'),
  rfc(5880, 'Bidirectional Forwarding Detection', 'Failure detection distinct from routing computation and forwarding repair'),
  rfc(8029, 'Detecting MPLS Data-Plane Failures', 'MPLS echo, Target FEC Stack and traceroute validation'),
  rfc(6790, 'The Use of Entropy Labels in MPLS Forwarding', 'ELI/entropy label, supported capability and load balancing'),
  rfc(4762, 'VPLS Using LDP Signaling', 'Pseudowire mesh, service labels and MAC-based service forwarding overview'),
  rfc(8077, 'Pseudowire Setup and Maintenance Using LDP', 'Targeted service signaling and pseudowire bindings, updating RFC 4447'),
  rfc(4385, 'Pseudowire Emulation Edge-to-Edge Control Word', 'Control-word role and payload disambiguation'),
  rfc(8660, 'Segment Routing with the MPLS Data Plane', 'SR index mapping and shared MPLS label operations'),
  rfc(8661, 'SR MPLS Interworking with LDP', 'Coexistence, translation boundaries and staged migration'),
  { title: 'Cisco ASR 9000 IOS XR 7.11 · MPLS LDP', url: xrGuide + 'implementing-mpls-ldp.html', scope: 'XR LDP activation, transport addresses, filtering, null labels and IGP sync' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · MPLS OAM', url: xrGuide + 'implementing-mpls-oam.html', scope: 'MPLS echo and traceroute examples, return codes and prerequisites' },
  { title: 'Cisco ASR 9000 · MPLS LDP Commands', url: xrCommands + 'mpls-label-distribution-protocol-commands.html', scope: 'LDP discovery, bindings, neighbors and synchronization command grammar' },
  { title: 'Cisco ASR 9000 · MPLS Forwarding Commands', url: xrCommands + 'mpls-forwarding-commands.html', scope: 'LFIB, interface MPLS state, label allocation and TTL controls' },
  { title: 'Cisco ASR 9000 · MPLS OAM Commands', url: xrCommands + 'mpls-oam-commands.html', scope: 'MPLS ping and traceroute options and image-specific release history' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · OSPF', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-ospf.html', scope: 'OSPF interface configuration and LDP IGP synchronization' },
  { title: 'Cisco ASR 9000 · OSPF Commands', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/routing/command/reference/b-routing-cr-asr9000/ospf-commands.html', scope: 'OSPF area/interface hierarchy, passive mode and interface cost' },
  { title: 'Cisco IOS XE 17 · MPLS LDP', url: xeGuide + 'm_mp-ldp-overview.html', scope: 'Interface MPLS, stable router ID, explicit-null and verification syntax' },
  { title: 'Cisco IOS XE 17 · LDP IGP Synchronization', url: xeGuide + 'm_mp-ldp-igp-synch.html', scope: 'OSPF/IS-IS synchronization, restrictions and show commands' },
  { title: 'Cisco TAC · MTU Behavior on IOS XR and IOS', url: 'https://www.cisco.com/c/en/us/support/docs/ios-nx-os-software/ios-xr-software/116350-trouble-ios-xr-mtu-00.html', scope: 'Different interface and packet MTU accounting across Cisco platforms' },
  { title: 'Cisco ASR 9000 · CEF Commands', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/ip-addresses/command/reference/b-ip-addresses-cr-asr9000/b-ipaddr-cr-asr9k_chapter_011.html', scope: 'IP classification, next-hop recursion and imposed-label evidence' },
  { title: 'Cisco Modeling Labs · IOS XRv 9000', url: 'https://developer.cisco.com/docs/modeling-labs/ios-xrv-9000/', scope: 'Virtual router resources and limits of documented feature tests' },
]

const topology: Block = {
  kind: 'diagram', title: 'OSPF CORE · area 0 · costs in both directions',
  text: [
    'PE1 --------10-------- P1 --------40--------- PE2',
    ' |                    |                      |',
    '40                   10                     10',
    ' |                    |                      |',
    ' +------------------- P2 --------------------+',
    '',
    'Loopback0 / LDP router and transport IDs',
    'PE1 10.10.0.1/32 · P1 .2/32 · P2 .3/32 · PE2 .4/32',
    'Primary to PE2: PE1 → P1 → P2 → PE2, link-cost sum 30',
    'Loopback0 cost 1 gives an installed /32 OSPF metric of 31.',
    'Each dynamic label below is read in its receiving router’s space.',
  ].join('\n'),
}

const routeCheck: Block = {
  kind: 'cli', title: 'Select the route before selecting a remote binding', os: xr,
  code: 'show route ipv4 10.10.0.4/32',
  note: 'On PE1 in the baseline, find the OSPF route via P1 at 10.10.12.1. Link costs sum to 30. The configured Loopback0 cost of 1 gives a /32 route metric of 31.',
}

const discoveryCheck: Block = {
  kind: 'cli', title: 'Read the Hello adjacencies', os: xr,
  code: 'show mpls ldp discovery',
  note: 'On PE1, check transmitted and received Hellos on both core interfaces, discovered LDP IDs and the advertised transport address. The link-level Hello source can differ from the TCP endpoint.',
}

const sessionCheck: Block = {
  kind: 'cli', title: 'Confirm the transport session and peer identity', os: xr,
  code: 'show mpls ldp neighbor',
  note: 'On PE1 expect operational sessions with P1 10.10.0.2:0 and P2 10.10.0.3:0. Inspect the TCP endpoints, distribution mode, peer addresses and discovery sources. Read actual state rather than inferring it from Hellos.',
}

const bindingCheck: Block = {
  kind: 'cli', title: 'Associate the FEC with local and remote labels', os: xr,
  code: 'show mpls ldp bindings 10.10.0.4/32 detail',
  note: 'On PE1, compare its local binding with remote bindings received from P1 and P2. Then repeat on P1 and P2.',
  output: 'Instructional field summary for FEC 10.10.0.4/32\nP1 local binding = L_P1 · advertised to PE1 and other eligible peers\nP2 local binding = L_P2 · advertised to P1 and other eligible peers\nPE2 local binding = implicit-null · advertised to adjacent peers\nActual L_P1 and L_P2 values are dynamically allocated.',
  interpretation: 'PE1 chooses P1’s binding because P1 is its routed next hop. A retained mapping from P2 can exist in the LIB without being the active outgoing label. PE1’s own local label is for packets received by PE1 in that label context.',
}

const cefCheck: Block = {
  kind: 'cli', title: 'Verify PE1’s imposed label and egress', os: xr,
  code: 'show cef ipv4 10.10.0.4/32 detail',
  note: 'Find the programmed outgoing interface, next hop and labels imposed on PE1. The baseline should use L_P1 toward P1 over Gi0/0/0/0.',
}

const lfibCheck: Block = {
  kind: 'cli', title: 'Read the transit operation at P1 and P2', os: xr,
  code: 'show mpls forwarding prefix 10.10.0.4/32',
  note: 'On P1, match incoming L_P1 to outgoing L_P2 toward P2. On P2, match incoming L_P2 to Pop toward PE2 in the baseline.',
  output: 'Expected operations, shown symbolically\nPE1: IP classification → push L_P1 → P1\nP1:  incoming L_P1 → swap to L_P2 → P2\nP2:  incoming L_P2 → pop transport → PE2\nPE2: receive IP destined for its loopback',
  interpretation: 'The label a router transmits is interpreted by the next router. Pop removes the active transport label. An inner service label, if one exists, remains.',
}

const interfaceCheck: Block = {
  kind: 'cli', title: 'Check MPLS enablement and packet MTU', os: xr,
  code: 'show mpls interfaces detail',
  note: 'Check every selected egress and its downstream receiving interface. Compare reported MPLS MTU with the physical/interface limit and the actual stack. Interface MTU accounting varies by platform.',
}

const syncCheck: Block = {
  kind: 'cli', title: 'Confirm LDP readiness and OSPF synchronization', os: xr,
  code: 'show mpls ldp igp sync',
  note: 'Use after enabling the synchronization checkpoint. Compare Ready/Not Ready state per interface with OSPF’s effective link cost and the bindings exchanged. A configured command alone does not prove synchronization.',
}

const oamCheck: Block = {
  kind: 'cli', title: 'Test the labeled path for the selected IPv4 FEC', os: xr,
  code: 'ping mpls ipv4 10.10.0.4/32 verbose\ntraceroute mpls ipv4 10.10.0.4/32',
  note: 'Enable MPLS OAM first and confirm echo return reachability. The trace should follow the baseline via P1 and P2 for the probed path. Test each ECMP branch when the topology changes.',
  interpretation: 'A successful echo validates the tested FEC and label path. A timeout can also reflect reply-path or OAM handling failure. An ordinary IP ping can succeed while a required labeled service path is broken.',
}

export const reload: Unit = {
  id: 'reload', title: '15-Min Reload', minutes: 15, dimension: 'Conceptual Knowledge',
  summary: 'Reconstruct how an IP route and a downstream label binding produce the actual push, swap and pop actions.',
  blocks: [
    { kind: 'text', text: 'MPLS attaches a stack of local forwarding instructions to traffic classified into a Forwarding Equivalence Class (FEC). In this LDP transport example the FEC is the egress loopback prefix. The IGP chooses the next hop. Label Distribution Protocol (LDP) supplies that next hop’s label for the FEC. Transit LFIB entries switch the active top label.' },
    topology,
    { kind: 'list', items: [
      'Start with the selected FEC route. A label from a peer outside the selected next-hop set can remain in the LIB without being the active forwarding label.',
      'Interpret labels in the receiving router’s label space. The sender’s local label and outgoing label have different roles.',
      'Check discovery, session, binding and forwarding separately. UDP/646 Hellos can work while the TCP/646 transport address is unreachable.',
      'Implicit-null 3 signals PHP and is absent from the wire. Explicit-null 0 or 2 can reach the egress. Pop removes one active label and can expose another label.',
      'Prove the complete packet path, stack size and return path. An Up session or a small IP ping does not establish MPLS service readiness.',
    ] },
    { kind: 'table', headers: ['Forgotten dependency', 'Recover the operational detail'], rows: [
      ['LDP ID versus TCP address', 'The LDP ID combines a router identifier and label-space ID. Hellos may advertise a different transport address. TCP must reach that address in both directions.'],
      ['LIB versus LFIB', 'The LIB holds local and remote bindings. The LFIB contains installed incoming-label actions. Check CEF for IP packet imposition.'],
      ['PHP versus an unlabeled gap', 'Expected PHP occurs immediately before the transport endpoint. An earlier loss of transport labeling can break nested services even while IP reachability remains.'],
      ['Convergence versus protection', 'LDP IGP sync discourages an unready link in the documented OSPF design. BFD detects failure. A fast repair still requires a supported, programmed alternate.'],
      ['Platform syntax', 'XR uses mpls ldp hierarchy and show mpls forwarding. IOS/IOS XE commonly uses interface mpls ip and show mpls forwarding-table. Inspect exact image support.'],
    ] },
    { kind: 'advanced', title: 'Ten essential IOS XR checks', blocks: [routeCheck, discoveryCheck, sessionCheck, bindingCheck, cefCheck, lfibCheck, interfaceCheck, syncCheck, oamCheck] },
    { kind: 'advanced', title: 'What might I have forgotten?', blocks: [
      { kind: 'list', items: [
        'Which router allocated the label I expect on each individual link?',
        'Did I verify the destination FEC binding from the actual routed next hop?',
        'Is implicit-null a control-plane mapping here, and what header remains after PHP?',
        'Is this a plain transport probe or a nested service with its own label context?',
        'Did the enlarged repair, VPN or entropy-label stack exceed a link or hardware limit?',
        'Are the observed drop, TTL, TC and OAM behavior consistent with the configured model?',
      ] },
    ] },
  ],
}

export const stages: Unit[] = [
  {
    id: 'understand', title: 'Understand the route, FEC and label', minutes: 25, dimension: 'Conceptual Knowledge',
    summary: 'Build the forwarding model from an IP route before introducing label distribution.',
    blocks: [
      { kind: 'text', text: 'An ingress Label Edge Router (LER) classifies a packet into a Forwarding Equivalence Class (FEC), a group receiving the same forwarding treatment. In the lab, packets destined for 10.10.0.4/32 use the PE2 transport FEC. The label-switched path (LSP) is the resulting unidirectional path through Label Switching Routers (LSRs). The return direction has its own route selection, labels and forwarding entries.' },
      { kind: 'text', text: 'A label identifies a forwarding entry in a particular receiving context. In ordinary downstream-allocated LDP, each router allocates its own incoming label for a FEC and tells its peers what label to send to it. The number need only have the intended meaning in that label space. Matching numeric values at two different routers can refer to different FECs. Modern packet platforms commonly use per-platform label spaces, while the architecture also defines interface-associated spaces.' },
      { kind: 'table', headers: ['Stack-entry field', 'Width', 'Interpretation'], rows: [
        ['Label', '20 bits', 'Selects a local label action. Some values are reserved for special purposes and are not ordinary dynamically allocated FEC labels.'],
        ['Traffic Class (TC)', '3 bits', 'Used by the provider’s supported class and drop-precedence mapping. Older Cisco output can call this field EXP.'],
        ['Bottom of stack (S)', '1 bit', 'S=1 marks the last label entry before the payload. With two labels, the top has S=0 and the lower has S=1.'],
        ['Time to Live (TTL)', '8 bits', 'Limits forwarding lifetime for the active label context. Its relationship to the payload TTL depends on the tunneling model.'],
      ] },
      { kind: 'text', text: 'Each label entry adds 4 bytes between the link-layer encapsulation and its following label or payload. Ethernet uses MPLS EtherTypes to identify the labeled frame. The top label is the active one. Push adds label entries, swap replaces the active label with the programmed outgoing stack, and pop removes the active label. After a pop the exposed header may be another label.' },
      { kind: 'advanced', title: 'Relate RIB, FIB, LIB and LFIB', blocks: [
        { kind: 'table', headers: ['State', 'What it answers', 'Lab example'], rows: [
          ['RIB · routing information base', 'Which route and next-hop set were selected for an IP prefix?', 'PE1 reaches PE2’s /32 through P1 in the baseline.'],
          ['FIB / CEF · forwarding information base', 'How does a packet classified by IP destination resolve to an interface, adjacency and imposed labels?', 'PE1 imposes the label P1 advertised for the PE2 FEC and sends to P1.'],
          ['LIB · label information base', 'Which local and received FEC-to-label bindings are known?', 'PE1 may retain bindings from both P1 and P2 for the same /32.'],
          ['LFIB · label forwarding information base', 'What happens to a packet that arrives with a particular active local label?', 'P1 matches its local label for PE2 and swaps to P2’s label for that FEC.'],
        ] },
        { kind: 'text', text: 'The route selects a next hop. LDP peer address information associates that next-hop address with a label-distributing neighbor. The remote mapping from that neighbor supplies the outgoing label. The local label supplies the incoming match. These dependencies must resolve and be programmed before the expected label action exists. A large LIB can contain alternatives while the LFIB uses only the selected next-hop set.' },
      ] },
      { kind: 'advanced', title: 'Three independent LDP choices', blocks: [
        { kind: 'table', headers: ['Dimension', 'Alternatives', 'Operational consequence'], rows: [
          ['Distribution mode', 'Downstream Unsolicited (DU) advertises without a request. Downstream on Demand (DoD) supplies mappings in response to requests.', 'Explains when a mapping is sent. It does not identify whether an alternative is retained or whether downstream state was required first.'],
          ['Retention mode', 'Liberal retention keeps eligible remote bindings from peers that are not current next hops. Conservative retention keeps the needed downstream mappings.', 'A retained alternative can speed a later next-hop change, subject to validity and programming. Retention consumes control-plane state.'],
          ['LSP control', 'Independent control can advertise a local mapping without first having a downstream one. Ordered control waits for a downstream mapping or the egress role.', 'An upstream mapping can exist before a complete downstream LSP with independent control. Do not use one binding as an end-to-end completion signal.'],
        ] },
        { kind: 'text', text: 'The IOS XR 7.11 guide documents liberal retention and selectable DoD. The lab uses the ordinary DU packet-network behavior, which the session display should identify. Treat the RFC control alternatives separately from a platform’s chosen implementation. Read the exact image’s documentation and state instead of inferring independent or ordered control merely from the term DU.' },
      ] },
    ],
  },
  {
    id: 'visualize', title: 'Visualize discovery and every label operation', minutes: 25, dimension: 'Conceptual Knowledge',
    summary: 'Follow LDP establishment and then predict the receiving-label context on each link.',
    blocks: [
      topology,
      { kind: 'advanced', title: 'From a Hello to an operational LDP session', blocks: [
        { kind: 'list', items: [
          'An enabled IPv4 LDP interface sends link Hellos using UDP port 646 to 224.0.0.2 on the directly attached link. The Hello identifies the LDP peer and can carry its TCP transport address.',
          'The LDP identifier is a router identifier plus a two-byte label-space identifier. The lab uses 10.10.0.x:0 with a platform-wide label space. The configured transport address is the corresponding reachable loopback.',
          'After discovery, the peers compare their transport addresses as unsigned values to decide TCP active/passive roles. With the lab’s IPv4 endpoints, the higher address initiates the TCP connection to port 646. The lower address listens. This comparison concerns transport addresses, which can differ from LDP IDs.',
          'LDP Initialization and KeepAlive exchange negotiates the session. An operational session can then exchange Address and Label Mapping messages over TCP. Hello adjacency lifetime and the LDP session keepalive/hold timer are separate.',
          'A targeted Hello uses unicast UDP/646 and suitable acceptance policy to discover a remote peer across multiple hops. Its active/passive Hello terminology is separate from the TCP role selection. The sender of the first targeted Hello can still have the passive TCP role.',
        ] },
        { kind: 'text', text: 'Several links can supply Hello adjacencies for the same pair of LDP identifiers while sharing one transport session for those label spaces. A surviving eligible adjacency or supported session-protection mechanism can keep the session alive after one link fails. Session survival says nothing by itself about whether the new packet next hop has the correct label action.' },
      ] },
      { kind: 'table', headers: ['Router', 'Input and lookup', 'Outgoing packet and next device'], rows: [
        ['PE1 ingress', 'IP destination 10.10.0.4. The metric-31 route uses P1 (link costs 30 plus loopback cost 1). P1 advertised local mapping L_P1 for that prefix.', 'Push L_P1 with S=1 above the IP packet. Send to P1 at 10.10.12.1.'],
        ['P1 transit', 'Active incoming label L_P1 selects the PE2 FEC. OSPF’s next hop is P2, which advertised L_P2.', 'Swap L_P1 to L_P2. Send on P1→P2, Gi0/0/0/1.'],
        ['P2 penultimate hop', 'Incoming L_P2 selects the PE2 FEC. PE2 advertised implicit-null for its locally terminating /32.', 'Pop the transport label. Send the IP packet directly to PE2 at 10.10.34.1.'],
        ['PE2 endpoint', 'IP destination equals its loopback.', 'Deliver locally. Traffic for a service context would require that service’s own egress forwarding state.'],
      ] },
      { kind: 'advanced', title: 'PHP, explicit-null and ultimate-hop disposition', blocks: [
        { kind: 'text', text: 'Penultimate Hop Popping (PHP) occurs when the downstream endpoint’s implicit-null mapping requests that the upstream router remove the active label. The value 3 appears in signaling and binding displays, and it is never transmitted as a label in the MPLS stack. P2 therefore emits an IP packet in this single-label lab.' },
        { kind: 'text', text: 'With IPv4 explicit-null, PE2 advertises label 0 for the eligible terminating FEC. P2 swaps the active label to 0 and PE2 performs the disposition. IPv6 explicit-null uses label 2 in its defined context. Ultimate Hop Popping (UHP) describes disposition at the endpoint and can involve a special-purpose label or a feature-specific non-null no-PHP behavior. Verify the actual outgoing label and endpoint action.' },
        { kind: 'text', text: 'Explicit-null labels can occur above another label under RFC 4182. After that outer entry is removed, the remaining label still supplies the next lookup context. Do not assume label 0 always means the next bytes are immediately an IPv4 packet. A VPN transport stack can contain an outer explicit-null above a VPN service label.' },
      ] },
      { kind: 'advanced', title: 'Add a service label beneath transport', blocks: [
        { kind: 'diagram', title: 'Symbolic VPN stack · service label V belongs to PE2', text: [
          'PE1 → P1      [L_P1, V, customer packet]',
          'P1  → P2      [L_P2, V, customer packet]',
          'P2  → PE2     [V, customer packet]          transport PHP',
          'PE2           process V in its service-label context',
          '',
          'Top first. Transport S=0. Service label V has S=1.',
          'The actual VPN control plane and label allocation are in BGP / MP-BGP.',
        ].join('\n') },
        { kind: 'text', text: 'MP-BGP can advertise an egress-owned VPN label with the customer route. The ingress resolves the egress PE through the transport FEC and places that label above the service label. A P router needs transport state while the egress PE owns the VPN label’s meaning. The service label can select a VRF lookup or a more specific forwarding action depending on its allocation mode.' },
        { kind: 'text', text: 'A pseudowire similarly uses a service label to identify the remote attachment or service. LDP-signaled VPLS combines pseudowires and bridge/MAC forwarding behavior with transport connectivity. Its targeted service-signaling session is distinct from a directly connected LDP transport adjacency. A pseudowire control word, where negotiated/required, is a separate header after the service label. A complete VPLS implementation also needs its own service and loop-prevention design.' },
      ] },
      { kind: 'advanced', title: 'Predict the alternate and ECMP state', blocks: [
        { kind: 'text', text: 'Remove the P1–P2 link in the controlled lab. PE1 then has two metric-51 routes to PE2 (link costs 50 plus loopback cost 1): PE1→P1→PE2 and PE1→P2→PE2. Once converged, PE1 can impose P1’s remote binding for the P1 member and P2’s binding for the P2 member. Both downstream routers become penultimate hops on their direct PE2 links and pop for the implicit-null FEC.' },
        { kind: 'text', text: 'The already-retained labels help only if their sessions, mappings and outgoing interfaces remain valid. Check each programmed ECMP member. Forwarding is commonly flow-hashed, so one repeated probe can keep selecting one member. During convergence the old and new forwarding states can differ across routers. Measure the transient and the final state separately.' },
      ] },
    ],
  },
  {
    id: 'configure', title: 'Configure the underlay, LDP and label disposition', minutes: 30, dimension: 'Configuration Knowledge',
    summary: 'Bring up routes first, enable label distribution on intended core interfaces, and verify each new dependency.',
    blocks: [
      { kind: 'text', text: 'Use the lab addressing sheet and initial configurations for all four routers. The commands below build PE1’s OSPF attachment, then its LDP transport. Apply the corresponding per-router stages to P1, P2 and PE2. Customer-facing service interfaces belong to their own service configuration.' },
      { kind: 'cli', title: 'Stage 1 · Establish PE1’s OSPF route to the FEC', os: xr,
        code: [
          'configure',
          'router ospf CORE',
          ' router-id 10.10.0.1',
          ' area 0',
          '  interface Loopback0',
          '   passive enable',
          '   cost 1',
          '   exit',
          '  interface GigabitEthernet0/0/0/0',
          '   network point-to-point',
          '   cost 10',
          '   exit',
          '  interface GigabitEthernet0/0/0/1',
          '   network point-to-point',
          '   cost 40',
          '   exit',
          '  exit',
          ' exit',
          'commit',
          'end',
          'show ospf neighbor',
          'show route ipv4 10.10.0.4/32',
        ].join('\n'),
        note: 'Interfaces and addresses must already match the initial lab. Configure the rest of OSPF before expecting remote routes. Loopback0 is passive and its cost is explicitly 1. PE1’s primary /32 metric to PE2 is 31.',
        interpretation: 'OSPF supplies the physical path and next-hop decision. The passive loopback advertises a stable endpoint without forming an OSPF adjacency on that interface.',
      },
      { kind: 'cli', title: 'Stage 2 · Enable PE1’s LDP transport', os: xr,
        code: [
          'configure',
          'mpls ldp',
          ' router-id 10.10.0.1',
          ' address-family ipv4',
          '  discovery transport-address 10.10.0.1',
          '  exit',
          ' interface GigabitEthernet0/0/0/0',
          '  address-family ipv4',
          '   exit',
          '  exit',
          ' interface GigabitEthernet0/0/0/1',
          '  address-family ipv4',
          '   exit',
          '  exit',
          ' exit',
          'mpls oam',
          ' exit',
          'commit',
          'end',
        ].join('\n'),
        note: 'The loopback route and return path must already work. This lab deliberately makes the LDP router ID and TCP transport address equal. The interface list enables the intended LDP core adjacencies. Use each router’s own address and interface list.',
        interpretation: 'LDP activation supplies discovery, label exchange and the supported MPLS forwarding integration. XR uses this hierarchy instead of the IOS-style interface mpls ip command. MPLS OAM enables the lab’s LSP tests.',
      },
      discoveryCheck, sessionCheck, bindingCheck,
      { kind: 'advanced', title: 'Stage 3 · Keep the transport label to PE2 with explicit-null', blocks: [
        { kind: 'cli', title: 'PE2 · Advertise explicit-null for eligible egress FECs', os: xr,
          code: [
            'configure',
            'mpls ldp',
            ' address-family ipv4',
            '  label local advertise explicit-null',
            '  exit',
            ' exit',
            'commit',
            'end',
            'show mpls ldp bindings 10.10.0.4/32 detail',
          ].join('\n'),
          note: 'Apply on PE2 at the lab’s explicit-null checkpoint. This unfiltered setting affects eligible terminating FECs in that LDP AF. It is broader than one loopback. Read the new downstream mapping on P2 and its outgoing LFIB action.',
          interpretation: 'PE2’s /32 changes from implicit-null to IPv4 explicit-null. P2 should now send label 0 toward PE2 instead of performing the baseline transport PHP. The unrelated transport labels on earlier hops remain dynamically allocated.',
        },
        { kind: 'cli', title: 'PE2 · Restore the baseline implicit-null policy', os: xr,
          code: [
            'configure',
            'mpls ldp',
            ' address-family ipv4',
            '  no label local advertise explicit-null',
            '  exit',
            ' exit',
            'commit',
            'end',
          ].join('\n'),
          note: 'Restore after collecting the explicit-null evidence. Recheck PE2’s binding, P2’s Pop action and the labeled traffic test. Use the lab’s baseline files if earlier label policy also needs restoration.',
        },
      ] },
      { kind: 'advanced', title: 'Stage 4 · Coordinate OSPF readiness with LDP', blocks: [
        { kind: 'cli', title: 'Enable the documented XR OSPF synchronization mechanism', os: xr,
          code: [
            'configure',
            'router ospf CORE',
            ' mpls ldp sync',
            ' exit',
            'commit',
            'end',
            'show mpls ldp igp sync',
          ].join('\n'),
          note: 'Apply consistently on the lab core routers after baseline LDP forwarding works. Check per-link state and OSPF costs. Scope exceptions deliberately for links that have no MPLS transport role.',
          interpretation: 'With this documented XR 7.11 behavior, OSPF uses a high metric while an intended link is not LDP-ready, then returns to its configured cost when synchronization is satisfied. A finite high metric can still be selected when no suitable alternate exists. This is a readiness mechanism, with separate failure-detection and repair dependencies.',
        },
      ] },
      { kind: 'advanced', title: 'IOS / IOS XE configuration and verification differences', blocks: [
        { kind: 'cli', title: 'Enable LDP on an IOS XE core-facing interface', os: xe,
          code: [
            'configure terminal',
            'ip cef',
            'mpls label protocol ldp',
            'mpls ldp router-id Loopback0',
            'interface GigabitEthernet1',
            ' mpls ip',
            ' exit',
            'end',
            'show mpls ldp discovery',
            'show mpls ldp neighbor',
            'show mpls forwarding-table 10.10.0.4 255.255.255.255',
          ].join('\n'),
          note: 'Use on a supported MPLS router whose pre-existing Loopback0, IGP and data interface match the design. GigabitEthernet1 is an alternative-platform example and needs mapping to your node. Some platforms already enable CEF or constrain these commands.',
          interpretation: 'IOS/IOS XE uses show mpls forwarding-table and interface mpls ip for this conventional LDP design. A forced LDP router-ID change can reset sessions, so establish the stable ID before bringing up the lab.',
        },
        { kind: 'cli', title: 'IOS XE · Explicit-null and OSPF synchronization', os: xe,
          code: [
            'configure terminal',
            'mpls ldp explicit-null',
            'router ospf 100',
            ' mpls ldp sync',
            'end',
            'show mpls ldp igp sync',
            'show ip ospf mpls ldp interface',
          ].join('\n'),
          note: 'An independent syntax example. Apply explicit-null at the intended egress and synchronization in an existing supported OSPF process. Use the target platform’s filtering options to narrow explicit-null scope when needed.',
        },
        { kind: 'table', headers: ['Platform', 'What must be verified'], rows: [
          ['IOS XR · ASR / NCS', 'Per-platform MPLS and LDP support, commit behavior, label resources, exact OAM capability, label stack limits and forwarding MTU. Consult the matching ASR or NCS guide.'],
          ['IOS / IOS XE · ASR / supported Catalyst or virtual router', 'Exact SKU and image support for LDP, MPLS interfaces, CEF and label operations. IOS-style command availability on one router family does not establish support on every Catalyst model.'],
          ['NX-OS · Nexus', 'The specific label-switching guide and model determine supported label control planes. Some Nexus families use SR-MPLS features with different prerequisites. Verify LDP support before choosing the node for this LDP lab.'],
        ] },
      ] },
    ],
  },
  {
    id: 'verify', title: 'Verify the complete forwarding chain', minutes: 25, dimension: 'Configuration Knowledge',
    summary: 'Prove the selected route, neighbor identity, remote mapping and installed label action at each hop.',
    blocks: [
      { kind: 'text', text: 'Use the same FEC, 10.10.0.4/32, at every checkpoint. Keep a worksheet containing the local binding, selected outgoing binding, interface and next hop for PE1, P1 and P2. Replace the symbolic labels with your observations before comparing packet captures or counters.' },
      routeCheck, discoveryCheck, sessionCheck, bindingCheck, cefCheck, lfibCheck,
      { kind: 'advanced', title: 'Explain the binding-to-forwarding relationship', blocks: [
        { kind: 'table', headers: ['At the router', 'Read the evidence', 'Expected baseline reasoning'], rows: [
          ['PE1', 'Route to PE2, P1 remote mapping, CEF next hop and imposed label.', 'P1 is the selected next hop, so transmit P1’s local label for PE2. A mapping received from P2 is an alternative.'],
          ['P1', 'Local mapping advertised upstream and the remote mapping received from P2.', 'Match incoming L_P1, swap to L_P2 and use the P2-facing adjacency.'],
          ['P2', 'Local mapping advertised upstream and PE2’s implicit-null binding.', 'Match incoming L_P2, remove the transport label and use the PE2-facing adjacency.'],
          ['PE2', 'Local FEC and egress treatment.', 'Terminate the plain IP transport probe locally. For a nested service, verify its remaining label and service forwarding independently.'],
        ] },
        { kind: 'text', text: 'A control-plane mapping, a selected route and an installed forwarding rewrite are three pieces of evidence. Compare software state and platform-specific hardware state when those disagree. Inspect counters on the correct interface or line-card location. A missing downstream mapping can produce a different IP fallback or discard action depending on the packet context and platform. Read the action before diagnosing its service impact.' },
      ] },
      oamCheck,
      { kind: 'advanced', title: 'Interpret echo and traceroute evidence', blocks: [
        { kind: 'text', text: 'MPLS echo sends a packet through the tested label stack with a Target FEC Stack identifying the intended forwarding equivalence class. The receiver checks that the label path terminates or continues in the expected FEC context. The protocol uses special handling to prevent a misrouted probe from silently succeeding as an ordinary IP delivery. Replies can return through routed paths, depending on the chosen reply mode.' },
        { kind: 'table', headers: ['Observation', 'Next interpretation'], rows: [
          ['Echo succeeds for PE2 /32', 'The tested FEC path and responding endpoint are working for that probe. Check larger payloads, alternate members and any service labels separately.'],
          ['Timeout', 'Check the labeled path, endpoint OAM handling, reply reachability and control-plane policing. A timeout alone does not locate the loss.'],
          ['No FEC mapping / FEC mismatch', 'Compare the probe’s requested FEC and the router’s actual label/FEC state. Verify the right endpoint and label-control context.'],
          ['Premature termination / unexpected unlabeled step', 'Find where the transport terminates relative to the intended egress. Compare the downstream mapping and the actual remaining packet header.'],
          ['One trace reaches the endpoint after ECMP appears', 'It proves the probed branch. Vary supported probe parameters or real flows to exercise the other installed members.'],
        ] },
      ] },
      { kind: 'text', text: 'Repeat in reverse for the PE1 /32. For the failure exercise record the last pre-failure state, interruption, newly selected route, new label actions and restoration. Include image, platform, configuration checkpoint and actual command output in lab evidence.' },
    ],
  },
  {
    id: 'troubleshoot', title: 'Troubleshoot the first broken label dependency', minutes: 30, dimension: 'Troubleshooting Readiness',
    summary: 'Separate discovery, session, mapping, route selection, label programming and packet-size failures.',
    blocks: [
      { kind: 'table', headers: ['Symptom', 'Decisive investigation', 'Correction and verification'], rows: [
        ['Hellos are received but the session is not operational', 'Compare the advertised transport address and TCP endpoints, both loopback routes, TCP/646 filtering, authentication and initialization errors. Check active/passive roles using transport addresses.', 'Restore the failed transport or negotiation dependency. Recheck the session, received mappings and forwarding before declaring the FEC healthy.'],
        ['LDP sessions are up but PE2’s FEC has no useful outgoing binding', 'Read the selected route and identify its next-hop peer, then check that peer’s mapping for the exact /32. Inspect allocation, advertisement and acceptance policy separately.', 'Restore the intended FEC mapping or route. Verify the new CEF/LFIB action and test the actual packet context.'],
        ['IP ping works while a labeled service fails', 'Follow the service stack and look for a missing transport mapping or early disposition before the service-label owner. An ordinary IPv4 packet may route through an unlabeled gap.', 'Restore the required transport action and keep the service label valid to its endpoint. Recheck both label contexts, service forwarding and return path.'],
        ['Only large packets fail', 'Compare actual stack size against each link’s effective MPLS/frame MTU. Inspect drop counters, supported fragmentation/PMTU behavior and reverse ICMP reachability.', 'Correct the constrained MTU or reduce the supported service packet size. Retest the maximum required packet with the largest intended stack and both directions.'],
        ['Link restoration causes transient loss despite OSPF recovery', 'Compare OSPF’s selected link cost with LDP readiness, binding exchange and installed action on that interface. Check synchronization and any configured delay.', 'Restore or tune the supported sync mechanism and verify costs during recovery. Re-run the service test and measure the transient instead of inferring recovery from adjacency uptime.'],
        ['Only one ECMP branch loses traffic', 'Enumerate every CEF member and its receiver-specific outgoing label. Trace each next hop’s LFIB, interface state and MTU. One passing flow can stay on the healthy member.', 'Correct the divergent member. Test multiple flows or supported OAM branch selection and confirm per-member forwarding counters.'],
      ] },
      { kind: 'advanced', title: 'A session is up, but a mapping is not the right mapping', blocks: [
        { kind: 'text', text: 'Suppose PE1 receives a PE2 /32 binding from P2 while its selected route still uses P1. That retained P2 label belongs to the P2 receiving context. Sending it to P1 is not a valid substitution. Investigate why P1’s binding is absent or why the route selected that next hop. Read CEF’s programmed result and the receiver’s LFIB together.' },
        { kind: 'text', text: 'When a plain IPv4 FEC has no downstream label, a platform may still send an unlabeled IP packet if it can resolve and forward it. That can preserve an IP probe. A nested service packet still needs the correct transport to the PE that owns its inner label. Removing the outer label too early can expose a service label at an unintended router. Validate the actual action and remaining headers rather than treating all unlabeled output as the same event.' },
      ] },
      { kind: 'advanced', title: 'Convergence and protection have separate dependencies', blocks: [
        { kind: 'text', text: 'IGP-LDP synchronization communicates LDP readiness to the IGP. In the lab’s documented OSPF model, an unready link receives a high cost so a usable alternate is preferred. The IP adjacency remains useful for discovering routes and reaching LDP transport addresses. Ready indicates the platform’s link/session exchange condition, so still verify the specific FEC and service data plane.' },
        { kind: 'text', text: 'A link can fail, a TCP session can fail while links remain up, or one mapping can be withdrawn while the session remains healthy. The topology, session and binding events have different scopes. BFD can reduce detection time where supported. A precomputed LFA or other fast-repair mechanism additionally needs a loop-free alternate and valid labels already programmed. The baseline lab measures reconvergence and ECMP; any fast-repair claim needs its own qualified feature and traffic test.' },
        { kind: 'text', text: 'LDP session protection can use targeted Hellos to preserve a peer session and its bindings through a lost direct adjacency when routed connectivity remains. It does not create an alternate packet path. Graceful Restart can retain suitable forwarding state across a control-plane restart under its protocol assumptions. If the underlying forwarding is gone, retaining state can prolong loss. Verify actual recovery and timer behavior on the selected image.' },
      ] },
      { kind: 'advanced', title: 'TTL behavior is part of the packet walk', blocks: [
        { kind: 'table', headers: ['Model', 'Payload and label TTL relationship', 'What to observe'], rows: [
          ['Uniform', 'The tunnel participates in the payload’s hop budget. Propagation at imposition/disposition and the active label’s decrements expose the LSP’s forwarding hops.', 'Compare label TTL at each hop, payload TTL after disposition and IP traceroute behavior.'],
          ['Short pipe', 'The transport label has its own TTL. Core label decrements are isolated from the tunneled payload’s hop budget. The egress processes the exposed payload. PHP is compatible with this model.', 'The payload accounts for edge forwarding, while transit label hops use the independent tunnel TTL.'],
          ['Pipe without PHP', 'The TTL perspective matches short pipe without PHP. The tunnel header remains to the egress so provider tunnel treatment is available there.', 'Check that the transport header survives to the egress and distinguish its class treatment from the payload’s own fields.'],
        ] },
        { kind: 'text', text: 'For an illustrative forwarded IP packet entering PE1 and leaving PE2 toward an attached destination, uniform processing accounts for PE1, P1, P2 and PE2 as forwarding hops. A short-pipe transport isolates P1/P2 tunnel TTL consumption from the payload. The lab’s locally generated loopback probes follow the platform’s local-packet controls and terminate at the remote PE, so their exact TTL values need a separate observation.' },
        { kind: 'cli', title: 'Optional XR local-probe TTL experiment', os: xr,
          code: [
            'configure',
            'mpls ip-ttl-propagate disable local',
            'commit',
            'end',
          ].join('\n'),
          note: 'Use the lab’s isolated TTL experiment on the source PE and compare before/after router-generated probes. The local keyword scopes that choice to locally generated packets. The forwarded keyword addresses transit IP traffic separately. Read the target platform’s interaction with BFD and other features.',
          interpretation: 'The cited ASR 9000 behavior initializes imposed MPLS TTL to 255 when propagation is disabled for the selected traffic scope. Restore with no mpls ip-ttl-propagate disable local and verify the previous behavior. This changes TTL propagation and leaves QoS design to its supported classification/rewrite controls.',
        },
      ] },
      { kind: 'advanced', title: 'Traffic Class, MTU and entropy labels', blocks: [
        { kind: 'text', text: 'The 3-bit TC value is interpreted through the provider’s per-hop behavior mapping. In an E-LSP model, TC can identify the supported scheduling/drop treatment. It is not an automatic one-to-one copy of all 6 DSCP bits. In a QoS uniform design, provider changes can be mapped back to customer markings. A pipe design preserves customer markings while applying provider treatment; short pipe bases egress treatment on the exposed packet. Platform policies determine classification, mapping and rewrite.' },
        { kind: 'text', text: 'TTL and QoS tunneling models describe related encapsulation choices and must be verified separately. Some hardware commands or forwarding profiles couple particular TTL and QoS propagation behavior. Inspect the exact platform and test the intended marks at ingress, transit, PHP and egress before assuming a portable default.' },
        { kind: 'text', text: 'Count overhead at the same measurement layer. A 1500-byte IP packet plus two MPLS entries occupies 1508 bytes before Ethernet encapsulation. A 14-byte Ethernet header gives 1522 before tags, FCS or other link-specific accounting. On the cited ASR 9000 physical-interface model, configured MTU includes the Ethernet header. Compare actual IP/MPLS ceilings and line-card limits. Do not rely on core fragmentation to accommodate an undersized link.' },
        { kind: 'text', text: 'Entropy labels let a transit device hash a stable entropy value instead of depending only on a shared transport label or deep payload inspection. Entropy Label Indicator (ELI, special-purpose value 7) identifies the following entropy-label entry. The pair adds 8 bytes. Capability, insertion position, parsing depth and maximum stack handling must support the actual path. A pseudowire control word can also prevent payload bytes from being misread as an IP header by some hashing methods.' },
      ] },
    ],
  },
  {
    id: 'apply', title: 'Apply MPLS transport to a provider requirement', minutes: 25, dimension: 'Architecture Readiness',
    summary: 'Choose and validate the transport, service boundaries, recovery behavior and migration sequence.',
    blocks: [
      { kind: 'text', text: 'An ISP must carry existing IP VPN traffic across a four-router core, preserve customer packet sizes and avoid loss when an IGP link recovers before label exchange. Its current routes are stable, and later migration to SR-MPLS is being considered. Inventory service endpoints, transport FECs, platform support and rollback dependencies before changing the label control plane.' },
      { kind: 'table', headers: ['Design stage', 'Required decision and evidence'], rows: [
        ['Customer requirement', 'Specify supported payload size, classes, isolation, availability target and the failures to test. Identify the services and egress PEs that own each service label.'],
        ['Existing architecture', 'Map IGP next hops, LDP transport IDs, actual bindings and core MTUs. Find targeted LDP, pseudowire, VPN or RSVP dependencies before any removal.'],
        ['Proposed solution', 'Use stable routed transport IDs, consistent core LDP enablement, supported IGP synchronization and an explicit MTU/TTL/QoS policy. Keep PE service signaling and transit transport roles identifiable.'],
        ['Implementation', 'Baseline one FEC and service per class, stage one bounded link/router wave, collect label/FIB state, then test normal traffic and the intended failure. Keep a known-good configuration checkpoint.'],
        ['Verification', 'Prove ingress imposition, each transit action, service-label delivery, payload size and reverse path. Record packet loss and route/label transition timing during failure and restoration.'],
        ['Risks and tradeoffs', 'A high IGP metric cannot manufacture a surviving alternate. Liberal retention consumes state. Small probes can miss MTU faults. GR/session protection can preserve control state while the service’s actual path remains broken.'],
      ] },
      { kind: 'advanced', title: 'Select the transport control plane against the requirement', blocks: [
        { kind: 'table', headers: ['Option', 'Capabilities', 'Operational tradeoffs'], rows: [
          ['IGP + LDP', 'Conventional shortest-path MPLS transport from routing plus per-peer bindings.', 'Requires discovery/session reachability, FEC exchange and IGP/label readiness coordination. Explicit steering needs an additional mechanism.'],
          ['RSVP-TE', 'Signaled explicit/constrained paths and a defined reservation/admission model where configured.', 'Adds tunnel signaling, path-state and capacity/protection operations. Qualify the exact service and hardware.'],
          ['SR-MPLS', 'IGP-advertised reusable segments with source-imposed steering and supported local repair.', 'Requires SID/SRGB planning, supported label-stack depth and consistent forwarding. Capacity accounting and protection scope still need design and measurement.'],
        ] },
        { kind: 'text', text: 'All three can use MPLS push, swap and pop in the data plane while obtaining their forwarding instructions from different control mechanisms. Keep label resources unique within the router’s relevant label space when clients coexist. A familiar numeric label range alone does not identify which protocol owns a forwarding entry.' },
      ] },
      { kind: 'advanced', title: 'Plan an LDP-to-SR migration', blocks: [
        { kind: 'list', items: [
          'Baseline existing service labels, PE loopback FECs, transport paths, MTU and failure behavior. Identify LDP-only nodes and service-signaling dependencies.',
          'Stage SR capability and unique prefix indexes with a supported SRGB while retaining the working LDP transport. Verify SR advertisements and local/remote label programming for each required egress.',
          'Qualify the forwarding preference and any SR/LDP interworking boundary for the target platform. A mapping server can provide prefix-to-SID mappings for legacy nodes where the chosen interworking design supports it.',
          'Change preference in a bounded canary, compare actual service-label recursion and both-direction traffic, and exercise supported failures. Restore the previous preference while LDP remains operational if acceptance checks fail.',
          'Retire transport LDP only after its dependencies are removed or replaced and the restore plan has been tested. Review IGP-LDP synchronization and targeted service signaling by their actual remaining roles.',
        ] },
      ] },
      { kind: 'text', text: 'A service design also needs a boundary for untrusted labeled traffic and control-plane sessions. Restrict LDP transport reachability and accepted targeted discovery to intended peers, use supported authentication where appropriate, and apply platform control-plane protection without starving routing or OAM. MPLS label switching does not encrypt customer payloads.' },
    ],
  },
  {
    id: 'defend', title: 'Defend the forwarding model and teach the lab', minutes: 20, dimension: 'Instructor Readiness',
    summary: 'Explain each lookup and header transition, then demonstrate how evidence changes your diagnosis.',
    blocks: [
      { kind: 'text', text: 'Before delivering the session, reproduce the lab’s OSPF, LDP, explicit-null and synchronization checkpoints. Write the actual labels beside their allocating routers. Be ready to explain the route, the binding selected from the next-hop peer, the LFIB action and the packet remaining after each pop.' },
      { kind: 'table', headers: ['Demonstration', 'Predict before revealing output', 'Evidence required'], rows: [
        ['Baseline three-hop transport', 'Which label leaves PE1, which swap occurs at P1 and why does P2 pop?', 'PE1 route/CEF, P1 and P2 local/remote mappings, and each transit LFIB.'],
        ['Hello/session fault', 'What can work with UDP/646 while TCP/646 still fails?', 'Advertised transport address, source/return routes, session state and relevant filters.'],
        ['Explicit-null', 'What changes on the last link and which router performs disposition?', 'PE2 mapping and P2 outgoing label 0 for the IPv4 FEC, then the restore to PHP.'],
        ['Nested labels', 'What remains after transport PHP?', 'A symbolic or observed egress-owned service label and its separate disposition context.'],
        ['P1–P2 failure', 'Which PE1 next hops become equal cost and whose label belongs on each branch?', 'Metric-51 routes, two per-member impositions, direct penultimate actions and multiple-flow tests.'],
        ['MTU/TTL experiment', 'Which field or size change should be visible and what still requires a service test?', 'Correct measurement layer, actual packet stack, traffic scope and restored baseline.'],
      ] },
      { kind: 'advanced', title: 'Senior engineer checkpoints', blocks: [
        { kind: 'list', items: [
          'Identify the FEC and label space before interpreting a label number. Distinguish the local incoming match from the remote outgoing binding.',
          'Explain the two LDP transport roles using the advertised endpoint addresses. Keep targeted-Hello initiation separate from TCP active/passive selection.',
          'Use the route and the exact downstream mapping to explain the installed LFIB. State what a retained alternative can and cannot establish.',
          'Explain implicit-null signaling, explicit-null on the wire, PHP/UHP and the remaining header after disposition, including a nested service.',
          'Distinguish detection, label readiness, control-state preservation and actual forwarding repair. Support every convergence claim with the measured failure and platform.',
          'Teach a corrective action with a verification and restoration sequence. Record the reader’s study, simulated practice, real lab evidence and production experience separately.',
        ] },
      ] },
      { kind: 'text', text: 'Use the hidden-answer drills and interview scenarios to test label prediction and fault isolation. Ask the learner to choose the next command before showing the instructor solution. Their explanation should follow device → lookup → header change → next hop and should change when the evidence identifies a different failing stage.' },
    ],
  },
]
