import type { Lab, Unit } from '../../../schemas/content'

export const implement: Unit[] = [
  {
    "id": "mpls-implement-underlay",
    "title": "Build a routable underlay before LDP",
    "summary": "Make next-hop selection and transport reachability observable before introducing labels.",
    "blocks": [
      {
        "kind": "text",
        "text": "The primary lab uses four IOS XR nodes, OSPFv2 process CORE and area 0. Loopback0 is the stable router/LDP identity. Every loopback is advertised with cost 1; all transit interfaces use explicit point-to-point network type and symmetric costs. The selected PE1→PE2 path has transit cost 30 and OSPF /32 metric 31. No BGP, VRF, pseudowire or service label is configured."
      },
      {
        "kind": "diagram",
        "title": "Primary and alternate forwarding paths",
        "text": "PE1 --10-- P1 --10-- P2 --10-- PE2\n  \\-------40------/     P1 -------40------- PE2\n\nExact alternate links: PE1—P2 cost 40; P1—PE2 cost 40.\nBaseline: PE1 → P1 → P2 → PE2; link sum30, /32 OSPF metric 31.\nP1—P2 down: PE1 → P1 → PE2 or PE1 → P2 → PE2;\nlink sum50, /32 OSPF metric 51. All costs bidirectional."
      },
      {
        "kind": "cli",
        "title": "P1 initial addressing and MTU",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "! MPLS Foundations; IOS XR 7.11 ASR9000 syntax reference.\n! Documentation reviewed; router execution pending.\n! Initial only: IPv4 interfaces; no IGP or MPLS.\nconfigure\nhostname P1\ninterface Loopback0\n description OSPF and LDP identity\n ipv4 address 10.10.0.2/32\n no shutdown\n exit\ninterface GigabitEthernet0/0/0/0\n description P1 to PE1; OSPF cost 10\n mtu 1600\n ipv4 mtu 1500\n ipv4 address 10.10.12.1/31\n no shutdown\n exit\ninterface GigabitEthernet0/0/0/1\n description P1 to P2; OSPF cost 10\n mtu 1600\n ipv4 mtu 1500\n ipv4 address 10.10.23.0/31\n no shutdown\n exit\ninterface GigabitEthernet0/0/0/2\n description P1 to PE2; OSPF cost 40\n mtu 1600\n ipv4 mtu 1500\n ipv4 address 10.10.24.0/31\n no shutdown\n exit\ncommit\nend",
        "note": "Apply after mapping the manual topology to the image interfaces. MTU 1600 is an XR untagged Ethernet frame setting; ipv4 mtu 1500 limits the IP datagram.",
        "interpretation": "Confirm link IP connectivity and the effective interface/IP/MPLS MTUs before interpreting packet-size experiments."
      },
      {
        "kind": "cli",
        "title": "P1 OSPF stage",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "! MPLS Foundations; IOS XR 7.11 ASR9000 syntax reference.\n! Documentation reviewed; router execution pending.\n! Delta after initial: establish OSPF first.\nconfigure\nrouter ospf CORE\n router-id 10.10.0.2\n area 0\n  interface Loopback0\n   passive enable\n   cost 1\n   exit\n  interface GigabitEthernet0/0/0/0\n   network point-to-point\n   cost 10\n   exit\n  interface GigabitEthernet0/0/0/1\n   network point-to-point\n   cost 10\n   exit\n  interface GigabitEthernet0/0/0/2\n   network point-to-point\n   cost 40\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Apply the corresponding file to all four nodes. This stage has no LDP.",
        "interpretation": "OSPF FULL neighbors: PE1=2, P1=3, P2=3, PE2=2. PE1 route to 10.10.0.4/32 should select P1 at metric 31."
      },
      {
        "kind": "cli",
        "title": "Verify the selected path and chosen source",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "show ospf neighbor\nshow ospf interface GigabitEthernet0/0/0/1\nshow route ipv4 10.10.0.4/32\nping 10.10.0.4 source 10.10.0.1",
        "note": "Run the route and sourced ping on PE1; run the interface check on the appropriate endpoint.",
        "interpretation": "A successful IP ping proves IP reachability at that instant. It does not prove label imposition or MPLS forwarding."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "mpls-implement-ldp",
    "title": "Separate link discovery, identity and TCP transport",
    "summary": "Enable LDP deliberately and prove each control-plane layer.",
    "blocks": [
      {
        "kind": "text",
        "text": "Basic IPv4 LDP discovery uses link Hellos over UDP 646, normally multicast224.0.0.2. The LDP identifier includes a 32-bit LSR ID and a 16-bit label-space ID; this platform lab uses the platform-wide :0 label space. Session transport uses TCP 646 and the advertised transport address. An LSR ID is an identity; a transport address is the TCP endpoint. They are equal here by explicit design, rather than by protocol necessity."
      },
      {
        "kind": "cli",
        "title": "P1 LDP and MPLS OAM stage",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "! MPLS Foundations; IOS XR 7.11 ASR9000 syntax reference.\n! Documentation reviewed; router execution pending.\n! Delta after OSPF: explicit LDP identity/transport, interface activation, OAM.\nconfigure\nmpls ldp\n router-id 10.10.0.2\n address-family ipv4\n  discovery transport-address 10.10.0.2\n  exit\n interface GigabitEthernet0/0/0/0\n  address-family ipv4\n   exit\n  exit\n interface GigabitEthernet0/0/0/1\n  address-family ipv4\n   exit\n  exit\n interface GigabitEthernet0/0/0/2\n  address-family ipv4\n   exit\n  exit\n exit\nmpls oam\n exit\ncommit\nend",
        "note": "Apply all four node files after all loopback /32 routes are reachable. MPLS activation is under the XR LDP interface hierarchy; do not paste IOS XE interface mpls ip into XR.",
        "interpretation": "P1 discovers PE1/P2/PE2 and forms three sessions. Neighbors must reach10.10.0.2 and P1 must reach each remote transport endpoint."
      },
      {
        "kind": "cli",
        "title": "Inspect discovery and operational sessions",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "show mpls ldp discovery detail\nshow mpls ldp neighbor detail\nshow route ipv4 10.10.0.2/32\nping 10.10.0.2 source 10.10.0.1",
        "note": "Inspect discovery and neighbor fields on PE1. The source ping tests the eventual transport path.",
        "interpretation": "Discovery sources identify links. Neighbor output exposes peer LDP identifier, actual TCP endpoints, operational state and session message counters. Hello reception alone does not establish TCP or exchange label mappings."
      },
      {
        "kind": "table",
        "headers": [
          "Evidence",
          "Proves",
          "Still unproven"
        ],
        "rows": [
          [
            "Received link Hello",
            "Discovery can hear a peer on that link",
            "TCP reachability, authentication and label exchange"
          ],
          [
            "Operational LDP session",
            "TCP/LDP initialization and session exchange succeeded",
            "Selected FEC binding and programmed LFIB rewrite"
          ],
          [
            "Remote label for a FEC",
            "A peer advertised a label binding",
            "That peer is the IGP next hop and its binding was installed"
          ],
          [
            "CEF/LFIB + MPLS probe",
            "Selected rewrite and active data-plane evidence",
            "All traffic sizes, directions, services and failure states"
          ]
        ]
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "mpls-implement-forwarding",
    "title": "Correlate RIB, bindings, CEF and LFIB",
    "summary": "Read label ownership and each push, swap and pop in one direction.",
    "blocks": [
      {
        "kind": "text",
        "text": "For10.10.0.4/32, L_P1 means the label allocated locally by P1 and advertised to its upstream peers. L_P2 belongs to P2. Each incoming label is meaningful in the allocating router’s label space. PE1 uses the remote label supplied by its selected next hop P1; it does not impose its own local label merely because that number appears in the binding table. Dynamic labels are deliberately not preassigned in these files."
      },
      {
        "kind": "cli",
        "title": "Record the selected FEC on PE1, P1 and P2",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "show route ipv4 10.10.0.4/32\nshow mpls ldp bindings 10.10.0.4/32 detail\nshow mpls ldp forwarding 10.10.0.4/32 detail\nshow cef ipv4 10.10.0.4/32 detail\nshow mpls forwarding",
        "note": "Run at each router and replace symbolic labels with the actual values you observe.",
        "interpretation": "A LIB may retain mappings from peers that are not the selected next hop. The LFIB/CEF should match the route and the downstream mapping selected for that path.",
        "output": "MODEL — symbolic checkpoint; not a router capture\nFEC 10.10.0.4/32\nPE1 CEF: via 10.10.12.1, Gi0/0/0/0; impose L_P1\nP1 LFIB: incoming L_P1; swap to L_P2; via 10.10.23.1\nP2 LFIB: incoming L_P2; Pop; via 10.10.34.1\nPE2 receives IPv4 after PHP; no service label exists in this baseline."
      },
      {
        "kind": "cli",
        "title": "Inspect one real incoming label",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "show mpls forwarding labels <actual-local-label> detail",
        "note": "Replace the placeholder with the local label observed on the router being inspected. It is not literal CLI.",
        "interpretation": "Compare incoming label, outgoing rewrite, output interface, next hop and counters on the same router. Counter increases depend on actual traffic and platform statistics support."
      },
      {
        "kind": "cli",
        "title": "Validate the LDP FEC with MPLS OAM",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "ping mpls ipv4 10.10.0.4/32\ntraceroute mpls ipv4 10.10.0.4/32",
        "note": "Run on PE1 after the supplied mpls oam configuration has committed. Command options and echo support depend on the image.",
        "interpretation": "LSP ping validates the FEC/data-plane relationship, rather than only successful IP delivery. Interpret responder return codes and reverse reachability. A timeout alone does not identify the failed hop."
      },
      {
        "kind": "text",
        "text": "On a conceptual VPN extension, an outer transport label can carry an inner service label. Popping the outer label then exposes the service label; it does not automatically expose IP. The supplied baseline contains no VPN service and sends IP after its only label is removed."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 20
  },
  {
    "id": "mpls-implement-null",
    "title": "Compare PHP and explicit-null at the actual egress",
    "summary": "Change egress advertisement and observe the penultimate rewrite.",
    "blocks": [
      {
        "kind": "text",
        "text": "In the default lab, PE2 advertises implicit-null for its local loopback FEC. P2 interprets that binding as an instruction to pop; label3 is not transmitted on the wire. PE1 and P1 continue to use ordinary dynamic labels upstream. The same PE2 FEC can therefore have different rewrites at different routers."
      },
      {
        "kind": "cli",
        "title": "PE2 explicit-null stage",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "! MPLS Foundations; IOS XR 7.11 ASR9000 syntax reference.\n! Documentation reviewed; router execution pending.\n! Delta after LDP. Advertises explicit-null for eligible local FECs, not only Loopback0.\nconfigure\nmpls ldp\n address-family ipv4\n  label local advertise explicit-null\n  exit\n exit\ncommit\nend",
        "note": "This affects eligible PE2 local FECs generally unless an explicit filter narrows the scope. It is not limited to 10.10.0.4/32.",
        "interpretation": "P2’s outgoing rewrite for PE2’s IPv4 loopback should become label0 instead of Pop. P1 still swaps toward P2; PE1 still pushes the label advertised by P1."
      },
      {
        "kind": "table",
        "headers": [
          "Case",
          "P2 action toward PE2",
          "PE2 receives",
          "Meaning"
        ],
        "rows": [
          [
            "Implicit-null3 signaled",
            "Pop transport label",
            "IPv4 in this one-label lab",
            "PHP"
          ],
          [
            "IPv4 explicit-null0 signaled",
            "Swap transport label to 0",
            "Label0 over IPv4",
            "PE2 removes explicit-null and processes IPv4"
          ],
          [
            "Conceptual two-label PHP",
            "Pop outer transport only",
            "Inner service label",
            "Service processing is still required"
          ],
          [
            "Explicit-null above another label",
            "Pop explicit-null at receiver",
            "Remaining label becomes top",
            "RFC4182 allows this stack position"
          ]
        ]
      },
      {
        "kind": "text",
        "text": "Cisco’s XR LDP guide describes explicit-null as enabling ultimate-hop popping. This lab proves that supported mechanism. A regular allocated egress label with PHP disabled is a separate platform/feature option; no generic LDP “no-php” command is assumed. Reserved labels0 and2 may occur above other labels under RFC4182. If they are the final label, the indicated IP version follows."
      },
      {
        "kind": "cli",
        "title": "Restore the PHP baseline",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "! MPLS Foundations; IOS XR 7.11 ASR9000 syntax reference.\n! Documentation reviewed; router execution pending.\n! Restore ordinary implicit-null advertisement before sync/final checkpoint.\nconfigure\nmpls ldp\n address-family ipv4\n  no label local advertise explicit-null\n  exit\n exit\ncommit\nend",
        "note": "Use the restore file before later synchronization/failure measurements.",
        "interpretation": "Recheck PE2’s advertised binding, P2’s received binding and installed Pop rewrite, then rerun MPLS OAM."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "mpls-implement-sync",
    "title": "Coordinate IGP eligibility with LDP readiness",
    "summary": "Compare an up IP link with missing LDP, then add synchronization.",
    "blocks": [
      {
        "kind": "cli",
        "title": "Enable synchronization on every node",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "! MPLS Foundations; IOS XR 7.11 ASR9000 syntax reference.\n! Documentation reviewed; router execution pending.\n! Delta after restoring implicit-null; enable OSPF/LDP synchronization.\nconfigure\nrouter ospf CORE\n mpls ldp sync\n exit\ncommit\nend",
        "note": "Apply each matching node delta after a healthy stage02 baseline and after restoring PHP. XR 7.11 supports OSPF/LDP synchronization.",
        "interpretation": "Check synchronization on every transit interface before treating it as a healthy final checkpoint."
      },
      {
        "kind": "cli",
        "title": "Verify synchronization and route consequences",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "show mpls ldp ipv4 igp sync\nshow ospf interface GigabitEthernet0/0/0/1\nshow ospf database router\nshow route ipv4 10.10.0.4/32\nshow cef ipv4 10.10.0.4/32 detail",
        "note": "Run link-specific checks at P1/P2; route/CEF at PE1.",
        "interpretation": "When LDP is not ready, OSPF can advertise the link at a maximum metric while preserving the adjacency. Verify actual metric/state and alternate-route selection. Synchronization does not repair TCP, authentication or missing label mappings."
      },
      {
        "kind": "text",
        "text": "The isolated session-loss experiment keeps the LDP interface configured and breaks only the P1–P2 session. Compare stage02 with final: without sync the IGP may still choose the short link; with sync, confirm it is depreferred until LDP is ready. This IPv4-only lab can continue by unlabeled IP fallback when mappings are missing. A real VPN or pseudowire needs its service forwarding context, so success of the loopback ping is not evidence that a labeled service survived."
      },
      {
        "kind": "text",
        "text": "For the separate physical P1–P2 outage, PE1 has two equal-cost paths to PE2 after convergence: viaP1 thenPE2, and viaP2 thenPE2. Each has metric 51 including PE2’s loopback cost 1. Installed ECMP does not guarantee that one repeated ping uses both next hops; hashes and platform load sharing determine flow placement."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "mpls-implement-ttl-mtu",
    "title": "Measure TTL visibility and label headroom",
    "summary": "Use controlled experiments with explicit restore steps.",
    "blocks": [
      {
        "kind": "cli",
        "title": "Optional local TTL propagation test",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "! MPLS Foundations; IOS XR 7.11 ASR9000 syntax reference.\n! Documentation reviewed; router execution pending.\n! Optional: local router-originated traffic. Record before/after TTL.\nconfigure\nmpls ip-ttl-propagate disable local\ncommit\nend",
        "note": "Apply the matching optional file on PE1 and PE2 for router-originated probes. The XR command has a hyphen: ip-ttl-propagate.",
        "interpretation": "With default propagation, imposed label TTL follows IP TTL. When disabled, XR imposes MPLS TTL 255; label TTL still decrements in the core. Record observed IP and label TTLs and ordinary traceroute changes."
      },
      {
        "kind": "text",
        "text": "The local keyword applies to router-generated probes. The forwarded keyword applies to transit customer traffic entering the MPLS domain; this lab has no CE traffic generator, so a forwarded-only setting cannot demonstrate its effect with a locally originated PE ping. Neither form turns MPLS LSP traceroute into ordinary IP traceroute. ICMP source and return-path behavior can affect visibility. Restore both PEs afterward. ASR9000 documentation also lists a BFD multipath/line-card caveat; no BFD experiment is enabled here."
      },
      {
        "kind": "cli",
        "title": "Optional P1–P2 MTU boundary",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "! MPLS Foundations; IOS XR 7.11 ASR9000 syntax reference.\n! Documentation reviewed; router execution pending.\n! Apply BOTH P1 and P2; untagged Ethernet label budget becomes 1500. Recheck OSPF/LDP.\nconfigure\ninterface GigabitEthernet0/0/0/1\n mtu 1514\n ipv4 mtu 1500\n exit\ncommit\nend",
        "note": "Apply matching reduce files to BOTH endpoints and wait for OSPF/LDP/sync recovery. Restore both to 1600 after measurements.",
        "interpretation": "For untagged XR Ethernet,1514 includes the 14-byte Ethernet header and leaves1500 bytes for the MPLS packet including labels. A 1500-byte IP datagram with one label needs1504 bytes of MPLS budget; two labels need1508. The latter is a conceptual extension."
      },
      {
        "kind": "cli",
        "title": "Read actual MTUs before size tests",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "show interfaces GigabitEthernet0/0/0/1\nshow ipv4 interface GigabitEthernet0/0/0/1\nshow cef ipv4 10.10.0.4/32 detail\nshow mpls forwarding",
        "note": "Run on P1/P2, then inspect the selected path from PE1.",
        "interpretation": "Compare configured interface frame MTU, available IP MTU, and effective labeled forwarding MTU. A child protocol MTU cannot exceed the parent payload. A committed value alone does not prove the effective hardware limit."
      },
      {
        "kind": "text",
        "text": "Use extended IPv4 ping from PE1 to 10.10.0.4, source 10.10.0.1, with DF set. Confirm the DF option spelling using ping? on your image or the interactive prompt; size denotes the IP datagram, including its IP header. Sweep around1496 and1500 bytes in this single-label path, record success/ICMP/drop counters, and validate with a permitted link capture. Compare a direct unlabelled P1→P2 IP test. Do not assume a universal cutoff from the configured Ethernet MTU alone: actual encapsulation, fragmentation, MPLS MTU and emulation can affect results."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 20
  },
  {
    "id": "mpls-implement-xe",
    "title": "Translate the intent into IOS XE 17 syntax",
    "summary": "Keep platform configuration families separate.",
    "blocks": [
      {
        "kind": "text",
        "text": "The primary runnable topology is IOS XR. A separate four-node IOS XE reference set preserves addresses, costs and OSPF path choices for MPLS-capable router images. IOS XE 17 family documentation does not mean every switch, virtual image or license supports the same MPLS features. Confirm the selected platform, license, release and data-plane support before using the alternative."
      },
      {
        "kind": "cli",
        "title": "IOS XE P1 complete alternative",
        "os": "IOS XE 17.x — MPLS-capable router reference",
        "code": "! IOS XE17.x router-family reference. Check platform/license/MPLS feature support.\n! A separate all-XE alternative; do not paste into IOS XR.\nenable\nconfigure terminal\nhostname P1\nip cef\nmpls ip\nmpls label protocol ldp\ninterface Loopback0\n ip address 10.10.0.2 255.255.255.255\n ip ospf 1 area 0\n ip ospf cost 1\n exit\ninterface GigabitEthernet1\n description P1 to PE1; cost 10\n mtu 1586\n ip mtu 1500\n ip address 10.10.12.1 255.255.255.254\n ip ospf 1 area 0\n ip ospf network point-to-point\n ip ospf cost 10\n mpls ip\n no shutdown\n exit\ninterface GigabitEthernet2\n description P1 to P2; cost 10\n mtu 1586\n ip mtu 1500\n ip address 10.10.23.0 255.255.255.254\n ip ospf 1 area 0\n ip ospf network point-to-point\n ip ospf cost 10\n mpls ip\n no shutdown\n exit\ninterface GigabitEthernet3\n description P1 to PE2; cost 40\n mtu 1586\n ip mtu 1500\n ip address 10.10.24.0 255.255.255.254\n ip ospf 1 area 0\n ip ospf network point-to-point\n ip ospf cost 40\n mpls ip\n no shutdown\n exit\nrouter ospf 1\n router-id 10.10.0.2\n passive-interface Loopback0\n mpls ldp sync\n exit\nmpls ldp router-id Loopback0 force\nend\n! Save only after validation: copy running-config startup-config",
        "note": "This is a separate clean all-XE topology with Gi1/Gi2/Gi3, not an XR delta. An interface MTU 1586 is the IOS/XE payload counterpart to XR untagged frame MTU 1600; verify effective limits.",
        "interpretation": "The OSPF process is numeric1. MPLS requires CEF and is activated per core interface by mpls ip. The force option changes LDP router identity immediately and can reset existing sessions."
      },
      {
        "kind": "cli",
        "title": "IOS XE operational equivalents",
        "os": "IOS XE 17.x",
        "code": "show ip ospf neighbor\nshow ip route 10.10.0.4\nshow mpls interfaces\nshow mpls ldp discovery detail\nshow mpls ldp neighbor detail\nshow mpls ldp bindings 10.10.0.4 32\nshow mpls forwarding-table 10.10.0.4 32\nshow ip cef 10.10.0.4 detail\nshow mpls ldp igp sync",
        "note": "Use parser help for exact accepted prefix formatting on the chosen image.",
        "interpretation": "Read the same evidence chain: IGP next hop, remote binding, selected forwarding rewrite and active probe. XE uses show mpls forwarding-table; XR uses show mpls forwarding."
      },
      {
        "kind": "text",
        "text": "IOS XE explicit-null is global mpls ldp explicit-null; restore no mpls ldp explicit-null. XE TTL syntax is no mpls ip propagate-ttl local and the positive mpls ip propagate-ttl local to restore. These differ from XR’s label local advertise explicit-null under the LDP AF and mpls ip-ttl-propagate disable local."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  }
]

export const lab: Lab = {
  "setup": {
    "id": "mpls-lab-setup",
    "title": "Build the four-node forwarding laboratory",
    "summary": "Create the topology manually and capture a known initial checkpoint.",
    "blocks": [
      {
        "kind": "text",
        "text": "Use four MPLS-capable IOS XR nodes named PE1, P1, P2 and PE2. The CLI baseline is Cisco ASR9000 IOS XR 7.11.x documentation; XRv9000 in CML/EVE is a candidate that must be checked on the actual licensed image. This material has undergone documentation review only. No router execution, packet capture, emulator import or measured convergence is claimed."
      },
      {
        "kind": "diagram",
        "title": "OSPF/LDP topology",
        "text": "PE1 --10-- P1 --10-- P2 --10-- PE2\n  \\-------40------/     P1 -------40------- PE2\n\nExact alternate links: PE1—P2 cost 40; P1—PE2 cost 40.\nBaseline: PE1 → P1 → P2 → PE2; link sum30, /32 OSPF metric 31.\nP1—P2 down: PE1 → P1 → PE2 or PE1 → P2 → PE2;\nlink sum50, /32 OSPF metric 51. All costs bidirectional."
      },
      {
        "kind": "table",
        "headers": [
          "Node",
          "Loopback0 / LDP identity / transport",
          "Core ports"
        ],
        "rows": [
          [
            "PE1",
            "10.10.0.1/32",
            "GigabitEthernet0/0/0/0, GigabitEthernet0/0/0/1"
          ],
          [
            "P1",
            "10.10.0.2/32",
            "GigabitEthernet0/0/0/0, GigabitEthernet0/0/0/1, GigabitEthernet0/0/0/2"
          ],
          [
            "P2",
            "10.10.0.3/32",
            "GigabitEthernet0/0/0/0, GigabitEthernet0/0/0/1, GigabitEthernet0/0/0/2"
          ],
          [
            "PE2",
            "10.10.0.4/32",
            "GigabitEthernet0/0/0/0, GigabitEthernet0/0/0/1"
          ]
        ]
      },
      {
        "kind": "table",
        "headers": [
          "Link",
          "Endpoint A",
          "Endpoint B",
          "OSPF cost"
        ],
        "rows": [
          [
            "PE1—P1",
            "GigabitEthernet0/0/0/0 10.10.12.0/31",
            "GigabitEthernet0/0/0/0 10.10.12.1/31",
            "10"
          ],
          [
            "PE1—P2",
            "GigabitEthernet0/0/0/1 10.10.13.0/31",
            "GigabitEthernet0/0/0/0 10.10.13.1/31",
            "40"
          ],
          [
            "P1—P2",
            "GigabitEthernet0/0/0/1 10.10.23.0/31",
            "GigabitEthernet0/0/0/1 10.10.23.1/31",
            "10"
          ],
          [
            "P1—PE2",
            "GigabitEthernet0/0/0/2 10.10.24.0/31",
            "GigabitEthernet0/0/0/0 10.10.24.1/31",
            "40"
          ],
          [
            "P2—PE2",
            "GigabitEthernet0/0/0/2 10.10.34.0/31",
            "GigabitEthernet0/0/0/1 10.10.34.1/31",
            "10"
          ]
        ]
      },
      {
        "kind": "list",
        "items": [
          "In CML, create four available XRv9000 nodes; in EVE-NG use supported templates for your licensed XR images. Apply the vendor resource recommendations. No pretested .yaml/.unl import is supplied.",
          "Map all five data links exactly. Preserve management/bootstrap settings outside these files; verify real port names and MPLS/OSPF/OAM support.",
          "Extract the ZIP and read README.md. Apply initial files to each router from EXEC. Every XR file enters configuration and ends with commit/end. Inspect show configuration failed if a commit is rejected.",
          "Use only the main XR files for this run. ios-xe-reference is a separate alternative. Fault files are instructor controls and are not part of initial/final.",
          "Take an initial snapshot and record release, image, port mapping and verification limitations. Save actual output in your own worksheet; supplied outputs are interpreted expectations."
        ]
      }
    ],
    "dimension": "Lab Experience",
    "minutes": 15
  },
  "milestones": [
    {
      "id": "mpls-lab-1",
      "title": "1. Establish OSPF and IP reachability",
      "summary": "Prove the path independently of MPLS.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/01-ospf on all four nodes.",
            "Verify expected FULL adjacency counts2/3/3/2. Test direct links, then all four loopbacks using a loopback source.",
            "Record PE1’s next hop, output interface, administrative distance and metric for10.10.0.4/32. Explain why link sum30 yields route metric 31.",
            "Explain why a successful ping at this stage is possible without LDP."
          ]
        },
        {
          "kind": "cli",
          "title": "Student checks",
          "os": "IOS XR 7.11.x — ASR 9000 reference",
          "code": "show ospf neighbor\nshow route ipv4 10.10.0.4/32\nping 10.10.0.4 source 10.10.0.1",
          "note": "Run destination checks on PE1 and reverse-direction checks on PE2.",
          "interpretation": "Pass when all link adjacencies and sourced loopback probes work and the metric is explained."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 15
    },
    {
      "id": "mpls-lab-2",
      "title": "2. Establish discovery, TCP and bindings",
      "summary": "Prove LDP control-plane layers without conflating them.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/02-ldp to all four nodes.",
            "Record each LDP identifier, Hello discovery source, advertised transport address and actual TCP endpoints.",
            "Count operational sessions per router. Correlate UDP discovery with TCP transport and label mapping exchange.",
            "For PE2’s loopback, record local and remote bindings on PE1/P1/P2. Identify which remote label belongs to the IGP next hop."
          ]
        },
        {
          "kind": "cli",
          "title": "Control-plane checks",
          "os": "IOS XR 7.11.x — ASR 9000 reference",
          "code": "show mpls ldp discovery detail\nshow mpls ldp neighbor detail\nshow mpls ldp bindings 10.10.0.4/32 detail",
          "note": "Use observed dynamic label values in your worksheet.",
          "interpretation": "Pass requires operational sessions and a selected downstream binding for the FEC, plus an explanation of label ownership."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 15
    },
    {
      "id": "mpls-lab-3",
      "title": "3. Trace push, swap and PHP",
      "summary": "Join the selected route to each data-plane rewrite.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Read CEF and MPLS forwarding at PE1/P1/P2 for10.10.0.4/32.",
            "Draw the packet on all three links of the primary path; record label owner, label value, bottom-of-stack and final payload type.",
            "Run MPLS ping and traceroute from PE1. Compare with ordinary IP ping/traceroute.",
            "If supported, capture the three primary links to validate your diagram. A supplied expectation is not a packet capture."
          ]
        },
        {
          "kind": "cli",
          "title": "Forwarding checks",
          "os": "IOS XR 7.11.x — ASR 9000 reference",
          "code": "show route ipv4 10.10.0.4/32\nshow mpls ldp bindings 10.10.0.4/32 detail\nshow mpls ldp forwarding 10.10.0.4/32 detail\nshow cef ipv4 10.10.0.4/32 detail\nshow mpls forwarding\nping mpls ipv4 10.10.0.4/32\ntraceroute mpls ipv4 10.10.0.4/32",
          "note": "MPLS OAM is enabled by stage02.",
          "interpretation": "Pass requires a consistent push/swap/pop chain and correct handling of implicit-null3."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 20
    },
    {
      "id": "mpls-lab-4",
      "title": "4. Move disposition to PE2 with explicit-null",
      "summary": "Change one egress advertisement and observe where processing changes.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Save the healthy PHP checkpoint. Apply stages/03-explicit-null/PE2-apply.cfg on PE2.",
            "Observe PE2’s local advertisement, P2’s received label and P2’s LFIB rewrite. Compare the upstream P1 rewrite.",
            "Capture or explain the P2→PE2 packet: label0, not label3. State how this differs with an inner service label.",
            "Explain which other PE2 local FECs may be affected. Restore PHP using the supplied restore file and verify the original state."
          ]
        },
        {
          "kind": "cli",
          "title": "Compare the same FEC",
          "os": "IOS XR 7.11.x — ASR 9000 reference",
          "code": "show mpls ldp bindings 10.10.0.4/32 detail\nshow mpls ldp forwarding 10.10.0.4/32 detail\nshow mpls forwarding\nping mpls ipv4 10.10.0.4/32",
          "note": "Inspect PE2 advertisement and P2 forwarding; run the probe on PE1.",
          "interpretation": "Pass requires evidence of outgoing0 during the experiment and Pop after restoration."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 15
    },
    {
      "id": "mpls-lab-5",
      "title": "5. Observe failure and synchronization",
      "summary": "Distinguish an IP link failure from missing LDP readiness.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "From the healthy stage02 PHP checkpoint, ask the instructor to inject a P1–P2 LDP session fault while preserving the IP adjacency. Collect OSPF, discovery, session, binding and CEF evidence; explain any successful IP fallback.",
            "Restore the session and apply stages/04-sync on every node. Confirm healthy synchronization state. Repeat the isolated session fault and compare advertised metrics and selected paths.",
            "Restore LDP. Then take P1–P2 physically down, predict PE1’s next hops, and verify ECMP metric 51.",
            "Restore the link and prove OSPF, LDP, synchronization, LFIB and MPLS OAM have returned to the primary checkpoint."
          ]
        },
        {
          "kind": "cli",
          "title": "Failure evidence",
          "os": "IOS XR 7.11.x — ASR 9000 reference",
          "code": "show mpls ldp discovery detail\nshow mpls ldp neighbor detail\nshow mpls ldp ipv4 igp sync\nshow ospf interface GigabitEthernet0/0/0/1\nshow route ipv4 10.10.0.4/32\nshow cef ipv4 10.10.0.4/32 detail",
          "note": "Use timestamps. A physical failure and session-only failure have different control-plane evidence.",
          "interpretation": "Pass requires a causal explanation of each transition. Record measured times only from your own run."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 25
    },
    {
      "id": "mpls-lab-6",
      "title": "6. Measure TTL and MTU boundaries",
      "summary": "Test one controlled variable at a time and restore both ends.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Start from the healthy final checkpoint and record ordinary traceroute plus IP/MPLS TTL observations.",
            "Apply optional/ttl disable-local files to PE1 and PE2. Repeat router-originated probes, explain the local versus forwarded scope, and restore both.",
            "Record interface, IP and labeled forwarding MTUs. Apply optional/mtu reduce files to both P1 and P2; wait for adjacency recovery.",
            "Use extended ping with DF and source 10.10.0.1 to test PE2 with IP datagram sizes around1496 and1500. Capture the packet or inspect counters/ICMP if possible. Compare direct unlabelled link traffic.",
            "Restore both MTUs to 1600. Retest the same sizes, OSPF/LDP sync and MPLS OAM. Explain the 4-byte single-label and8-byte two-label overhead without claiming the latter was configured."
          ]
        },
        {
          "kind": "cli",
          "title": "Read the effective limits",
          "os": "IOS XR 7.11.x — ASR 9000 reference",
          "code": "show interfaces GigabitEthernet0/0/0/1\nshow ipv4 interface GigabitEthernet0/0/0/1\nshow cef ipv4 10.10.0.4/32 detail\nshow mpls forwarding",
          "note": "Use the interactive ping DF prompt or parser-supported option on your exact image.",
          "interpretation": "Pass requires a size/DF/result table, correct MTU accounting and successful restoration, rather than an assumed universal cutoff."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 25
    },
    {
      "id": "mpls-lab-7",
      "title": "7. Diagnose blind faults and defend the result",
      "summary": "Submit evidence that distinguishes protocol layers.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "The instructor selects a discovery, transport, authentication, null-label, TTL or MTU fault from the separate controls.",
            "Before changing configuration, state the symptom, two plausible causes and the next discriminating check.",
            "Identify the first broken layer and make the smallest correction. Prove both directions and the selected labeled path.",
            "Deliver a one-page run sheet: release/image, topology, actual labels, push/swap/pop diagram, failure comparison, MTU/TTL measurements, restore evidence and known emulator limitations.",
            "Optional: rebuild using the separate IOS XE files and compare the configuration hierarchy. Do not mix configuration families in one candidate."
          ]
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 25
    }
  ],
  "solutions": {
    "id": "mpls-lab-solutions",
    "title": "Instructor controls and expected reasoning",
    "summary": "Reveal only after the learner has collected evidence.",
    "blocks": [
      {
        "kind": "text",
        "text": "The separate instructor.md contains exact injection, restoration and grading notes. Apply one isolated fault at a time in the manual lab. The fault directory is excluded from the baseline; do not paste it as a configuration stage. All outcomes below are model expectations, not captured execution."
      },
      {
        "kind": "table",
        "headers": [
          "Exercise",
          "Expected reasoning and recovery"
        ],
        "rows": [
          [
            "OSPF baseline",
            "PE1 selects P1 then P2 to PE2; installed metric 31 includes PE2 Loopback0 cost 1. All loopbacks are reachable."
          ],
          [
            "LDP baseline",
            "Sessions2/3/3/2. Stable IDs/transport use Loopback0. P1 and P2 labels differ by local ownership; non-selected mappings may remain in the LIB."
          ],
          [
            "PHP/explicit-null",
            "P2 Pop for PE2 implicit-null; with explicit-null P2 sends0 to PE2. Label3 never appears on wire. Restore advertisement on PE2 and verify P2 Pop."
          ],
          [
            "Physical P1–P2 outage",
            "PE1 next hops P1 and P2, each metric 51; hashes determine traffic sharing. Restore link and wait for sync."
          ],
          [
            "Transport fault",
            "P1’s unadvertised 192.0.2.2 transport is unreachable although its LDP identifier remains10.10.0.2:0. Restore explicit 10.10.0.2 and remove Loopback99."
          ],
          [
            "Authentication versus sync",
            "An LDP session can be down with OSPF FULL and discovery present. Keep LDP configured, remove the injected password mismatch, reset only that session if needed, then verify sync."
          ],
          [
            "MTU/TTL",
            "Interpret the configured layer, effective budget and probe class. Restore both endpoint settings and verify large labeled traffic as well as small IP probes."
          ]
        ]
      },
      {
        "kind": "cli",
        "title": "Instructor recovery evidence",
        "os": "IOS XR 7.11.x — ASR 9000 reference",
        "code": "show ospf neighbor\nshow mpls ldp neighbor detail\nshow mpls ldp ipv4 igp sync\nshow route ipv4 10.10.0.4/32\nshow cef ipv4 10.10.0.4/32 detail\nping mpls ipv4 10.10.0.4/32",
        "note": "Compare with the recorded healthy checkpoint. Full final files describe the desired baseline but additive pasting does not remove arbitrary faults.",
        "interpretation": "For an unknown state restore the saved lab snapshot/checkpoint, or explicitly remove the injected fault first. Do not treat a final-file paste as a universal reset."
      }
    ],
    "dimension": "Instructor Readiness"
  },
  "downloads": [
    {
      "title": "Complete configurations and workbooks ZIP",
      "path": "downloads/mpls-foundations/mpls-foundations-configs.zip"
    },
    {
      "title": "Student setup, stages and verification workbook",
      "path": "downloads/mpls-foundations/README.md"
    },
    {
      "title": "Separate instructor faults and solutions",
      "path": "downloads/mpls-foundations/instructor.md"
    },
    {
      "title": "Machine-readable topology and config directories",
      "path": "downloads/mpls-foundations/topology.json"
    },
    {
      "title": "Public source metadata and validation status",
      "path": "downloads/mpls-foundations/sources.json"
    },
    {
      "title": "PE1 complete IOS XR baseline",
      "path": "downloads/mpls-foundations/final/PE1.cfg"
    },
    {
      "title": "P1 complete IOS XR baseline",
      "path": "downloads/mpls-foundations/final/P1.cfg"
    },
    {
      "title": "P2 complete IOS XR baseline",
      "path": "downloads/mpls-foundations/final/P2.cfg"
    },
    {
      "title": "PE2 complete IOS XR baseline",
      "path": "downloads/mpls-foundations/final/PE2.cfg"
    },
    {
      "title": "P1 separate IOS XE reference",
      "path": "downloads/mpls-foundations/ios-xe-reference/P1.cfg"
    }
  ]
}
