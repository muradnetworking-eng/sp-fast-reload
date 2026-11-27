import type { Block, Source, Unit } from '../../../schemas/content'

const xr = 'IOS XR 7.11.x · ASR 9000 reference'
const xe = 'IOS XE 17.x · C8000v customer router reference'
const guide = 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/l2vpn/configuration/guide/b-l2vpn-cg-asr9000-711x/'
const commands = 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/lxvpn/command/reference/b-lxvpn-cr-asr9000/'
const mpls = 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/mpls/configuration/guide/b-mpls-cg-asr9000-711x/'
const rfc = (number: number, title: string, scope: string): Source => ({
  title: 'RFC ' + number + ' · ' + title,
  url: 'https://www.rfc-editor.org/rfc/rfc' + number + '.html',
  scope,
})

export const prerequisites: string[] = [
  'Identify Ethernet source/destination MAC addresses, an 802.1Q VLAN tag, ARP and an IPv4/IPv6 next hop. The first stages introduce attachment circuits, pseudowires, bridge domains and split horizon.',
  'Complete MPLS Foundations or explain local label significance, the selected IP route to a remote PE, LDP bindings, push/swap/pop and MTU accounting. The lab builds OSPF and MPLS transport before either Ethernet service.',
  'Use the eight-node manual lab: five IOS XR provider nodes and three IOS XE CEs. Check your exact image, forwarding hardware, license, interface names, resources and support for VPWS, VPLS, control word and OAM separately. Device/emulator execution remains pending.',
]

