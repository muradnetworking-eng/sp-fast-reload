import type { Lab, Unit } from '../../../schemas/content'

export const implement: Unit[] = [
  {
    "id": "l2vpn-implement-underlay",
    "title": "Build MPLS transport before Ethernet service",
    "summary": "Separate link-LDP transport from targeted-LDP pseudowire signaling.",
    "blocks": [
      {
        "kind": "diagram",
        "title": "Eight-router topology",
        "text": "CE1 ── PE1 ── P1 ── P2 ── PE2 ── CE2\n                       │\n                       PE3 ── CE3\nVPWS: CE1 VLAN 100 ↔ CE2 VLAN 100; PW-ID 100.\nVPLS: CE1/CE2/CE3 VLAN 200; three-PE full mesh, PW-ID 200.\nAll core links cost 10; Loopback0 cost 1; IPv4 OSPF/LDP transport.\nNo BGP, RR, VRF or customer IP routing on provider nodes."
      },
      {
        "kind": "cli",
        "title": "P2 transport stage",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "! IOS XR 7.11 ASR 9000 syntax reference; L2VPN lab.\n! Source reviewed 2026-11-27; device/emulator execution pending.\nconfigure\nrouter ospf CORE\n router-id 10.20.0.3\n area 0\n  interface Loopback0\n   passive enable\n   cost 1\n   exit\n  interface GigabitEthernet0/0/0/0\n   network point-to-point\n   cost 10\n   exit\n  interface GigabitEthernet0/0/0/1\n   network point-to-point\n   cost 10\n   exit\n  interface GigabitEthernet0/0/0/2\n   network point-to-point\n   cost 10\n   exit\n  exit\n exit\nmpls ldp\n router-id 10.20.0.3\n address-family ipv4\n  discovery transport-address 10.20.0.3\n  exit\n interface GigabitEthernet0/0/0/0\n  address-family ipv4\n   exit\n  exit\n interface GigabitEthernet0/0/0/1\n  address-family ipv4\n   exit\n  exit\n interface GigabitEthernet0/0/0/2\n  address-family ipv4\n   exit\n  exit\n exit\nmpls oam\n exit\ncommit\nend",
        "note": "Apply matching files to all five XR nodes after initial addressing.",
        "interpretation": "P2 has three OSPF/link-LDP neighbors. PE1 reaches PE2/PE3 loopbacks at metric 31; PE2 reaches PE3 at metric 21. The topology has no alternate path across P1–P2."
      },
      {
        "kind": "text",
        "text": "Link LDP establishes transport FEC mappings hop by hop. Pseudowire neighbors establish targeted LDP between remote PE loopbacks for service labels and attributes. Several PWs between the same PE pair can share a targeted session. An operational targeted session does not prove that a particular PW-ID, type, MTU or control-word state agrees."
      },
      {
        "kind": "cli",
        "title": "Transport evidence from PE1",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "show ospf neighbor\nshow route ipv4 10.20.0.4/32\nping 10.20.0.4 source 10.20.0.1\nshow mpls ldp neighbor\nping mpls ipv4 10.20.0.4/32",
        "note": "Repeat for PE3 and reverse directions.",
        "interpretation": "Ordinary IP reachability, selected label rewrite and MPLS OAM provide different evidence; collect all before configuring a service."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l2vpn-implement-attachment",
    "title": "Classify service tags and normalize Ethernet frames",
    "summary": "Bind customer subinterfaces without adding provider customer IP routing.",
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 attachment circuits",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "! IOS XR 7.11 ASR 9000 syntax reference; L2VPN lab.\n! Source reviewed 2026-11-27; device/emulator execution pending.\nconfigure\ninterface GigabitEthernet0/0/0/1.100 l2transport\n description VPWS service 100 to CE1\n encapsulation dot1q 100\n rewrite ingress tag pop 1 symmetric\n no shutdown\n exit\ninterface GigabitEthernet0/0/0/1.200 l2transport\n description VPLS service 200 to CE1\n encapsulation dot1q 200\n rewrite ingress tag pop 1 symmetric\n no shutdown\n exit\ncommit\nend",
        "note": "The physical access parent is configured with MTU 1514 in initial. Subinterfaces inherit tag-aware MTU. No customer IP address is configured on the PE.",
        "interpretation": "dot1q100/200 classify local service tags. Symmetric pop1 removes the tag on ingress and restores the locally configured tag on egress. The subinterface number is a local name, not a PW-ID."
      },
      {
        "kind": "cli",
        "title": "CE1 tagged routed endpoints",
        "os": "IOS XE 17.x — C8000V reference",
        "code": "! IOS XE 17 C8000V reference; L2VPN CE host.\n! Source reviewed 2026-11-27; device/emulator execution pending.\nenable\nconfigure terminal\ninterface GigabitEthernet1.100\n encapsulation dot1Q 100\n ip address 192.0.2.1 255.255.255.0\n ipv6 address 2001:db8:100::1/64\n no shutdown\n exit\ninterface GigabitEthernet1.200\n encapsulation dot1Q 200\n ip address 198.51.100.1 255.255.255.0\n ipv6 address 2001:db8:200::1/64\n no shutdown\n exit\nend",
        "note": "These IOS XE interfaces are ordinary routed hosts; they do not run MPLS or bridge the two VLANs.",
        "interpretation": "The IPv4/IPv6 endpoints are in each service’s shared subnet. CE routers can still route between their connected service subnets, so cross-subnet pings cannot prove provider Layer2 separation."
      },
      {
        "kind": "text",
        "text": "Validate provider separation with AC membership, VLAN classification/rewrite, xconnect/bridge-domain membership, MAC tables and captures. Do not present this CE model as end-to-end security isolation. No switch loop is created: each CE has one physical attachment with independent routed subinterfaces."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l2vpn-implement-control-word",
    "title": "Configure a common raw-Ethernet PW class",
    "summary": "Make signaling, PW type and control-word choices explicit.",
    "blocks": [
      {
        "kind": "cli",
        "title": "Shared class on every participating PE",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "configure\nl2vpn\n pw-class L2-CW\n  encapsulation mpls\n   protocol ldp\n   control-word\n   transport-mode ethernet\n   exit\n  exit\n exit\ncommit\nend",
        "note": "The supplied VPWS/VPLS stages include this class and attach it beneath every PW neighbor.",
        "interpretation": "This source-checked ASR 9000 grammar explicitly enables the control word and raw Ethernet transport. Verify actual local/remote PW type and negotiated CW enabled at both ends; configured intent is not observed state."
      },
      {
        "kind": "text",
        "text": "The four-byte control word follows the bottom MPLS label and precedes the carried Ethernet frame. It is not a label and is not a substitute for transport reachability. Consistent CW use avoids interpreting a customer destination MAC beginning with a 4/6 nibble as an IP payload during some core hashing heuristics. Sequencing is a separate capability, not an automatic promise of this class."
      },
      {
        "kind": "text",
        "text": "The static reciprocal PW definitions create the targeted-LDP service relationship; no broad accept-all targeted-Hello policy is added. Inspect actual discovery sources and session endpoints. The baseline uses manually configured LDP-signaled FEC128 PWs, not BGP discovery, BGP VPLS, EVPN or static labels."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l2vpn-implement-vpws",
    "title": "Connect two attachment circuits through VPWS",
    "summary": "Match remote PE, PW-ID and service parameters independently.",
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 VPWS stage",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "! IOS XR 7.11 ASR 9000 syntax reference; L2VPN lab.\n! Source reviewed 2026-11-27; device/emulator execution pending.\nconfigure\nl2vpn\n pw-class L2-CW\n  encapsulation mpls\n   protocol ldp\n   control-word\n   transport-mode ethernet\n   exit\n  exit\n xconnect group VPWS\n  p2p CE1-CE2\n   interface GigabitEthernet0/0/0/1.100\n   neighbor ipv4 10.20.0.4 pw-id 100\n    pw-class L2-CW\n    exit\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Apply the matching reciprocal PE2 file. The p2p interface statement remains in p2p mode; its PW neighbor has its own submode.",
        "interpretation": "Group VPWS / p2p CE1-CE2 binds only .100. Remote PE10.20.0.4 and PW-ID 100 identify this directional PW relationship. PE2 uses remote 10.20.0.1 with the same ID."
      },
      {
        "kind": "cli",
        "title": "Check both ends and the PW FEC",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "show l2vpn xconnect group VPWS xc-name CE1-CE2 detail\nshow mpls ldp discovery detail\nshow mpls ldp neighbor detail\nshow mpls ldp bindings 10.20.0.4/32 detail\nshow mpls forwarding\nping mpls pseudowire 10.20.0.4 100",
        "note": "Run on PE1; use the reverse peer address on PE2. PW OAM takes a positional ID, without the pw-id keyword.",
        "interpretation": "Read local AC state, remote PW state, type, local/remote MTU, CW, labels and status TLVs. MPLS PW OAM does not test CE VLAN classification or successful ARP/ND."
      },
      {
        "kind": "cli",
        "title": "CE1 VPWS positive checks",
        "os": "IOS XE 17.x",
        "code": "show arp\nshow ipv6 neighbors\nping 192.0.2.2 source GigabitEthernet1.100\nping ipv6 2001:db8:100::2 source GigabitEthernet1.100",
        "note": "Run reverse probes from CE2.",
        "interpretation": "Connected IP destinations require Ethernet resolution; a successful probe exercises the CE attachment and service in addition to the PW control plane."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l2vpn-implement-vpls",
    "title": "Build the three-PE VPLS full mesh",
    "summary": "Add MAC learning and replication to pseudowire transport.",
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 VPLS stage",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "! IOS XR 7.11 ASR 9000 syntax reference; L2VPN lab.\n! Source reviewed 2026-11-27; device/emulator execution pending.\nconfigure\nl2vpn\n pw-class L2-CW\n  encapsulation mpls\n   protocol ldp\n   control-word\n   transport-mode ethernet\n   exit\n  exit\n bridge group VPLS\n  bridge-domain LAN200\n   interface GigabitEthernet0/0/0/1.200\n    exit\n   vfi MESH200\n    neighbor 10.20.0.4 pw-id 200\n     pw-class L2-CW\n     exit\n    neighbor 10.20.0.5 pw-id 200\n     pw-class L2-CW\n     exit\n    exit\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Apply matching PE2 and PE3 files. Each VFI has two remote PWs; three PE pairs form the mesh.",
        "interpretation": "VPLS / LAN200 contains only the local .200 AC and VFI MESH200. The VFI PW-ID 200 is reciprocal for every PE pair. PE1–PE2 also have a separate ID 100 VPWS."
      },
      {
        "kind": "cli",
        "title": "Inspect VFI membership and actual MAC learning",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "show l2vpn bridge-domain bd-name LAN200 detail\nshow platform\nshow l2vpn forwarding bridge-domain VPLS:LAN200 mac-address detail location <actual-node>\nping mpls pseudowire 10.20.0.4 200\nping mpls pseudowire 10.20.0.5 200",
        "note": "Replace <actual-node> using the real forwarding location from show platform. Hardware/location commands depend on the image; the placeholder is not literal CLI.",
        "interpretation": "Learn source MACs on the receiving AC or PW. Received CE1 source frames populate its local AC; received CE2/CE3 source frames can populate their respective PWs. Entries depend on actual source traffic and aging, so one ping does not guarantee a fixed all-CE MAC count. VPWS does not require bridge MAC learning. A BD can be up while an individual PW or attachment is unusable."
      },
      {
        "kind": "text",
        "text": "Known unicast follows the learned destination port. Broadcast, appropriate multicast and unknown unicast replicate to eligible ports. Core VFI PWs share a split-horizon relationship: a frame received from a core PW is not sent to another core PW in the same group. The full mesh delivers ingress replication directly to each remote PE; it does not rely on PE-to-PE transit bridging."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l2vpn-implement-packet",
    "title": "Trace transport, PW label, control word and tags",
    "summary": "Explain each decapsulation boundary and label owner.",
    "blocks": [
      {
        "kind": "diagram",
        "title": "Modeled VPWS packet walk",
        "text": "MODEL — no router output or packet capture\nCE1→PE1: [customer Ethernet, service VLAN 100, IPv4/IPv6]\nPE1 removes local service tag, selects VPWS attachment.\nPE1→P1: [L_P1(PE2 Lo), W_PE2(100), CW] [customer Ethernet/IP]\nP1→P2:  [L_P2(PE2 Lo), W_PE2(100), CW] [customer Ethernet/IP]\nP2→PE2: [W_PE2(100), CW] [customer Ethernet/IP] — transport PHP\nPE2 removes PW/CW, applies local symmetric VLAN 100 rewrite, sends CE2.\nLabels are directional and locally allocated; CW is not an MPLS label."
      },
      {
        "kind": "text",
        "text": "The ingress uses the PW label advertised by the receiving PE. Return traffic uses a separately allocated directional label. P1 swaps only the outer transport label; P2 transport PHP leaves the PW label and CW. PE2 uses the PW label to select the service/attachment, removes CW as negotiated and restores its local tag. VPLS uses equivalent PW transport, then performs bridge-domain forwarding."
      },
      {
        "kind": "table",
        "headers": [
          "Term for a 1500-byte customer IP packet",
          "Bytes"
        ],
        "rows": [
          [
            "Customer Ethernet header, after service tag pop",
            "14"
          ],
          [
            "Customer IP datagram",
            "1500"
          ],
          [
            "Control word",
            "4"
          ],
          [
            "Two MPLS labels",
            "8"
          ],
          [
            "Required MPLS payload at core ingress",
            "1526"
          ],
          [
            "Provider untagged Ethernet header",
            "14"
          ],
          [
            "Provider frame excluding FCS",
            "1540"
          ],
          [
            "Available core payload with XR MTU 1600",
            "1586"
          ]
        ]
      },
      {
        "kind": "text",
        "text": "This calculation excludes customer FCS, provider FCS, preamble and interpacket gap. The service VLAN is popped; retained tags or additional labels require a revised budget. The signaled PW service MTU is a different quantity from this core frame budget."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l2vpn-implement-mtu",
    "title": "Verify the access and service MTU model",
    "summary": "Distinguish advertised compatibility from data-plane headroom.",
    "blocks": [
      {
        "kind": "text",
        "text": "All PE access parents use XR frame MTU 1514. Cisco’s EVC model adds4 for a one-tag subinterface, giving1518; after subtracting the Ethernet 14 and the popped tag 4, the modeled signaled service MTU is1500. Read actual local/remote values on the selected image. Matching service MTUs do not prove core headroom, and raising only core MTU does not repair an advertised service mismatch."
      },
      {
        "kind": "cli",
        "title": "Read effective values before testing",
        "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
        "code": "show interfaces GigabitEthernet0/0/0/1\nshow interfaces GigabitEthernet0/0/0/1.100\nshow l2vpn xconnect group VPWS xc-name CE1-CE2 detail\nshow l2vpn bridge-domain bd-name LAN200 detail",
        "note": "Run on each service endpoint.",
        "interpretation": "Compare configured parent/subinterface MTU, normalized service MTU and remote advertised value. In the isolated MTU fault PE2 .100 mtu 1418 models service 1400; no mtu restores inheritance."
      },
      {
        "kind": "text",
        "text": "Use the CE extended ping prompts to set source, datagram size and IPv4 DF when testing1500-byte IP service. Confirm actual parser options and record real results. Small pings do not establish maximum-size Ethernet transport. Device/emulator MTU enforcement and service negotiation have not been executed by the author."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l2vpn-implement-bum",
    "title": "Observe BUM, unknown unicast and split horizon safely",
    "summary": "Use forwarding evidence rather than assuming a third PE will relay traffic.",
    "blocks": [
      {
        "kind": "list",
        "items": [
          "Generate VPLS traffic on VLAN 200 and record ARP/ND, MAC learning and per-port counter changes. Fresh ARP is broadcast and IPv6 ND includes multicast; neither is proof of unknown-unicast forwarding.",
          "For a controlled unknown-unicast frame, CE1 can temporarily map unused198.51.100.254 to unicast MAC0200.0000.0254 with a supported static ARP entry. Confirm that MAC is absent from LAN200, send a few probes and capture the replicated frames; no reply is expected. Remove the entry afterward.",
          "The optional split-horizon files remove/restore only PE1’s direct VPLS PW to PE3. Observe that PE2 does not relay a PW-ingress frame to its other core PW. CE1↔CE2 and CE2↔CE3 provide controls; CE1↔CE3 cannot use PE2 as a substitute for the missing direct mesh PW.",
          "The optional translation changes only PE2/CE2’s local VPWS tag 100→110. PW-ID 100 remains unchanged and symmetric normalization preserves the service. Restore both local classifiers afterward."
        ]
      },
      {
        "kind": "text",
        "text": "These are isolated diagnostic experiments. The baseline remains a complete VPLS mesh. Interpret the expected blast radius for each fault: VPWS-specific controls affect .100; a core P1–P2 LDP fault affects PE1 services to remote PEs, while PE2↔PE3 transport stays on the P2 side."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  }
]

export const lab: Lab = {
  "setup": {
    "id": "l2vpn-lab-setup",
    "title": "Build the eight-node Ethernet service lab",
    "summary": "Create manual nodes, wiring and a known initial checkpoint.",
    "blocks": [
      {
        "kind": "text",
        "text": "Use five IOS XR MPLS-capable candidates and three IOS XE C8000V CE candidates. The source syntax baseline is ASR 9000 / IOS XR 7.11.x and IOS XE 17.x. The CML XRv 9000 L2 MPLS reference establishes a VPWS candidate; it does not establish VPLS bridge-domain data-plane support. Verify the exact image/platform capability separately. If VFI/bridge forwarding is unsupported, stop that phase and use a qualified platform. Legacy XRv is different and has separate L2 PW limitations. CML/EVE hosting does not add missing features. No tested topology import, router capture or measured execution result is supplied."
      },
      {
        "kind": "diagram",
        "title": "Physical and logical services",
        "text": "CE1 ── PE1 ── P1 ── P2 ── PE2 ── CE2\n                       │\n                       PE3 ── CE3\nVPWS: CE1 VLAN 100 ↔ CE2 VLAN 100; PW-ID 100.\nVPLS: CE1/CE2/CE3 VLAN 200; three-PE full mesh, PW-ID 200.\nAll core links cost 10; Loopback0 cost 1; IPv4 OSPF/LDP transport.\nNo BGP, RR, VRF or customer IP routing on provider nodes."
      },
      {
        "kind": "table",
        "headers": [
          "Provider node",
          "Loopback0"
        ],
        "rows": [
          [
            "PE1",
            "10.20.0.1/32"
          ],
          [
            "P1",
            "10.20.0.2/32"
          ],
          [
            "P2",
            "10.20.0.3/32"
          ],
          [
            "PE2",
            "10.20.0.4/32"
          ],
          [
            "PE3",
            "10.20.0.5/32"
          ]
        ]
      },
      {
        "kind": "table",
        "headers": [
          "Physical link",
          "Endpoint A",
          "Endpoint B"
        ],
        "rows": [
          [
            "core",
            "PE1 GigabitEthernet0/0/0/0 10.20.12.0/31",
            "P1 GigabitEthernet0/0/0/0 10.20.12.1/31"
          ],
          [
            "core",
            "P1 GigabitEthernet0/0/0/1 10.20.23.0/31",
            "P2 GigabitEthernet0/0/0/0 10.20.23.1/31"
          ],
          [
            "core",
            "P2 GigabitEthernet0/0/0/1 10.20.34.0/31",
            "PE2 GigabitEthernet0/0/0/0 10.20.34.1/31"
          ],
          [
            "core",
            "P2 GigabitEthernet0/0/0/2 10.20.35.0/31",
            "PE3 GigabitEthernet0/0/0/0 10.20.35.1/31"
          ],
          [
            "access",
            "PE1 GigabitEthernet0/0/0/1",
            "CE1 GigabitEthernet1"
          ],
          [
            "access",
            "PE2 GigabitEthernet0/0/0/1",
            "CE2 GigabitEthernet1"
          ],
          [
            "access",
            "PE3 GigabitEthernet0/0/0/1",
            "CE3 GigabitEthernet1"
          ]
        ]
      },
      {
        "kind": "table",
        "headers": [
          "Service",
          "PE / attachment",
          "CE / endpoint"
        ],
        "rows": [
          [
            "VPWS ID 100",
            "PE1 GigabitEthernet0/0/0/1.100 tag 100",
            "CE1 GigabitEthernet1.100 192.0.2.1/24 / 2001:db8:100::1/64"
          ],
          [
            "VPWS ID 100",
            "PE2 GigabitEthernet0/0/0/1.100 tag 100",
            "CE2 GigabitEthernet1.100 192.0.2.2/24 / 2001:db8:100::2/64"
          ],
          [
            "VPLS ID 200",
            "PE1 GigabitEthernet0/0/0/1.200 tag 200",
            "CE1 GigabitEthernet1.200 198.51.100.1/24 / 2001:db8:200::1/64"
          ],
          [
            "VPLS ID 200",
            "PE2 GigabitEthernet0/0/0/1.200 tag 200",
            "CE2 GigabitEthernet1.200 198.51.100.2/24 / 2001:db8:200::2/64"
          ],
          [
            "VPLS ID 200",
            "PE3 GigabitEthernet0/0/0/1.200 tag 200",
            "CE3 GigabitEthernet1.200 198.51.100.3/24 / 2001:db8:200::3/64"
          ]
        ]
      },
      {
        "kind": "list",
        "items": [
          "Apply initial files to all eight nodes. Preserve management/bootstrap configuration and console access separately.",
          "Apply stages in numeric order and verify each checkpoint. XR files enter configuration, commit and end; XE files apply as entered. Read show configuration failed after a rejected XR candidate.",
          "Take snapshots before faults. Full final files assume a clean node; additive pasting does not delete arbitrary fault or optional state.",
          "The CEs are routers with both service subnets connected on CE1/CE2. They can route between subnets. Cross-subnet pings therefore cannot establish provider Layer2 isolation; prove separation with tags, membership, MAC tables and captures."
        ]
      }
    ],
    "dimension": "Lab Experience",
    "minutes": 15
  },
  "milestones": [
    {
      "id": "l2vpn-lab-1",
      "title": "1. Establish transport reachability",
      "summary": "Prove the IGP path and LDP transport FEC.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/01-underlay to all five provider nodes.",
            "Expected OSPF/link-LDP neighbor counts PE1/P1/P2/PE2/PE3 are1/2/3/1/1 before service targeted sessions exist.",
            "Test all PE loopbacks using loopback sources. Record PE1→PE2/PE3 metric 31 and PE2→PE3 metric 21.",
            "Use MPLS echo/traceroute and bindings/CEF to validate transport separately from ordinary IP reachability."
          ]
        },
        {
          "kind": "cli",
          "title": "PE1 checks",
          "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
          "code": "show ospf neighbor\nshow mpls ldp neighbor\nshow route ipv4 10.20.0.4/32\nping 10.20.0.4 source 10.20.0.1\nping mpls ipv4 10.20.0.4/32",
          "note": "Check PE3 and reverse directions too.",
          "interpretation": "Pass requires transport prerequisites with no customer forwarding configured."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 15
    },
    {
      "id": "l2vpn-lab-2",
      "title": "2. Build attachment classification",
      "summary": "Normalize each local service tag without routing on the PE.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/02-acs to PE1/PE2/PE3 and all three CEs.",
            "Inspect each L2transport subinterface and CE dot1q interface. Confirm .100 exists only at PE1/PE2 and .200 at all three PEs.",
            "Read the parent/subinterface MTU and record the normalized service model.",
            "Explain why remote CE connectivity is not expected before binding the ACs to services."
          ]
        },
        {
          "kind": "cli",
          "title": "PE1 attachment checks",
          "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
          "code": "show running-config interface GigabitEthernet0/0/0/1\nshow running-config interface GigabitEthernet0/0/0/1.100\nshow running-config interface GigabitEthernet0/0/0/1.200\nshow interfaces GigabitEthernet0/0/0/1.100",
          "note": "Repeat on corresponding endpoints.",
          "interpretation": "Pass requires exact tag/rewrite intent, no provider customer IP, and correct physical state."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 15
    },
    {
      "id": "l2vpn-lab-3",
      "title": "3. Bring up VPWS",
      "summary": "Correlate AC, targeted session and PW attributes.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/03-vpws to PE1 and PE2.",
            "Inspect reciprocal neighbor/PW-ID 100, PW type, local/remote MTU, CW and directional labels.",
            "Distinguish targeted discovery/session evidence from the core link-LDP session.",
            "Run PW OAM and bidirectional CE1↔CE2 IPv4/IPv6 probes using .100 sources."
          ]
        },
        {
          "kind": "cli",
          "title": "PE1 service checks",
          "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
          "code": "show l2vpn xconnect group VPWS xc-name CE1-CE2 detail\nshow mpls ldp discovery detail\nshow mpls ldp neighbor detail\nshow mpls ldp bindings 10.20.0.4/32 detail\nshow mpls forwarding\nping mpls pseudowire 10.20.0.4 100",
          "note": "Use the reverse peer at PE2.",
          "interpretation": "Pass requires a consistent service and end-to-end CE result, not merely an up PW summary."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 20
    },
    {
      "id": "l2vpn-lab-4",
      "title": "4. Build VPLS full mesh",
      "summary": "Prove two PWs and one local AC at every VFI.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/04-vpls to PE1/PE2/PE3.",
            "Check LAN200 membership and two remote PW-ID 200 neighbors at each PE.",
            "Verify all three CE pairs in IPv4 and IPv6 using .200 sources.",
            "Explain why the PE1–PE2 targeted LDP session can serve both ID 100 and ID 200, while the services remain distinct."
          ]
        },
        {
          "kind": "cli",
          "title": "PE1 VPLS checks",
          "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
          "code": "show l2vpn bridge-domain bd-name LAN200 detail\nshow platform\nshow l2vpn forwarding bridge-domain VPLS:LAN200 mac-address detail location <actual-node>\nping mpls pseudowire 10.20.0.4 200\nping mpls pseudowire 10.20.0.5 200",
          "note": "Replace the actual forwarding node placeholder.",
          "interpretation": "Pass requires complete reciprocal mesh, negotiated attributes and all pair/direction probes."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 20
    },
    {
      "id": "l2vpn-lab-5",
      "title": "5. Observe learning and replication",
      "summary": "Separate source learning, known unicast, BUM and split horizon.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Generate service 200 traffic and map each CE MAC to its local AC or remote PW.",
            "Observe broadcast ARP and IPv6 multicast ND, then known-unicast forwarding after learning.",
            "Use the workbook’s scoped unused-address/static-ARP experiment or a supported generator for unknown unicast; record frame replication without expecting a reply.",
            "Capture VPLS PW ingress/egress when available. Explain why PW-ingress traffic is not sent to a different core PW in the same split-horizon group.",
            "Use optional/split-horizon apply/restore to remove the PE1–PE3 direct PW. Record expected pair-specific failure and unaffected direct pairs, then restore the full mesh."
          ]
        },
        {
          "kind": "cli",
          "title": "MAC evidence",
          "os": "IOS XR 7.11.x — ASR 9000 syntax reference",
          "code": "show l2vpn bridge-domain bd-name LAN200 detail\nshow l2vpn forwarding bridge-domain VPLS:LAN200 mac-address detail location <actual-node>",
          "note": "Forwarding location and hardware views depend on the image.",
          "interpretation": "Pass requires interpreted observations and successful cleanup of any static ARP or removed PW."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 25
    },
    {
      "id": "l2vpn-lab-6",
      "title": "6. Trace labels and validate the size budget",
      "summary": "Explain Ethernet transport across PHP and measure full-size service.",
      "blocks": [
        {
          "kind": "diagram",
          "title": "Packet model to validate",
          "text": "MODEL — no router output or packet capture\nCE1→PE1: [customer Ethernet, service VLAN 100, IPv4/IPv6]\nPE1 removes local service tag, selects VPWS attachment.\nPE1→P1: [L_P1(PE2 Lo), W_PE2(100), CW] [customer Ethernet/IP]\nP1→P2:  [L_P2(PE2 Lo), W_PE2(100), CW] [customer Ethernet/IP]\nP2→PE2: [W_PE2(100), CW] [customer Ethernet/IP] — transport PHP\nPE2 removes PW/CW, applies local symmetric VLAN 100 rewrite, sends CE2.\nLabels are directional and locally allocated; CW is not an MPLS label."
        },
        {
          "kind": "list",
          "items": [
            "Record actual directional PW and transport labels. Draw each primary link’s stack, CW, normalized Ethernet frame and egress tag restoration.",
            "Calculate1526 bytes MPLS payload and1540-byte provider frame excluding FCS for1500-byte IP with CW and two labels.",
            "Compare this with core frame1600/IP 1500 and actual local/remote PW MTUs.",
            "Run source-correct CE size tests, using interactive IPv4 DF where supported, and record measured success/errors. Do not label the model as a packet capture."
          ]
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 20
    },
    {
      "id": "l2vpn-lab-7",
      "title": "7. Translate one local VLAN tag",
      "summary": "Keep service identity independent of attachment tag numbering.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Save a healthy checkpoint. Apply optional/translation PE2 and CE2 apply files.",
            "PE2/CE2 .100 logical interfaces now classify/use local VLAN 110; PE1 still uses VLAN 100 and PW-ID remains100.",
            "Verify normalized Ethernet transport, negotiated PW parameters and both CE IPv4/IPv6 service probes.",
            "Restore both files and prove VLAN 100 baseline and VPLS200 remain correct."
          ]
        },
        {
          "kind": "text",
          "text": "Do not change PW-ID to 110 merely to match the new local tag. A tag mismatch on only one side of the local wire is a different classification fault."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 15
    },
    {
      "id": "l2vpn-lab-8",
      "title": "8. Diagnose scoped faults and restore the reference",
      "summary": "Locate the failed dependency before changing configuration.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "The instructor selects one paired control: PE2 wrong PW-ID, PE2 .100 tag mismatch, PE2 .100 shutdown, PE2 .100 MTU mismatch or P1 core-LDP removal.",
            "State the affected service, PE pair, traffic direction and expected healthy controls.",
            "Use physical/AC state, classification, targeted session, PW attributes, transport and data-plane evidence to choose the smallest correction.",
            "After restoration verify both VPWS AFs and every VPLS CE pair/AF/direction, plus full mesh, CW and MTUs.",
            "Submit actual image/release, outputs/captures, label/tag diagrams, scope reasoning and emulator limitations."
          ]
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 25
    }
  ],
  "solutions": {
    "id": "l2vpn-lab-solutions",
    "title": "Instructor controls and expected reasoning",
    "summary": "Reveal after the learner has collected evidence.",
    "blocks": [
      {
        "kind": "text",
        "text": "The separate instructor.md contains exact injection/restore files and grading notes. Apply one isolated fault at a time. Configured intent and documentation review are distinct from actual observed device state."
      },
      {
        "kind": "table",
        "headers": [
          "Fault",
          "Expected scope and recovery"
        ],
        "rows": [
          [
            "Wrong PE2 PW-ID 101",
            "VPWS ID 100 cannot match the remote service. VPLS200 and shared targeted session can remain healthy. Restore reciprocal ID 100/class."
          ],
          [
            "PE2 local tag 101",
            "CE2 still sends100, so classification fails even if AC link and PW remain up. Restore local tag 100; do not clear all LDP."
          ],
          [
            "PE2 .100 shutdown",
            "VPWS attachment/status is down; parent/.200 VPLS can remain healthy. Restore no shutdown and inspect status propagation."
          ],
          [
            "PE2 .100 mtu 1418",
            "Modeled normalized service MTU 1400 differs from 1500. Observe actual mismatch; restore no mtu and effective inherited values."
          ],
          [
            "P1–P2 LDP removed",
            "PE1-to-remote labeled services fail or lose transport despite possible IP/targeted-session survival. PE2↔PE3 stays on P2 side. Restore core LDP and active service evidence."
          ],
          [
            "Missing PE1–PE3 VPLS PW",
            "PE2 must not relay core PW ingress to another core PW. Restore direct mesh pair and test every pair."
          ],
          [
            "VLAN translation",
            "Local PE2/CE2 tag 110 with symmetric normalization can coexist with PE1 tag 100 and unchanged PW-ID 100. Restore both local classifiers."
          ]
        ]
      },
      {
        "kind": "text",
        "text": "Full final files are clean desired state, not automatic replacement. Restore each injected setting or the saved checkpoint and verify the expected blast radius and all service acceptance checks."
      }
    ],
    "dimension": "Instructor Readiness",
    "minutes": 20
  },
  "downloads": [
    {
      "title": "Complete staged configurations ZIP",
      "path": "downloads/l2vpn/l2vpn-configs.zip"
    },
    {
      "title": "Student setup and verification workbook",
      "path": "downloads/l2vpn/README.md"
    },
    {
      "title": "Separate instructor faults and solutions",
      "path": "downloads/l2vpn/instructor.md"
    },
    {
      "title": "Topology, services and MTU model",
      "path": "downloads/l2vpn/topology.json"
    },
    {
      "title": "Public sources and review scope",
      "path": "downloads/l2vpn/sources.json"
    },
    {
      "title": "PE1 complete clean baseline",
      "path": "downloads/l2vpn/final/PE1.cfg"
    },
    {
      "title": "P1 complete clean baseline",
      "path": "downloads/l2vpn/final/P1.cfg"
    },
    {
      "title": "P2 complete clean baseline",
      "path": "downloads/l2vpn/final/P2.cfg"
    },
    {
      "title": "PE2 complete clean baseline",
      "path": "downloads/l2vpn/final/PE2.cfg"
    },
    {
      "title": "PE3 complete clean baseline",
      "path": "downloads/l2vpn/final/PE3.cfg"
    },
    {
      "title": "CE1 complete clean baseline",
      "path": "downloads/l2vpn/final/CE1.cfg"
    },
    {
      "title": "CE2 complete clean baseline",
      "path": "downloads/l2vpn/final/CE2.cfg"
    },
    {
      "title": "CE3 complete clean baseline",
      "path": "downloads/l2vpn/final/CE3.cfg"
    }
  ]
}