export const sources: Source[] = [
  rfc(3985, 'Pseudowire Emulation Edge-to-Edge Architecture', 'Attachment circuits, forwarders, adaptation and packet-switched transport'),
  rfc(8077, 'Pseudowire Setup and Maintenance Using LDP', 'Current LDP PW standard; obsoletes RFC 4447/6723. FEC 128/129, labels, parameters, status and control-word negotiation'),
  rfc(4448, 'Encapsulation Methods for Transport of Ethernet over MPLS', 'Raw/tagged Ethernet PW types, service-delimiting tags, FCS and MTU'),
  rfc(4385, 'PWE3 Control Word for Use over an MPLS PSN', 'Four-byte CW, payload disambiguation and associated channel'),
  rfc(8469, 'Recommendation to Use the Ethernet Control Word', 'Updates RFC 4448; CW recommendation to avoid payload misclassification and ECMP misordering'),
  rfc(4762, 'VPLS Using LDP Signaling', 'MAC learning, full mesh, flooding, PW split horizon, MAC withdrawal and hierarchical VPLS'),
  rfc(4761, 'VPLS Using BGP for Auto-Discovery and Signaling', 'BGP VPLS membership, label blocks and signaling distinct from LDP VPLS'),
  rfc(6074, 'Provisioning, Auto-Discovery, and Signaling in L2VPNs', 'Separate discovery from signaling; BGP discovery can accompany LDP PW signaling'),
  rfc(5085, 'Pseudowire Virtual Circuit Connectivity Verification', 'VCCV control channels and connectivity verification capability negotiation'),
  rfc(5885, 'BFD for Pseudowire VCCV', 'PW connectivity verification and fault indication with BFD'),
  rfc(8029, 'Detecting MPLS Data-Plane Failures', 'MPLS echo, target FECs, transport testing and return-path limits'),
  rfc(6718, 'Pseudowire Redundancy', 'Redundancy framework, failure scope and single-/multi-homed services'),
  rfc(6870, 'Pseudowire Preferential Forwarding Status Bit', 'Active/standby signaling and coordinated PW forwarding states'),
  rfc(5036, 'LDP Specification', 'Link versus targeted Hellos, UDP/TCP 646, sessions and transport labels'),
  rfc(3032, 'MPLS Label Stack Encoding', 'Four-byte entries, bottom-of-stack and implicit-null'),
  rfc(4182, 'Removing a Restriction on MPLS Explicit NULL', 'Explicit-null above a remaining PW service label'),
  rfc(7432, 'BGP MPLS-Based Ethernet VPN', 'EVPN MAC advertisements, Ethernet segments, designated forwarder and MPLS encapsulation'),
  rfc(8214, 'Virtual Private Wire Service Support in EVPN', 'EVPN VPWS service signaling compared with classic LDP pseudowires'),
  rfc(8365, 'A Network Virtualization Overlay Solution Using EVPN', 'EVPN overlay control plane, VXLAN-style encapsulation and VNI context'),
  rfc(8661, 'Segment Routing MPLS Interworking with LDP', 'Transport migration while preserving service signaling dependencies'),
  { title: 'Cisco ASR 9000 IOS XR 7.11 · Point-to-Point L2 Services', url: guide + 'm-implement-point-to-point-layer-2-services.html', scope: 'Local switching, MPLS PW setup, encapsulation, control word, redundancy and restrictions' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · Multipoint L2 Services', url: guide + 'implementing-multipoint-layer-2-services.html', scope: 'Bridge groups/domains, VFI mesh PWs, MAC behavior, AC split horizon and VPLS discovery/signaling variants' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · Ethernet Features', url: guide + 'ethernet-features.html', scope: 'Ethernet service classification, tag handling and release-specific access features' },
  { title: 'Cisco ASR 9000 · Point-to-Point L2 Commands', url: commands + 'point-to-point-layer-2-services-commands.html', scope: 'Xconnect/PW class hierarchy, transport mode, PW state and local/remote parameter evidence' },
  { title: 'Cisco ASR 9000 · Multipoint L2 Commands', url: commands + 'multipoint-layer-2-services-commands.html', scope: 'Bridge-domain verification and location-qualified forwarding/MAC commands' },
  { title: 'Cisco TAC · Understand IOS XR L2VPN Services and Features', url: 'https://www.cisco.com/c/en/us/support/docs/routers/asr-9000-series-aggregation-services-routers/116453-technote-ios-xr-l2vpn-00.html', scope: 'Source-qualified EVC rewrite, explicit PW control-word examples, raw/tagged mode and forwarding evidence' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · MPLS LDP', url: mpls + 'implementing-mpls-ldp.html', scope: 'Stable LDP IDs/transport endpoints, targeted discovery and core LDP transport' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · MPLS OAM', url: mpls + 'implementing-mpls-oam.html', scope: 'Transport LSP echo/traceroute and PW VCCV scope' },
  { title: 'Cisco ASR 9000 · MPLS OAM Commands', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/mpls/command/reference/b-mpls-cr-asr9000/mpls-oam-commands.html', scope: 'ping mpls pseudowire remote-PE PW-ID grammar and transport OAM options' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · OSPF', url: 'https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-ospf.html', scope: 'OSPF underlay hierarchy, point-to-point interfaces and explicit loopback cost' },
  { title: 'Cisco TAC · MTU Behavior on IOS XR and IOS', url: 'https://www.cisco.com/c/en/us/support/docs/ios-nx-os-software/ios-xr-software/116350-trouble-ios-xr-mtu-00.html', scope: 'XR Ethernet/header accounting, inherited subinterface MTU and rewrite effects; distinguish signaled PW MTU from frame budgets' },
  { title: 'Cisco IOS XE 17 · Routing Between VLANs with IEEE 802.1Q', url: 'https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/lan-wan/b-lan-wan/m_lnsw-conf-vlan-ieee.html', scope: 'CE tagged routed subinterfaces; this does not establish PE MPLS/VPLS support on arbitrary XE hardware' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · EVPN Features', url: guide + 'evpn-features.html', scope: 'Scoped Cisco EVPN comparison and platform dependencies, outside the LDP-VPLS baseline' },
  { title: 'Cisco ASR 9000 IOS XR 7.11 · EVPN VPWS', url: guide + 'evpn-virtual-private-wire-service.html', scope: 'EVPN VPWS comparison; verify chapter/platform support before implementing the migration' },
  { title: 'Cisco Nexus 9000 NX-OS 10.5(x) · VXLAN BGP EVPN', url: 'https://www.cisco.com/c/en/us/td/docs/dcn/nx-os/nexus9000/105x/configuration/vxlan/cisco-nexus-9000-series-nx-os-vxlan-configuration-guide-release-105x/m_configuring_vxlan_bgp_evpn.html', scope: 'Scoped VXLAN/EVPN alternative and platform restrictions; not evidence of generic MPLS/LDP/VPLS support' },
  { title: 'Cisco Modeling Labs · IOS XRv 9000', url: 'https://developer.cisco.com/docs/modeling-labs/ios-xrv-9000/', scope: 'The documented L2 MPLS feature test is point-to-point VPWS; it does not validate VPLS/VFI bridge forwarding. Resources and throughput limits are image-specific.' },
  { title: 'Cisco Modeling Labs · Legacy IOS XRv', url: 'https://developer.cisco.com/docs/modeling-labs/ios-xrv/', scope: 'Deprecated 32-bit XRv: documented point-to-point L2 MPLS control plane can form while data forwarding does not work; distinct from XRv 9000' },
]

const topology: Block = {
  kind: 'diagram', title: 'Eight-node lab · separate physical topology from service membership',
  text: [
    'CE1 === PE1 ---- P1 ---- P2 ---- PE2 === CE2',
    '                         |',
    '                        PE3 === CE3',
    '',
    'Lo0 / LDP identity: PE1 10.20.0.1 · P1 .2 · P2 .3 · PE2 .4 · PE3 .5 /32',
    'All four core links: OSPF CORE area 0, cost 10, link LDP.',
    'Loopback0 OSPF cost 1: PE1→PE2/PE3 /32 metric 31; PE2→PE3 metric 21.',
    'Access ===: PE Gi0/0/0/1 ↔ CE Gi1, service VLAN subinterfaces.',
    'VPWS100: PE1 ↔ PE2 only. P1/P2 are transport, not PW endpoints.',
    'VPLS200: PE1 ↔ PE2, PE1 ↔ PE3, PE2 ↔ PE3 full mesh.',
    'Targeted LDP between service PEs; no BGP in the baseline.',
  ].join('\n'),
}

const services: Block = {
  kind: 'table', headers: ['Service', 'Local classification', 'Provider forwarding context', 'Customer endpoints'],
  rows: [
    ['VPWS', 'CE/PE .100, dot1q 100, PE pop 1 symmetric.', 'Xconnect group VPWS / p2p CE1-CE2; peer PE1/PE2 and PW-ID 100.', 'CE1 192.0.2.1, CE2 .2 /24; 2001:db8:100::1/::2 /64.'],
    ['LDP VPLS', 'CE/PE .200, dot1q 200, PE pop 1 symmetric.', 'Bridge group VPLS / bridge-domain LAN200 / VFI MESH200; PW-ID 200 per PE pair.', 'CE1/CE2/CE3 198.51.100.1/.2/.3 /24; 2001:db8:200::1/::2/::3 /64.'],
  ],
}

const xcCheck: Block = {
  kind: 'cli', title: 'Read the complete point-to-point service state', os: xr,
  code: 'show l2vpn xconnect detail',
  note: 'On PE1/PE2, find VPWS / CE1-CE2, its .100 attachment and the remote PE with PW-ID 100. Read local/remote labels, PW type, operational CW, MTU, status and packet counters. No captured or fixed label number is assumed.',
}

const bdCheck: Block = {
  kind: 'cli', title: 'Read all VPLS attachments and mesh peers', os: xr,
  code: 'show l2vpn bridge-domain detail',
  note: 'On each PE, find VPLS / LAN200 / MESH200. Expect the local .200 AC plus two VFI neighbors, both PW-ID 200. Distinguish AC state, each directional PW binding, network split horizon and bridge MAC state.',
}

const ldpCheck: Block = {
  kind: 'cli', title: 'Separate discovery, service sessions and transport labels', os: xr,
  code: 'show mpls ldp discovery\nshow mpls ldp neighbor\nshow route ipv4 10.20.0.4/32\nshow mpls ldp bindings 10.20.0.4/32 detail\nshow cef ipv4 10.20.0.4/32 detail',
  note: 'On PE1, distinguish the adjacent P1 LDP relationship from targeted PE2/PE3 service discovery. PE2’s /32 route selects P1 with metric 31. An operational targeted session can carry mappings for both PW 100 and PW 200 without proving the transport FEC is programmed.',
}

const macCheck: Block = {
  kind: 'cli', title: 'Correlate learned MACs with the actual AC or remote PW', os: xr,
  code: 'show platform\nshow l2vpn forwarding bridge-domain VPLS:LAN200 mac-address detail location 0/0/CPU0',
  note: 'Use show platform to identify the actual forwarding node; replace the example 0/0/CPU0 with the location applicable to your image/card. After generating known CE traffic, compare dynamic MACs, attachment/PW, aging and hardware state. The baseline’s CE interfaces may reuse one physical MAC across their subinterfaces, so retain bridge-domain context.',
}

const pwWalk: Block = {
  kind: 'diagram', title: 'VPWS100 · modeled frame walk · outer label at left',
  text: [
    'CE1→PE1: [customer Ethernet / service VLAN100 / IPv4, IPv6 or ARP]',
    'PE1: classify .100 AC; pop service tag; select PE2 PW-ID100.',
    'PE1→P1: [T_P1(PE2), W_PE2_from_PE1_100] [CW] [customer Ethernet]',
    'P1 →P2: [T_P2(PE2), W_PE2_from_PE1_100] [CW] [customer Ethernet]',
    'P2 →PE2:[W_PE2_from_PE1_100] [CW] [customer Ethernet]  ← transport PHP',
    'PE2: incoming PW label → remove PW encapsulation/CW → .100 AC.',
    'PE2→CE2: symmetric rewrite restores service VLAN100; new egress FCS.',
    'Return direction uses PE1’s independently advertised incoming PW label.',
  ].join('\n'),
}

export const reload: Unit = {
  id: 'reload', title: 'L2VPN · 15-Min Reload', minutes: 15,
  summary: 'Recover Ethernet service context, targeted LDP, PW parameters, label operations and the distinction between a circuit and a bridge.',
  dimension: 'Conceptual Knowledge',
  blocks: [
    { kind: 'text', text: 'A Layer 2 VPN carries customer Layer 2 frames between attachment circuits across a provider packet network. VPWS joins two service endpoints; VPLS builds a multipoint Ethernet bridge using PWs. The PEs classify Ethernet services and impose a remote PW label under the transport stack. Customer IPv4, IPv6 and ARP share that Ethernet service; the provider needs no customer IP routes for this baseline. Primary references were reviewed on 2026-11-27. All illustrated results are modeled; device/emulator execution remains pending.' },
    services,
    { kind: 'table', headers: ['Remember', 'Operational consequence'], rows: [
      ['VLAN tag, PW-ID and MPLS PW label are different identifiers.', 'A local VLAN selects the AC; peer plus PW-ID/type identifies the signaled circuit; the received label selects the local PW disposition.'],
      ['Core link LDP and PE targeted LDP have different jobs.', 'UDP 646 carries discovery; TCP 646 carries LDP sessions/mappings. A session being up does not prove a specific PW or labeled transport path.'],
      ['Each PE advertises its own incoming PW label.', 'Transmit the remote PE’s label; read the local label in the receiving PE’s LFIB. Reverse labels are independent.'],
      ['PHP removes the outer transport label.', 'The PW label and optional/negotiated CW remain until the service egress. Implicit-null 3 is never on the wire.'],
      ['PW type, CW, MTU and status must be compatible.', 'Read operational local/remote parameters. Different CW preferences can negotiate no CW; they do not universally force PW-down.'],
      ['VPLS learns source MACs and floods eligible BUM traffic.', 'Known unicast, unknown unicast, broadcast and multicast can exercise different forwarding paths.'],
      ['Mesh PWs use network split horizon.', 'A frame arriving on one mesh PW is not relayed onto another mesh PW. A missing direct PW is not repaired by transit bridging through a third PE.'],
      ['Split horizon has a scope.', 'It does not automatically remove customer/access loops, replace an STP/multihoming design or protect against arbitrary dual-active attachment.'],
    ] },
    pwWalk,
    { kind: 'advanced', title: 'Essential verification sequence', blocks: [
      { kind: 'cli', title: 'Start at service classification', os: xr, code: 'show running-config interface GigabitEthernet0/0/0/1.100\nshow running-config interface GigabitEthernet0/0/0/1.200\nshow interfaces GigabitEthernet0/0/0/1.100\nshow interfaces GigabitEthernet0/0/0/1.200', note: 'Check l2transport, VLAN match, pop/reverse rewrite, parent state, effective MTU and counters. A carrier-up parent does not prove the right service tag reaches the AC.' },
      xcCheck, bdCheck, ldpCheck, macCheck,
      { kind: 'cli', title: 'Test transport, then the PW, then the CE service', os: xr, code: 'ping mpls ipv4 10.20.0.4/32\nping mpls pseudowire 10.20.0.4 100', note: 'On PE1 with MPLS OAM available, the first targets PE2 transport; the second targets that particular PW through supported VCCV. Check negotiated CC/CV and reply path. Neither alone proves VLAN rewrite, CE ARP/ND, VPLS flooding or application delivery.' },
    ] },
    { kind: 'list', items: [
      'No customer traffic: compare ingress VLAN/AC counters, PW state/parameters, transport rewrite and egress attachment in that order.',
      'VPLS subset failure: inspect every pairwise PW and source/destination MAC placement. Full mesh is a service requirement even when the IP/MPLS underlay is a tree.',
      'Only larger frames fail: count customer Ethernet, remaining tags, CW and actual labels against each measured MTU boundary.',
      'MAC flaps or storms: investigate duplicate attachment, customer loops, inconsistent active/standby state and flood scope; do not start by disabling split horizon.',
      'Restore one experiment at a time. Validate the expected failure scope, both frame directions, IPv4/IPv6 and unaffected services.',
    ] },
  ],
}

export const stages: Unit[] = [
  {
    id: 'understand', title: 'Understand · define the Ethernet service and its boundaries', minutes: 40,
    summary: 'Build the model from a customer frame, its local attachment and the provider PW or bridge forwarding context.',
    dimension: 'Conceptual Knowledge',
    blocks: [
      { kind: 'text', text: 'An Ethernet attachment circuit (AC) is the customer-facing logical connection to a PE, such as a physical port or a VLAN-matched subinterface. The service demarcation states which frames are admitted, which tags are service delimiters, permitted frame size, treatment of Layer 2 control protocols, QoS and fault behavior. A pseudowire (PW) emulates the required Layer 2 connection across a packet-switched network. The adaptation function removes or adds local encapsulation and maps a received PW back to the intended attachment or bridge.' },
      { kind: 'table', headers: ['Object', 'Meaning', 'Scope'], rows: [
        ['AC VLAN 100', 'Local CE/PE service-delimiting tag.', 'Selects PE1 .100 in this lab. Another PE can use a different local VLAN if adaptation is deliberately matched.'],
        ['PW-ID 100', 'Configured circuit identifier used with peer identity and PW type for the FEC 128 service.', 'Must correspond at the two endpoints. It need not equal the VLAN or an MPLS label.'],
        ['PW label W_PE2_from_PE1_100', 'Label allocated by PE2 for packets arriving on the PE1→PE2 direction of PW100.', 'Interpret at the advertising receiver, not globally. Independent of the reverse direction.'],
        ['Transport label T_P1(PE2)', 'P1’s advertised incoming binding for the PE2 loopback FEC.', 'The next receiving transport router’s label context. Can change at every core hop.'],
        ['Bridge-domain LAN200', 'PE-local Ethernet learning/flooding context containing ACs and PWs.', 'Its name is a local administrative choice; remote bridge membership must be coordinated by the actual service signaling/configuration.'],
        ['VFI MESH200', 'Virtual forwarding instance grouping the VPLS mesh PWs in this XR configuration.', 'Applies network-PW forwarding/split-horizon behavior; not a customer IP VRF.'],
      ] },
      { kind: 'table', headers: ['Service', 'Provider forwarding decision', 'Customer experience'], rows: [
        ['Local point-to-point cross-connect', 'Connect one local AC to another local AC.', 'A local emulated wire; no remote transport PW is required.'],
        ['VPWS: Virtual Private Wire Service', 'Map the AC to one point-to-point PW and the remote PW to its AC.', 'Two Ethernet endpoints appear connected. Provider MAC learning is not required for the basic cross-connect decision.'],
        ['VPLS: Virtual Private LAN Service', 'Learn source MACs and forward/flood within one bridge domain.', 'Several sites share a bridged Ethernet segment over a mesh of PWs.'],
        ['MPLS L3VPN comparison', 'Route customer IP in a VRF and exchange customer VPN prefixes.', 'Provider participates in Layer 3 routing; customer Ethernet broadcast is not extended as one LAN.'],
      ] },
      { kind: 'text', text: 'The Ethernet PW payload contains the customer Ethernet header and payload after the agreed adaptation. An ARP frame, IPv4 packet, IPv6 neighbor solicitation and IPv6 data packet can all traverse the same Ethernet PW. The P routers forward labels without understanding those customer protocols. PEs do not need a customer BGP session or IP route for this transparent Ethernet baseline. The IP addresses in the CE test plan are endpoints for generating traffic, not the identities that establish the PW.' },
      { kind: 'advanced', title: 'Raw mode, tagged mode and service-delimiting tags', blocks: [
        { kind: 'text', text: 'RFC 4448 defines Ethernet raw mode, PW type 0x0005, and Ethernet tagged mode, PW type 0x0004. Raw mode removes the service-delimiting tag before PW carriage; it can still carry non-service-delimiting customer tags transparently. Tagged mode carries a service-delimiting tag on the PW, adding one if needed and applying the agreed adaptation at egress. Therefore “raw” does not mean every frame must be untagged, and a tagged CE attachment does not alone determine the PW type.' },
        { kind: 'text', text: 'In this lab, encapsulation dot1q 100/200 selects each AC, rewrite ingress tag pop 1 symmetric removes its service tag on ingress and restores the corresponding local tag on egress. The PW class explicitly selects Ethernet transport mode. Follow the negotiated PW type and frame bytes; do not infer the mode from a subinterface number. A one-sided tag rewrite can leave the PW operational while customer frames arrive with the wrong encapsulation.' },
        { kind: 'text', text: 'Ordinary Ethernet PW operation does not transport the ingress Ethernet preamble or FCS. The ingress validates the received frame and the egress generates a new link FCS. Customer payload tags that remain after adaptation count in the PW size budget. Reserved Layer 2 control traffic such as STP/BPDUs, LACP, LLDP or CDP has platform/service-specific handling; a claim of Ethernet transparency must state which protocols are passed, tunneled, terminated or filtered. Successful IP/ARP carriage does not validate the required Layer 2 protocol-tunneling behavior.' },
      ] },
      { kind: 'text', text: 'A PW is bidirectional service built from independently signaled directional forwarding bindings. At PE1, the local label is what PE1 advertised for incoming traffic; the remote label is what PE1 imposes toward the peer. The same numeric label can exist on several routers with different meanings. PW-ID is a control-plane association, not the label that every customer frame carries.' },
      { kind: 'list', items: [
        'State the customer demarcation before choosing an encapsulation: port/VLAN mapping, tag adaptation, frame size and control-protocol contract.',
        'Keep provider IP addressing and customer Ethernet addressing separate. The MPLS underlay reaches a PE, not a customer MAC or subnet.',
        'Checkpoint: explain why changing PW-ID from 100 to 200 cannot be substituted for changing VLAN classification, and why a PW label can change without changing either service identifier.',
      ] },
    ],
  },
  {
    id: 'visualize', title: 'Visualize · follow signaling, an ARP exchange and the label stack', minutes: 45,
    summary: 'Trace link/targeted LDP, FEC and parameter negotiation, directional labels, VPLS flooding and learned unicast.',
    dimension: 'Conceptual Knowledge',
    blocks: [
      topology, services,
      { kind: 'table', headers: ['Stage', 'What happens', 'What remains unproven'], rows: [
        ['Underlay route', 'OSPF selects the path to the remote PE loopback.', 'No assurance that its transport label or the Ethernet service exists.'],
        ['Link LDP', 'Adjacent core routers discover each other with link Hellos and exchange transport FEC bindings.', 'No assurance of a remote PE-to-PE PW mapping.'],
        ['Targeted LDP', 'Service PEs use targeted unicast Hellos and an LDP TCP session for service signaling.', 'The session can be up while a particular PW-ID/type or parameter is wrong.'],
        ['PW association', 'The intended endpoint identities/FEC, PW type and parameters are matched; each PE advertises its incoming label.', 'No assurance of a correct VLAN, egress AC or usable transport label stack.'],
        ['Forwarding installation', 'The AC/PW or bridge service is programmed with local/remote labels and the selected PE transport.', 'Needs real data-plane, size, flooding and reverse-direction evidence.'],
      ] },
      { kind: 'advanced', title: 'Discovery and TCP roles are different layers', blocks: [
        { kind: 'text', text: 'LDP discovery uses UDP 646. Link discovery uses link-scoped Hellos between adjacent LSRs; targeted discovery uses unicast Hellos between selected peers that can be several IP hops apart. LDP session establishment and Label Mapping/Withdraw/Notification messages use TCP 646. The transport address must be reachable in both directions; an LDP identifier includes a router ID plus label-space identifier and is not simply the Hello packet’s source address.' },
        { kind: 'text', text: 'The higher transport address normally takes the TCP active-open role under LDP’s session rules. That role is separate from active/passive targeted-Hello behavior. Multiple PWs to the same pair of LDP label spaces can share one operational session: PE1↔PE2 carries PW100 and PW200 here. PW configuration can drive targeted discovery on supported XR behavior; do not prescribe blanket targeted-Hello acceptance of every source as a universal requirement. Inspect discovery sources and the configured acceptance/security scope.' },
      ] },
      { kind: 'advanced', title: 'What the PW control plane actually identifies and checks', blocks: [
        { kind: 'table', headers: ['Signaled item', 'Mechanism'], rows: [
          ['FEC 128 / PWid FEC', 'Uses a configured PW identifier and PW type; includes a group identifier for grouping operations and interface parameter information. The peer pair and matching service values associate the directions. A group ID is not a customer VLAN.'],
          ['FEC 129 / Generalized PWid FEC', 'Identifies the attachment group and source/target attachment identifiers. Each endpoint’s source/target association must match the reverse endpoint. Supports discovery-oriented provisioning without a single manually shared numeric PW-ID as the only identity.'],
          ['PW type', 'Defines the encapsulated service, such as raw Ethernet versus tagged Ethernet. Matching IDs with incompatible types do not define a usable common service.'],
          ['MTU/interface parameters', 'Describe service compatibility; compare local and remote operational values. A signaled MTU match and adequate transport frame size are independent checks.'],
          ['Control-word C bit', 'Signals CW use/preference under the standard negotiation procedure. Optional Ethernet CW can fall back to absent when a peer does not prefer/support it; inspect the result.'],
          ['PW status', 'Carries service/attachment fault indications. The label mapping can remain known while a local/remote status prevents useful forwarding. Read both ends and distinguish AC faults from transport faults.'],
        ] },
        { kind: 'text', text: 'The baseline’s explicitly configured peer plus PW-ID design uses the PWid model. FEC 129 is an additional signaling model, not “PW-ID 129” or a different MPLS shim. Control-word and MTU negotiation do not discover a CE’s IP subnet. Retain the FEC/peer association, parameter evidence and local/remote label pairing together.' },
      ] },
      pwWalk,
      { kind: 'text', text: 'T_P1(PE2) is P1’s incoming transport label for PE2; P1 swaps it to P2’s advertised label. W_PE2_from_PE1_100 stays bound to PE2’s receiving PW until PE2 interprets it. Default transport PHP at P2 removes only the outer label, leaving the PW label with S=1 in this two-label model. The CW is four bytes after the bottom label, not another label. Explicit-null transport can retain label 0 above the PW label under RFC 4182; it still leaves the PW service instruction for PE2.' },
      { kind: 'text', text: 'The service forwards Ethernet rather than routing the enclosed customer IP packet, so provider Layer 2 transit does not decrement that customer IP TTL or IPv6 Hop Limit. Provider MPLS labels have their own TTL behavior. Customer routers outside the service can still route and decrement the customer header; distinguish those endpoints from the transparent provider bridge/wire.' },
      { kind: 'diagram', title: 'VPLS200 · first ARP, then learned unicast', text: [
        '1 CE1 broadcasts ARP for 198.51.100.2 on VLAN200.',
        '2 PE1 classifies .200 → LAN200; learns CE1 source MAC on local AC.',
        '3 PE1 floods one eligible copy on PW→PE2 and one on PW→PE3.',
        '4 PE2/PE3 learn CE1 MAC on their respective PE1 PW.',
        '5 They deliver eligible copies to local .200 ACs; no mesh PW→PW relay.',
        '6 CE2 replies unicast; source learning places CE2 MAC on PE2 local AC',
        '  and on PE1/PE3 remote PWs when those PEs receive CE2 traffic.',
        '7 Subsequent PE1→CE2 known unicast selects only PE1→PE2 PW.',
        'Each receiving PW label is allocated by its particular remote PE.',
      ].join('\n') },
      { kind: 'text', text: 'A PE learns from frames it actually receives; CE2’s unicast ARP reply to CE1 is not automatically copied to PE3 once the destination is known. PE3 can learn CE2 later from CE2 traffic delivered to it or flooded within the allowed service. A MAC table is therefore evidence of observed source traffic, not a census of every connected CE. Unknown unicast, broadcast and multicast are collectively BUM; exact multicast replication can additionally depend on snooping/control policy.' },
      { kind: 'text', text: 'Network split horizon prohibits a frame received from a mesh PW from leaving through another mesh PW. Consequently PE1 must have a direct PW to PE3 even though PE1 can reach PE3 through P1/P2 at the transport layer. Removing only PE1↔PE3 VPLS membership can break that pair while both still communicate with PE2; PE2 must not be used as a transit bridge to conceal the missing mesh edge.' },
      { kind: 'list', items: [
        'Repeat the walk for IPv6 neighbor discovery and data. The customer IPv6 packet remains inside Ethernet; the IPv4-only core still forwards MPLS labels.',
        'Reverse the frame: use PE1’s service label and the reverse transport FEC. An operational forward path does not prove the reverse mapping, tag rewrite or customer response.',
        'Checkpoint: distinguish an unknown destination MAC from an unresolved customer IP neighbor, then identify where ARP/ND flooding and MAC learning overlap.',
      ] },
    ],
  },
  {
    id: 'configure', title: 'Configure · build the underlay, then the wire and the bridge', minutes: 60,
    summary: 'Apply source-qualified XR AC/PW/VFI configuration and ordinary tagged XE customer interfaces in independently verified stages.',
    dimension: 'Configuration Knowledge',
    blocks: [
      { kind: 'list', items: [
        'Start from the lab’s initial files and manual port mapping. Establish all five provider loopbacks and the four OSPF links; use explicit loopback cost 1.',
        'Enable link LDP on PE1–P1, P1–P2, P2–PE2 and P2–PE3. Prove labeled transport to each remote service PE before adding PWs.',
        'Create .100 l2transport ACs on PE1/PE2 and a matching PW class, then bind VPWS100 at both ends.',
        'Create .200 ACs on all three PEs and VPLS LAN200 with two mesh neighbors per PE. Build all three pairwise PWs.',
        'Configure tagged CE routed subinterfaces; verify ARP/ND and IPv4/IPv6 in both directions. Add fault/scale experiments only from a known healthy checkpoint.',
      ] },
      { kind: 'cli', title: 'PE1 · transport excerpt after initial addressing', os: xr, code: [
        'configure', 'router ospf CORE', ' router-id 10.20.0.1', ' area 0',
        '  interface Loopback0', '   passive enable', '   cost 1', '  exit',
        '  interface GigabitEthernet0/0/0/0', '   network point-to-point', '   cost 10', '  exit', ' exit', 'exit',
        'mpls ldp', ' router-id 10.20.0.1', ' address-family ipv4', '  discovery transport-address 10.20.0.1', ' exit',
        ' interface GigabitEthernet0/0/0/0', '  address-family ipv4', '  exit', ' exit', 'exit', 'mpls oam', 'exit', 'commit', 'end',
      ].join('\n'), note: 'Incremental excerpt assumes Lo0 10.20.0.1/32 and core 10.20.12.0/31 already exist. The complete lab maps P1/P2 transit ports and the PE2/PE3 branches. Core physical MTU is 1600 with IPv4 MTU 1500; other nodes use their own stable IDs/transport addresses.' },
      { kind: 'cli', title: 'PE1 · classify and normalize the two access services', os: xr, code: [
        'configure', 'interface GigabitEthernet0/0/0/1', ' mtu 1514', ' no shutdown', 'exit',
        'interface GigabitEthernet0/0/0/1.100 l2transport', ' encapsulation dot1q 100', ' rewrite ingress tag pop 1 symmetric', ' no shutdown', 'exit',
        'interface GigabitEthernet0/0/0/1.200 l2transport', ' encapsulation dot1q 200', ' rewrite ingress tag pop 1 symmetric', ' no shutdown', 'exit', 'commit', 'end',
      ].join('\n'), note: 'These are Layer 2 service interfaces with no customer IP address or VRF. PE2 mirrors both subinterfaces; PE3 has only .200. Parent/subinterface and tag-rewrite MTU accounting follow the cited XR EVC/MTU documentation; inspect effective and signaled values on the actual image rather than assigning the core MTU to the PW by assumption.' },
      { kind: 'cli', title: 'PE1 · explicit Ethernet PW class and VPWS100', os: xr, code: [
        'configure', 'l2vpn', ' pw-class L2-CW', '  encapsulation mpls', '   protocol ldp', '   control-word', '   transport-mode ethernet', '  exit', ' exit',
        ' xconnect group VPWS', '  p2p CE1-CE2', '   interface GigabitEthernet0/0/0/1.100',
        '   neighbor ipv4 10.20.0.4 pw-id 100', '    pw-class L2-CW', '   exit', '  exit', ' exit', 'exit', 'commit', 'end',
      ].join('\n'), note: 'PE2 configures the same class, .100 AC and remote peer 10.20.0.1 with PW-ID 100. Group/p2p names organize local configuration; peer/FEC/type/parameters establish the remote service. CW class syntax is checked against Cisco’s XR L2VPN example and command references, not asserted from generic IOS syntax.' },
      { kind: 'cli', title: 'PE1 · VPLS200 access plus both mesh pseudowires', os: xr, code: [
        'configure', 'l2vpn', ' bridge group VPLS', '  bridge-domain LAN200',
        '   interface GigabitEthernet0/0/0/1.200', '   exit',
        '   vfi MESH200', '    neighbor 10.20.0.4 pw-id 200', '     pw-class L2-CW', '    exit',
        '    neighbor 10.20.0.5 pw-id 200', '     pw-class L2-CW', '    exit', '   exit', '  exit', ' exit', 'exit', 'commit', 'end',
      ].join('\n'), note: 'The class exists from the previous step. VFI neighbor grammar here differs from point-to-point neighbor ipv4 syntax. PE2’s VFI peers are 10.20.0.1 and 10.20.0.5; PE3’s are 10.20.0.1 and 10.20.0.4. Apply the class to every PW. No BGP, RD or RT is required for this manually provisioned LDP VPLS baseline.' },
      { kind: 'cli', title: 'CE1 · tagged IP endpoints for the two Ethernet services', os: xe, code: [
        'configure terminal', 'ipv6 unicast-routing',
        'interface GigabitEthernet1', ' no ip address', ' no shutdown', 'exit',
        'interface GigabitEthernet1.100', ' encapsulation dot1Q 100', ' ip address 192.0.2.1 255.255.255.0', ' ipv6 address 2001:db8:100::1/64', 'exit',
        'interface GigabitEthernet1.200', ' encapsulation dot1Q 200', ' ip address 198.51.100.1 255.255.255.0', ' ipv6 address 2001:db8:200::1/64', 'exit', 'end',
      ].join('\n'), note: 'CE2 uses .2/::2 in each corresponding service. CE3 has .200 only with .3/::3. The CEs run no provider LDP or PW configuration. These routed test endpoints can themselves route between their connected subnets, so a cross-subnet ping is not a provider Layer 2 isolation test.' },
      { kind: 'table', headers: ['Do not conflate', 'Implementation consequence'], rows: [
        ['IP transport and PW signaling', 'A PE-to-PE targeted LDP relationship is additional service signaling; the core link sessions provide transport. Preserve both during maintenance.'],
        ['PW-ID and service tag', 'The lab chooses equal numbers for readability. A VLAN translation extension changes local classification/rewrite while retaining the intended PW association.'],
        ['Bridge-domain AC and VFI mesh PW', 'Place the local .200 AC in the bridge domain and remote full-mesh PWs in MESH200. Access/spoke PWs for H-VPLS have a different forwarding role.'],
        ['Signaled PW MTU and physical frame size', 'Record local/remote service MTU after normalization, then independently prove the core can carry the complete encapsulation.'],
      ] },
      { kind: 'advanced', title: 'Platform and release boundaries', blocks: [
        { kind: 'table', headers: ['Platform family', 'Relevant convention', 'Required qualification'], rows: [
          ['IOS XR ASR 9000 7.11', 'l2transport interfaces, RPL-independent L2 service hierarchy, PW classes, bridge domains and commit.', 'Exact card/image support for VPLS, CW, tag rewrite, label depth, redundancy and OAM.'],
          ['IOS / IOS XE PE-capable router', 'Some platforms use xconnect/pseudowire-class, service instances, bridge domains or other release-specific syntax.', 'Do not translate XR hierarchy mechanically or assume every XE router/switch supports the full MPLS VPLS feature set.'],
          ['IOS XE C8000v CE here', '802.1Q routed subinterfaces generate customer Ethernet/IPv4/IPv6 tests.', 'This CE role does not establish PE label-switching or VPLS support.'],
          ['Other XR / NCS families', 'Related service concepts and sometimes similar hierarchy.', 'Use the exact product/release feature and scale documents; hardware forwarding differs.'],
          ['NX-OS / Nexus', 'Selected products support VRFs, EVPN and VXLAN features.', 'No generic Nexus 9000 MPLS/LDP/VPLS claim follows from that support. Verify the exact switch, ASIC, release and encapsulation.'],
          ['CML / EVE-NG', 'Manual setup with legally obtained supported images and observed interface mapping.', 'CML’s XRv 9000 L2 feature test covers point-to-point VPWS, not VPLS. Qualify bridge/VFI data-plane support separately before the VPLS phase. No tested import or recovery timing is claimed here.'],
        ] },
        { kind: 'text', text: 'Legacy 32-bit IOS XRv and IOS XRv 9000 are different virtual platforms. Cisco documents that legacy XRv can establish an L2 MPLS control plane while point-to-point forwarding does not work. XRv 9000 is a documented VPWS candidate, but its cited test does not establish multipoint VPLS support. Run the full VPLS phase only on an independently qualified image/card; a parser accepting bridge-domain/VFI configuration is not sufficient evidence.' },
      ] },
    ],
  },
  {
    id: 'verify', title: 'Verify · establish service state and actual frame delivery', minutes: 45,
    summary: 'Inspect AC classification, both PW directions, forwarding labels, learned MACs, layered OAM and sourced customer traffic.',
    dimension: 'Lab Experience',
    blocks: [
      { kind: 'text', text: 'Choose a precise observation: VPWS100 CE1→CE2, then reverse it; VPLS200 each CE pair in each direction; both IPv4 and IPv6. Predict which AC admits the frame, the remote service PE and its label, the transport next hop and the final AC tag. Keep modeled expectations separate from the output you actually capture.' },
      { kind: 'cli', title: 'Prove the receiving AC is classifying the intended frames', os: xr, code: 'show interfaces GigabitEthernet0/0/0/1\nshow interfaces GigabitEthernet0/0/0/1.100\nshow interfaces GigabitEthernet0/0/0/1.200\nshow running-config interface GigabitEthernet0/0/0/1.100', note: 'On PE1, correlate CE-generated VLAN100/200 frames with the correct subinterface counters and rewrite. Parent-up plus no subinterface counters points toward tagging/classification or the test source, before the core.' },
      xcCheck, bdCheck, ldpCheck,
      { kind: 'diagram', title: 'Expected relationships · symbolic, not captured output', text: [
        'PE1 VPWS peer10.20.0.4 PW-ID100:',
        ' local label = W_PE1_from_PE2_100',
        ' remote label = W_PE2_from_PE1_100',
        ' remote label must equal PE2’s advertised local label for this PW.',
        'PE1 VPLS peers10.20.0.4 and10.20.0.5 both use PW-ID200.',
        ' Each peer/FEC has its own label association and receive context.',
        'Operational type/CW/MTU/status must be read on both endpoints.',
      ].join('\n') },
      { kind: 'cli', title: 'Verify transport forwarding separately from service state', os: xr, code: 'show mpls forwarding prefix 10.20.0.4/32\nshow cef ipv4 10.20.0.4/32 detail\nshow mpls forwarding', note: 'At P1/P2, read the PE2 transport FEC. At the egress PE, locate the actual incoming PW label from xconnect/bridge detail and inspect its forwarding action. For a focused lookup use show mpls forwarding labels with that observed numeric label. The two labels have different owners and functions.' },
      macCheck,
      { kind: 'text', text: 'Generate traffic deliberately before interpreting the VPLS table. A CE1 source should be learned on PE1’s .200 AC and on the PE1 PW at a receiving remote PE. A known CE2 destination at PE1 should select the PE2 PW. An empty table before any frames is not a failure, and a correctly learned source does not by itself prove the reverse destination, all flood replicas or hardware forwarding.' },
      { kind: 'cli', title: 'Layered OAM on PE1', os: xr, code: 'ping 10.20.0.4 source 10.20.0.1\nping mpls ipv4 10.20.0.4/32\ntraceroute mpls ipv4 10.20.0.4/32\nping mpls pseudowire 10.20.0.4 100\nping mpls pseudowire 10.20.0.4 200\nping mpls pseudowire 10.20.0.5 200', note: 'Native IP tests reachability; MPLS echo/traceroute tests a transport FEC; PW ping uses the available VCCV channel/verification mechanisms. Read negotiated CC and CV capabilities and support on your image. A timeout can be an unsupported channel, reply-path/filter issue or forwarding fault; inspect return codes and counters before assigning a cause.' },
      { kind: 'advanced', title: 'VCCV separates the channel from the test carried over it', blocks: [
        { kind: 'text', text: 'A VCCV control channel (CC) identifies how a test reaches PW endpoint processing; a connectivity verification (CV) type identifies the test protocol carried through it. RFC 5085 defines CW-associated in-band channel handling, a router-alert-label method and PW-label TTL-expiry handling with TTL 1. The data CW and associated-channel header have distinct discriminators; an OAM packet is not simply arbitrary customer IP injected into the bridge.' },
        { kind: 'text', text: 'The endpoints advertise supported VCCV CC/CV capabilities, then use a compatible method. RFC 5885 defines BFD-based CV types with specific connectivity/fault-indication behavior; not every platform, channel or service supports every combination. Some channel methods can hash differently from ordinary PW data. Record the negotiated method and test direction before claiming which data path was exercised, and keep CE-to-CE probes as independent service evidence.' },
      ] },
      { kind: 'table', headers: ['Test layer', 'What a success supports', 'What it leaves open'], rows: [
        ['Native PE loopback ping', 'An IP path and usable reply path.', 'Continuous labeled transport, PW identity and customer Ethernet.'],
        ['Transport LSP ping', 'The selected transport FEC’s tested label/data-plane behavior.', 'AC state, PW label/type/CW, VPLS MAC/flooding and CE delivery.'],
        ['VCCV PW ping / qualified BFD', 'The tested PW connectivity/control channel between PW endpoints.', 'Full AC-to-AC service, access VLAN adaptation, CE ARP/ND and large customer frames.'],
        ['Customer ARP/ND and sourced ping', 'The tested customer Ethernet/IP exchange and return path.', 'Every MAC, packet size, BUM class, control protocol, protection event or isolation boundary.'],
        ['Supported Ethernet service OAM', 'The deliberately provisioned maintenance association/endpoints and test scope.', 'Other services or paths outside that OAM maintenance level/domain.'],
      ] },
      { kind: 'cli', title: 'CE1 · service-specific probes and neighbor evidence', os: xe, code: 'show ip arp\nshow ipv6 neighbors\nping 192.0.2.2 source GigabitEthernet1.100\nping ipv6 2001:db8:100::2 source GigabitEthernet1.100\nping 198.51.100.2 source GigabitEthernet1.200\nping ipv6 2001:db8:200::2 source GigabitEthernet1.200\nping 198.51.100.3 source GigabitEthernet1.200\nping ipv6 2001:db8:200::3 source GigabitEthernet1.200', note: 'Use each service subinterface’s address as source; it has a same-subnet return path over that Ethernet service. Reverse the tests and include CE2↔CE3 for all three VPLS pairs. PE service interfaces have no customer IP, so a PE-originated customer ping is not a substitute for this endpoint test.' },
      { kind: 'list', items: [
        'Capture the exact platform/release, forwarding location, test source, VLAN/AC, peer/PW-ID, local/remote labels and operational parameters.',
        'Use frame captures/counters to verify tag removal and restoration. MAC identity alone can be reused across subinterfaces and must retain service context.',
        'Check separation at the Ethernet service boundary. The CE routers can route their connected .100 and .200 subnets; a cross-subnet IP success can be legitimate CE routing, not an L2VPN leak.',
        'Checkpoint: explain why a VCCV success plus no CE ARP reply directs you to AC/tagging/CE and flood delivery rather than proving that every service layer is healthy.',
      ] },
    ],
  },
  {
    id: 'troubleshoot', title: 'Troubleshoot · separate attachment, signaling, transport and bridging', minutes: 50,
    summary: 'Use decisive checks for PW mismatches, one-way service, missing mesh edges, stale MACs, loops, CW and frame-size failures.',
    dimension: 'Troubleshooting Readiness',
    blocks: [
      { kind: 'table', headers: ['Symptom', 'Discriminating check', 'Interpretation'], rows: [
        ['Core IP works; no remote PW mapping.', 'Targeted discovery/session endpoints and exact peer/FEC/PW-ID/type.', 'Core link LDP does not create every remote service association.'],
        ['PW appears down despite an operational targeted session.', 'Local/remote PW type, signaled MTU, status, AC state and association.', 'A shared TCP session is earlier than a valid individual service.'],
        ['PW up; customer traffic never increments the AC.', 'CE tag/source and PE encapsulation match/counters.', 'Classification may be wrong before any PW forwarding occurs.'],
        ['PW up; traffic fails only in one direction.', 'The sender’s remote label versus receiver’s local label, both rewrites and AC counters.', 'Directional bindings and access adaptation are independent.'],
        ['VPLS CE1↔CE3 fails; each can reach CE2.', 'All three mesh edges and MAC destination placement.', 'A missing PE1↔PE3 PW cannot be relayed through a mesh PW at PE2.'],
        ['Known unicast works but discovery fails.', 'ARP/ND/BUM replication, eligible flood ports and multicast/storm policy.', 'A learned unicast path does not prove flooding.'],
        ['MACs move rapidly or duplicate traffic appears.', 'Source-MAC moves across AC/PW, active attachment states and customer topology.', 'Investigate loops/dual-active attachment or real endpoint mobility; do not equate every move with one fault.'],
        ['Only large frames fail.', 'Normalized customer frame plus CW/actual stack against each MTU.', 'PW parameter compatibility and data-plane size budget can fail independently.'],
      ] },
      { kind: 'advanced', title: 'Control word: interoperability and packet ordering', blocks: [
        { kind: 'text', text: 'The four-byte Ethernet PW CW begins with a non-IP discriminator. Without it, an MPLS router inspecting below the label stack can mistake customer MAC bytes beginning with nibble 4 or 6 for IPv4/IPv6 and choose different ECMP paths using inappropriate header fields. RFC 8469 recommends CW in all but exceptional cases. This is about correct payload interpretation and ordering, not a new IP header or a guarantee that every packet follows one physical link.' },
        { kind: 'text', text: 'RFC 8077’s optional-CW negotiation can settle on no CW when one endpoint does not prefer/support it. Therefore one-sided CW preference does not universally mean the PW stays down. Read both endpoints’ operational result and any platform enforcement policy. An operational PW with no CW can still require a design correction; a packet capture and actual ECMP behavior discriminate a payload-inspection ordering problem from a signaling failure.' },
        { kind: 'text', text: 'The presence of a sequence field in the CW does not mean Ethernet sequencing, reordering or loss recovery is enabled. Check the service-specific capability/configuration. CW is not encryption, authentication or a substitute for adequate MTU; it adds four bytes to the packet budget.' },
      ] },
      { kind: 'advanced', title: 'Signaled MTU and the real encapsulation budget', blocks: [
        { kind: 'text', text: 'Compare like units. For a modeled 1500-byte customer IP packet, the post-pop Ethernet frame is 1500 + 14 = 1514 bytes before FCS. With CW 4 and two MPLS entries 8, the required provider MPLS payload is 1526 bytes. Adding the provider’s 14-byte Ethernet header yields a 1540-byte provider frame before FCS or provider VLAN tags. The removed service VLAN is not counted again inside this raw-mode payload.' },
        { kind: 'table', headers: ['Boundary', 'Modeled size or rule'], rows: [
          ['CE-facing tagged frame', '1500 IP + 14 Ethernet + 4 service VLAN = 1518 bytes before FCS. Ingress service rewrite removes that one tag.'],
          ['Baseline core MPLS payload', '1514 normalized customer frame + 4 CW + 8 labels = 1526 bytes.'],
          ['XR core physical MTU 1600', 'Under the cited untagged XR accounting, subtract 14 Ethernet bytes to obtain 1586 payload bytes, enough for 1526. Read the actual image/card ceilings.'],
          ['PW signaled MTU', 'Read local/remote service MTU after interface/rewrite accounting. Do not set it equal to 1526, 1540 or 1600 simply because those appear in the frame budget.'],
          ['Extra tags/labels', 'Add every tag that remains inside the PW, provider outer tags and any entropy/repair/extra transport labels at their actual layer.'],
        ] },
        { kind: 'text', text: 'The baseline access parent MTU is 1514; XR’s subinterface/tag accounting and pop-1 adaptation must be read through the cited EVC/MTU model and confirmed by actual show output. A local/remote PW MTU mismatch can stop a service even when every core link is large enough. Conversely, matching signaled service MTUs do not detect an undersized transit link. Do not hide a mismatch with an ignore command before proving that the service contract and packet sizes are actually compatible.' },
        { kind: 'text', text: 'A bridged Ethernet frame cannot rely on an IP router in the provider to fragment its inner IP packet. The service PEs/P routers are not customer IP hops in this baseline. Test the customer IP size or captured frame size explicitly; a CLI ping size parameter may count different headers on different systems. Preserve the distinction between a protocol-defined frame limit, a signaled service parameter and measured data-plane drops.' },
      ] },
      { kind: 'advanced', title: 'MAC learning, aging, withdrawal and loops', blocks: [
        { kind: 'text', text: 'VPLS learns a source MAC against the ingress AC or PW and looks up destination MACs within the bridge domain. Inactivity aging removes eligible dynamic entries; the next unknown destination is flooded and can be relearned. Aging is not a route withdrawal and does not turn a PW down. A stale known-unicast entry can blackhole traffic while unrelated broadcasts still reach the service. Compare the MAC’s observed attachment, actual source frames, last activity and qualified withdrawal/flush behavior.' },
        { kind: 'text', text: 'PW/network split horizon controls forwarding between the mesh PWs. It does not prevent a CE from looping frames through access links, ensure only one redundant AC is active or replace an agreed customer/provider STP and multihoming design. A new redundant connection can create a loop without any IP routing loop or MPLS TTL problem. Ethernet customer frames have no IP-like hop limit to make arbitrary bridged loops harmless.' },
        { kind: 'text', text: 'After moving a MAC or switching an active attachment, stale forwarding state may need qualified MAC withdrawal/flush and relearning. Do not clear every MAC table repeatedly while a loop remains present. Investigate customer cabling, dual-active state, PW roles and split-horizon groups; verify that any suppression or storm control action restores the intended service instead of merely masking its symptoms.' },
      ] },
      { kind: 'advanced', title: 'Failure scope and independent control/data planes', blocks: [
        { kind: 'text', text: 'A missing transport mapping can leave native PE IP reachability available while breaking PW packets: exposing an egress-only PW label at an intermediate P router is not valid service forwarding. An operational targeted session does not restore that transport LSP. Conversely, a targeted session fault can remove several PW services to one peer while link LDP still transports other services normally.' },
        { kind: 'text', text: 'The lab has no physical alternate core path. Failure of PE1–P1 affects both services attached to PE1; failure of P2–PE3 affects the PE3 VPLS attachment but not VPWS100’s PE1↔PE2 transport. Removing a single VPLS PW is a different service-topology failure from either physical fault. Name the expected affected and unaffected flows for each experiment, then verify all pairs after restoration.' },
        { kind: 'list', items: [
          'Collect the first divergent counter/state before a session reset destroys evidence.',
          'Repair one scope at a time: AC tag/rewrite, service association, PW parameter, transport or bridge policy.',
          'Verify local and remote status, both directions, large/small frames and relevant BUM/unicast behavior after the correction.',
        ] },
      ] },
    ],
  },
  {
    id: 'apply', title: 'Apply · choose the service, topology and operational controls', minutes: 55,
    summary: 'Design VPWS/VPLS service contracts, hierarchical forwarding, protected attachments, scaling and a controlled EVPN or transport migration.',
    dimension: 'Architecture Readiness',
    blocks: [
      { kind: 'text', text: 'Begin with the required Ethernet behavior: two sites or multipoint LAN, permitted MAC count and BUM rate, frame size, tag contract, control protocols, ordering, protection target and failure demarcation. Then choose signaling and forwarding mechanisms. A requirement for application access control or customer IP routing may favor an L3 service or an attached policy device rather than stretching the Ethernet failure domain.' },
      { kind: 'table', headers: ['Choice', 'Control/forwarding model', 'Operational fit and cost'], rows: [
        ['Classic LDP VPWS', 'Provisioned peer/PW association; point-to-point AC/PW forwarding.', 'A bounded wire service with little need for provider customer-MAC learning; keep both directional bindings and AC contracts consistent.'],
        ['LDP VPLS', 'PW signaling plus data-plane source-MAC learning, mesh split horizon and BUM replication.', 'A multipoint LAN service; mesh, MAC state, flooding and loop scope grow with participation.'],
        ['BGP VPLS', 'BGP auto-discovery and signaling under RFC 4761; different label signaling from RFC 4762.', 'Automated membership/signaling with its own RD/RT/label-block and policy design. It is not simply the same LDP PW with a BGP session added.'],
        ['EVPN-MPLS', 'BGP EVPN routes distribute MAC and service/segment reachability; MPLS carries the service.', 'Adds explicit mobility/multihoming mechanisms and control-plane policy; BUM, underlay transport and hardware scale still require design.'],
        ['EVPN-VXLAN', 'BGP EVPN control plane with IP/UDP VXLAN encapsulation and VNI service context.', 'Common overlay model on qualified platforms. VXLAN VNI is not an MPLS PW label; MTU, ECMP and gateway behavior differ.'],
        ['EVPN VPWS', 'EVPN advertises the service attachment and label binding without requiring classic VPLS MAC learning for a wire.', 'A point-to-point Ethernet service with EVPN signaling/multihoming features under a qualified platform design.'],
      ] },
      { kind: 'advanced', title: 'Discovery, signaling and forwarding are separate decisions', blocks: [
        { kind: 'text', text: 'Auto-discovery answers which remote PEs participate in the service. Signaling exchanges the labels and service parameters. Forwarding determines where a received customer frame goes. RFC 6074 permits designs such as BGP auto-discovery with LDP PW signaling; that does not make the PW label exchange BGP-signaled. RFC 4761 uses BGP for VPLS discovery and signaling; RFC 4762 describes LDP-signaled VPLS. Specify the exact combination and interoperability boundary.' },
        { kind: 'text', text: 'BGP VPLS uses a VPN identity and membership policy together with a VPLS edge identifier and advertised label blocks, including a base, offset and size. A receiving PE derives the appropriate label for its edge identifier from the advertised block; it is not simply exchanging the lab’s manually provisioned PW-ID 200. BGP VPLS membership/signaling also does not imply EVPN-style advertisement of every learned customer MAC. Treat the two control planes and their label models separately.' },
        { kind: 'text', text: 'The baseline is manually provisioned LDP VPLS and has no BGP dependency. Migrating it to EVPN changes membership/signaling, MAC distribution and possibly multihoming behavior, even if the MPLS core remains. A transport-only migration from LDP to SR-MPLS can preserve Ethernet service signaling, but targeted LDP may still be required for classic PWs. Removing LDP globally without an inventory of both roles can strand otherwise healthy services.' },
      ] },
      { kind: 'advanced', title: 'Full mesh, H-VPLS and AC split horizon', blocks: [
        { kind: 'text', text: 'A full mesh of N VPLS PEs requires N(N−1)/2 pairwise PWs for that service and two directional label bindings per pair. Three PEs here require three PWs; four would require six. The underlay can share transport links, but ordinary mesh-PW split horizon still prevents relaying a received PW frame across another mesh PW. BUM replication and aggregate traffic rates must be planned independently from the number of IP paths.' },
        { kind: 'text', text: 'Hierarchical VPLS (H-VPLS) separates spoke/access PWs from core mesh PWs. A qualified spoke attachment can forward into the hub’s core mesh and receive from it because it has an access role, not the ordinary mesh-to-mesh role. On XR the bridge-domain versus VFI placement and explicit split-horizon configuration determine these distinctions. Making every PW a mesh PW can block intended spoke transit; disabling all split horizon can instead introduce loops.' },
        { kind: 'text', text: 'XR AC split horizon can group selected ACs/access PWs so frames received on one member are not sent to another member of that AC group. This is separate from the VFI network-PW split-horizon rule and must match the required access isolation. It can deliberately block two local access customers from communicating while allowing each to the core. Read the exact release’s supported group count and restrictions rather than generalizing arbitrary numbered groups across platforms.' },
      ] },
      { kind: 'advanced', title: 'Redundancy, dual homing and convergence', blocks: [
        { kind: 'text', text: 'PW redundancy selects an active versus standby service path under the supported status/detection policy. It does not automatically create diverse physical transport, coordinate every remote AC or make two independent bridged attachments safe to forward simultaneously. Distinguish local AC failure, remote AC failure, PW data-plane failure, PE failure and shared underlay failure. Test which event is detected and which forwarding state changes.' },
        { kind: 'text', text: 'A service can need active/standby status signaling, qualified attachment coordination, MAC withdrawal/relearning and customer link-state behavior. BFD over VCCV detects a defined PW connectivity fault; fast detection is only one part of recovery. The backup must exist, be eligible and be programmed. Shared core links, a single CE port or a single PE can remain common failure points despite two configured PWs.' },
        { kind: 'text', text: 'For EVPN multihoming, Ethernet segment identity, designated-forwarder behavior and split-horizon/aliasing rules are explicit service mechanisms; they are not imported by adding a second classic LDP PW. For an STP-based access design, agree on BPDU handling and root/failure boundaries. Never assume that a PE “has STP” or a PW “is split horizon” proves arbitrary customer loop prevention.' },
      ] },
      { kind: 'advanced', title: 'Scale, storm control and security', blocks: [
        { kind: 'table', headers: ['Resource or risk', 'Engineering control and evidence'], rows: [
          ['MAC state and moves', 'Per-service and aggregate table capacity, aging/withdrawal behavior, move rates and justified MAC limits. A limit’s flood/no-flood/shutdown action can itself alter service.'],
          ['BUM replication', 'Measure broadcast, unknown-unicast and multicast rates at each replication point; qualify storm-control classes, units and hardware behavior.'],
          ['PW/session scale', 'Count per-service pairwise PWs separately from shared targeted sessions, labels and transport FECs.'],
          ['Control-plane trust', 'Limit targeted-LDP peers and reachability, protect TCP/UDP control traffic and apply supported authentication/resource controls.'],
          ['Customer attacks/mistakes', 'MAC spoofing, loops, broadcast storms, VLAN leakage and oversized frames need service demarcation, filters and monitoring.'],
          ['QoS contract', 'Define trusted customer PCP/DSCP, ingress classification/policing and MPLS TC mapping on the exact platform. Removing a service VLAN does not define how its marking is preserved or rewritten.'],
          ['Confidentiality', 'Ethernet isolation under provider policy is not encryption; add an appropriate cryptographic service if required.'],
        ] },
        { kind: 'text', text: 'A single large broadcast domain extends the operational impact of customer loops and address-discovery traffic. Set acceptable MAC/BUM/frame contracts and alarms before growing the service. Static MAC entries or globally disabled learning can change flooding behavior; neither is a generic scaling repair. Keep service/customer attribution in counters and telemetry so an incident can be isolated without resetting unrelated PW peers.' },
      ] },
      { kind: 'advanced', title: 'Migration and acceptance plan', blocks: [
        { kind: 'list', items: [
          'Inventory AC/VLAN rewrite, PW type, CW, signaled MTU, transport stacks, MAC/BUM behavior, control protocols and protection for each service.',
          'Choose whether the change affects only transport, service signaling, Ethernet topology or the customer routing boundary. State interoperability and temporary dual-attachment risks.',
          'Pilot a bounded service with known MAC/ARP/ND traffic and small/full-size frames; test unicast and BUM in both directions, including the intended failure.',
          'Avoid a temporary Layer 2 loop when old and new paths coexist. Coordinate active attachment and MAC-state movement before enabling both.',
          'Restore the previous AC mapping, PW/bridge membership and forwarding state for rollback, then prove packet delivery. A committed candidate alone is not service acceptance.',
        ] },
      ] },
    ],
  },
  {
    id: 'defend', title: 'Defend · teach the frame journey and justify the design', minutes: 35,
    summary: 'Demonstrate a wire, a bridge, their signaling dependencies and a controlled diagnosis using actual evidence and qualified architectural claims.',
    dimension: 'Instructor Readiness',
    blocks: [
      { kind: 'text', text: 'Begin with an Ethernet frame on CE1 and name its service. Explain local tag classification, normalization, the selected PW or MAC lookup, the two label owners, transport PHP and egress adaptation. Reverse it. Then explain the first ARP/ND exchange, not just the successful IP packet after learning. State which observations were measured on the chosen image and which remain modeled.' },
      { kind: 'table', headers: ['Challenge', 'A complete answer includes'], rows: [
        ['Why can VLAN100 use PW-ID700?', 'Local tag classification versus peer/FEC association; explicit mapping and remote agreement.'],
        ['Why are two local/remote label values shown?', 'Independent directional bindings; sender imposes the advertising receiver’s incoming PW label.'],
        ['Why can targeted LDP be up while the PW is down?', 'Shared session versus individual FEC/type/CW/MTU/status and AC readiness.'],
        ['What reaches PE2 after transport PHP?', 'P2 removes the active transport label; the egress PW label, negotiated CW and customer Ethernet remain.'],
        ['Why can IPv6 work on an IPv4-only core?', 'IPv6/ND inside customer Ethernet over MPLS; no customer IPv6 route required on P routers.'],
        ['Why does the third PE not repair a missing VPLS PW?', 'Mesh-PW split horizon and required direct service adjacency, distinct from transport reachability.'],
        ['Does every CW preference mismatch force PW-down?', 'Standard optional-CW negotiation and the observed operational result; distinguish interoperability from ordering policy.'],
        ['Why are 1500, 1514, 1526 and 1540 different?', 'Customer IP, normalized Ethernet, provider MPLS payload and provider frame boundaries under the stated tag/CW/stack assumptions.'],
        ['Does VPLS split horizon replace STP?', 'Scope of network PW versus access grouping, customer/dual-active loops and explicit protection design.'],
        ['Is BGP auto-discovery the same as BGP PW signaling?', 'Separate membership discovery, label signaling and forwarding; identify the actual RFC/design combination.'],
      ] },
      { kind: 'advanced', title: 'A teach-back demonstration with a separate instructor key', blocks: [
        { kind: 'list', items: [
          'Draw the physical OSPF/LDP tree and overlay the VPWS pair plus all three VPLS mesh edges. Mark P1/P2 as transport only.',
          'Show local/remote labels and operational parameters for PW100. Replace symbolic labels only with observed device values.',
          'Capture a tagged ingress frame, the normalized payload with CW/labels where supported and the re-tagged egress frame. Explain FCS regeneration and size accounting.',
          'Generate CE1 ARP/ND for VPLS, predict eligible replicas and inspect MAC learning at each PE that actually receives the source frame.',
          'Inject one reversible classification, PW-ID/MTU, mesh-membership or transport fault. Require two hypotheses and a discriminating check before revealing the correction.',
          'After restoration, verify the expected affected/unaffected pairs and both directions. Retain raw evidence and the exact platform/release limitation.',
        ] },
        { kind: 'text', text: 'Keep the workbook and instructor solutions separate. Do not grade a learner against a fixed dynamic label or a MAC that the PE had no opportunity to learn. Grade the relationship between incoming service context, signaled binding, programmed forwarding and the actual frame. Use the mock interview and architecture cases to test the same mechanisms under a changed requirement.' },
      ] },
      { kind: 'table', headers: ['Readiness dimension', 'Evidence to retain'], rows: [
        ['Conceptual Knowledge', 'Distinguish AC/VLAN/PW-ID/label, link/targeted LDP, wire/bridge and the forward/reverse frame walk.'],
        ['Configuration Knowledge', 'Build class, AC rewrite, xconnect and full-mesh VFI with the correct platform hierarchy.'],
        ['Lab Experience', 'Actual local/remote PW parameters, label/counter/MAC evidence and CE IPv4/IPv6 service tests.'],
        ['Troubleshooting Readiness', 'Resolve separate access, signaling, transport and bridging faults using decisive checks.'],
        ['Architecture Readiness', 'Defend mesh/H-VPLS, protection, MAC/BUM scale, protocol demarcation and migration boundaries.'],
        ['Interview Readiness', 'Answer with the mechanism, observed evidence and a qualified failure/support limit.'],
        ['Instructor Readiness', 'Teach discovery plus learned forwarding, run a controlled diagnosis and explain exactly what each test proves.'],
      ] },
      { kind: 'text', text: 'The baseline demonstrates services and their dependencies, with no physical alternate core path or validated redundancy timing. A production availability claim requires the additional topology, attachment coordination, detection/repair features and measured service behavior. Keep standards behavior, documented platform syntax, modeled expectations and device execution distinct.' },
    ],
  },
]
