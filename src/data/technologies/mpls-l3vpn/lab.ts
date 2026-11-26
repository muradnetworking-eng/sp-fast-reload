import type { Lab, Unit } from '../../../schemas/content'

export const implement: Unit[] = [
  {
    "id": "l3vpn-implement-underlay",
    "title": "Build the transport and keep RR1 out of the data path",
    "summary": "Prove IPv4 reachability and an end-to-end LDP FEC before VPN service.",
    "blocks": [
      {
        "kind": "text",
        "text": "The five provider nodes use OSPF CORE area0. Core links cost10 and loopbacks cost1, giving PE1→PE2 metric31 and PE1→RR1 metric21. P1 and P2 carry no customer BGP or VRFs. Only the three PE1—P1—P2—PE2 links run LDP. RR1 has a reachable loopback for iBGP but its branch is IP control only."
      },
      {
        "kind": "diagram",
        "title": "Nine-node topology",
        "text": "CE-A1 (ACME) ── PE1 ── P1 ── P2 ── PE2 ── CE-A2 (ACME)\nCE-B1 (BETA) ───┘       │             └──── CE-B2 (BETA)\n                       RR1\nData chain: PE1—P1—P2—PE2, LDP on all3 links.\nRR1—P1: IPv4 OSPF/control only; RR1 is outside the data path.\nProvider AS65000; all core link costs10; Loopback0 cost1."
      },
      {
        "kind": "cli",
        "title": "P1 underlay delta",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "! MPLS L3VPN; IOS XR7.11 ASR9000 syntax reference.\n! Documentation reviewed2026-11-27; device/emulator execution pending.\n! OSPF everywhere; LDP only on three data-chain links.\nconfigure\nrouter ospf CORE\n router-id 10.0.0.2\n area 0\n  interface Loopback0\n   passive enable\n   cost 1\n   exit\n  interface GigabitEthernet0/0/0/0\n   network point-to-point\n   cost 10\n   exit\n  interface GigabitEthernet0/0/0/1\n   network point-to-point\n   cost 10\n   exit\n  interface GigabitEthernet0/0/0/2\n   network point-to-point\n   cost 10\n   exit\n  exit\n exit\nmpls ldp\n router-id 10.0.0.2\n address-family ipv4\n  discovery transport-address 10.0.0.2\n  exit\n interface GigabitEthernet0/0/0/0\n  address-family ipv4\n   exit\n  exit\n interface GigabitEthernet0/0/0/1\n  address-family ipv4\n   exit\n  exit\n exit\nmpls oam\n exit\ncommit\nend",
        "note": "Apply after initial addressing; apply corresponding underlay files to all five XR nodes.",
        "interpretation": "P1 has three OSPF neighbors but only two LDP neighbors. Do not enable LDP on the RR branch just to make the counts equal."
      },
      {
        "kind": "cli",
        "title": "Separate IP transport from labels",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "show ospf neighbor\nshow route ipv4 10.0.0.4/32\nshow route ipv4 10.0.0.5/32\nping 10.0.0.4 source 10.0.0.1\nshow mpls ldp neighbor\nshow mpls ldp bindings 10.0.0.4/32 detail\nshow cef ipv4 10.0.0.4/32 detail\nping mpls ipv4 10.0.0.4/32",
        "note": "Run destination/source checks on PE1; inspect LDP neighbors on each data-chain node.",
        "interpretation": "Reachable PE loopbacks are necessary for BGP and transport recursion. MPLS echo plus bindings/CEF establish evidence for a label switched transport path."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l3vpn-implement-vrf",
    "title": "Create tenant context before overlapping interfaces",
    "summary": "Separate route identity, import membership and forwarding tables.",
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 dual-stack VRFs and customer interfaces",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "! MPLS L3VPN; IOS XR7.11 ASR9000 syntax reference.\n! Documentation reviewed2026-11-27; device/emulator execution pending.\n! Create VRFs before assigning overlapping customer addresses.\nconfigure\nvrf ACME\n address-family ipv4 unicast\n  import route-target 65000:100\n  export route-target 65000:100\n  exit\n address-family ipv6 unicast\n  import route-target 65000:100\n  export route-target 65000:100\n  exit\n exit\nvrf BETA\n address-family ipv4 unicast\n  import route-target 65000:200\n  export route-target 65000:200\n  exit\n address-family ipv6 unicast\n  import route-target 65000:200\n  export route-target 65000:200\n  exit\n exit\ninterface GigabitEthernet0/0/0/1\n vrf ACME\n ipv4 address 172.16.11.0/31\n ipv6 address 2001:db8:11::/127\n no shutdown\n exit\ninterface GigabitEthernet0/0/0/2\n vrf BETA\n ipv4 address 172.16.11.0/31\n ipv6 address 2001:db8:11::/127\n no shutdown\n exit\ncommit\nend",
        "note": "The initial PE customer ports are unaddressed/shutdown. This stage creates VRFs first, then applies the intentionally repeated addresses inside separate tables.",
        "interpretation": "Gi0/0/0/1 belongs to ACME; Gi0/0/0/2 belongs to BETA. The same172.16.11.0/31 and2001:db8:11::/127 are valid in separate VRFs."
      },
      {
        "kind": "table",
        "headers": [
          "VRF",
          "PE1 RD",
          "PE2 RD",
          "Import/export RT in both AFs"
        ],
        "rows": [
          [
            "ACME",
            "65000:101",
            "65000:102",
            "65000:100"
          ],
          [
            "BETA",
            "65000:201",
            "65000:202",
            "65000:200"
          ]
        ]
      },
      {
        "kind": "text",
        "text": "RD distinguishes otherwise identical VPN NLRI. RT extended communities control import membership; they are not interchangeable with the RD. Both IPv4 and IPv6 VRF address families have explicit import/export RTs. In IOS XR the RD is configured under router bgp / vrf. A customer packet selects its VRF from the ingress interface before destination lookup."
      },
      {
        "kind": "text",
        "text": "For an existing addressed XR interface, changing its VRF can remove address configuration. Reapply and verify addresses in the target VRF after any move. The supplied progressive lab avoids placing overlapping customer interfaces into the global table."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l3vpn-implement-pe-ce",
    "title": "Learn only contracted host prefixes from each CE",
    "summary": "Use ordinary dual-stack eBGP with explicit policy in both directions.",
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 PE–CE BGP and policies",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "! MPLS L3VPN; IOS XR7.11 ASR9000 syntax reference.\n! Documentation reviewed2026-11-27; device/emulator execution pending.\n! Strict PE-CE IPv4 and IPv6 host-prefix policies.\nconfigure\nprefix-set SITE1-V4\n 10.60.1.1/32\nend-set\nprefix-set SITE1-V6\n 2001:db8:60:1::1/128\nend-set\nprefix-set SITE2-V4\n 10.60.2.2/32\nend-set\nprefix-set SITE2-V6\n 2001:db8:60:2::2/128\nend-set\nroute-policy VPN-S1-IN4\n if destination in SITE1-V4 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy VPN-S1-OUT4\n if destination in SITE2-V4 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy VPN-S1-IN6\n if destination in SITE1-V6 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy VPN-S1-OUT6\n if destination in SITE2-V6 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy DROP-ALL\n drop\nend-policy\nrouter bgp 65000\n bgp router-id 10.0.0.1\n vrf ACME\n  rd 65000:101\n  bgp router-id 10.0.0.1\n  address-family ipv4 unicast\n   exit\n  address-family ipv6 unicast\n   exit\n  neighbor 172.16.11.1\n   remote-as 65011\n   address-family ipv4 unicast\n    route-policy VPN-S1-IN4 in\n    route-policy VPN-S1-OUT4 out\n    exit\n   exit\n  neighbor 2001:db8:11::1\n   remote-as 65011\n   address-family ipv6 unicast\n    route-policy VPN-S1-IN6 in\n    route-policy VPN-S1-OUT6 out\n    exit\n   exit\n  exit\n vrf BETA\n  rd 65000:201\n  bgp router-id 10.0.0.1\n  address-family ipv4 unicast\n   exit\n  address-family ipv6 unicast\n   exit\n  neighbor 172.16.11.1\n   remote-as 65021\n   address-family ipv4 unicast\n    route-policy VPN-S1-IN4 in\n    route-policy VPN-S1-OUT4 out\n    exit\n   exit\n  neighbor 2001:db8:11::1\n   remote-as 65021\n   address-family ipv6 unicast\n    route-policy VPN-S1-IN6 in\n    route-policy VPN-S1-OUT6 out\n    exit\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Stage03 creates local VRF BGP. Remote VPN families are enabled in later stages. Shared SITE1/SITE2 host sets are intentional because tenants overlap.",
        "interpretation": "Each CE IPv4 and IPv6 neighbor has inbound and outbound RPL. Site1 inbound accepts only site1 Loopback0; outbound permits only the remote site2 host. DROP-ALL is defined but unused until an isolated fault."
      },
      {
        "kind": "cli",
        "title": "CE-A1 BGP and prefix filters",
        "os": "IOS XE17.x — C8000V reference",
        "code": "! MPLS L3VPN; IOS XE17 C8000V reference.\n! Documentation reviewed2026-11-27; device/emulator execution pending.\n! Only Loopback0 host routes originate.\nenable\nconfigure terminal\nip prefix-list SITE-LOCAL4 seq 10 permit 10.60.1.1/32\nip prefix-list SITE-REMOTE4 seq 10 permit 10.60.2.2/32\nipv6 prefix-list SITE-LOCAL6 seq 10 permit 2001:db8:60:1::1/128\nipv6 prefix-list SITE-REMOTE6 seq 10 permit 2001:db8:60:2::2/128\nroute-map CE-IN4 permit 10\n match ip address prefix-list SITE-REMOTE4\n exit\nroute-map CE-OUT4 permit 10\n match ip address prefix-list SITE-LOCAL4\n exit\nroute-map CE-IN6 permit 10\n match ipv6 address prefix-list SITE-REMOTE6\n exit\nroute-map CE-OUT6 permit 10\n match ipv6 address prefix-list SITE-LOCAL6\n exit\nrouter bgp 65011\n bgp router-id 192.0.2.11\n no bgp default ipv4-unicast\n neighbor 172.16.11.0 remote-as 65000\n neighbor 2001:db8:11:: remote-as 65000\n address-family ipv4 unicast\n  network 10.60.1.1 mask 255.255.255.255\n  neighbor 172.16.11.0 activate\n  neighbor 172.16.11.0 route-map CE-IN4 in\n  neighbor 172.16.11.0 route-map CE-OUT4 out\n  exit-address-family\n address-family ipv6 unicast\n  network 2001:db8:60:1::1/128\n  neighbor 2001:db8:11:: activate\n  neighbor 2001:db8:11:: route-map CE-IN6 in\n  neighbor 2001:db8:11:: route-map CE-OUT6 out\n  exit-address-family\n exit\nend",
        "note": "Apply after the CE initial addresses and PE VRF stage. No MPLS runs on the CE.",
        "interpretation": "Network statements originate only connected Loopback0 host routes. Prefix-list and route-map filters restrict inbound remote hosts and outbound local hosts. Empty/nonmatching policies do not silently allow all."
      },
      {
        "kind": "text",
        "text": "CE router IDs are explicit and distinct:192.0.2.11/12/21/22. Customer loopback addresses overlap by tenant. BGP router ID is a process identifier and need not equal an advertised tenant loopback. The CEs use distinct ASNs in the main baseline."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l3vpn-implement-reflection",
    "title": "Reflect VPN families while preserving the egress PE next hop",
    "summary": "Keep control-plane distribution separate from service forwarding.",
    "blocks": [
      {
        "kind": "cli",
        "title": "RR1 VPNv4 stage",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "! MPLS L3VPN; IOS XR7.11 ASR9000 syntax reference.\n! Documentation reviewed2026-11-27; device/emulator execution pending.\n! VPNv4 only checkpoint.\nconfigure\nrouter bgp 65000\n bgp router-id 10.0.0.5\n address-family vpnv4 unicast\n  retain route-target all\n  exit\n neighbor 10.0.0.1\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv4 unicast\n   route-reflector-client\n   exit\n  exit\n neighbor 10.0.0.4\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv4 unicast\n   route-reflector-client\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Apply the corresponding PE files too. RR1 has no VRF, LDP or customer service forwarding configuration.",
        "interpretation": "Both PEs are RR clients for VPNv4. Explicit retain route-target all retains the VPN routes in this no-VRF RR design."
      },
      {
        "kind": "cli",
        "title": "RR1 VPNv6 stage",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "! MPLS L3VPN; IOS XR7.11 ASR9000 syntax reference.\n! Documentation reviewed2026-11-27; device/emulator execution pending.\n! Add VPNv6 over the same IPv4 loopback session.\nconfigure\nrouter bgp 65000\n bgp router-id 10.0.0.5\n address-family vpnv6 unicast\n  retain route-target all\n  exit\n neighbor 10.0.0.1\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv6 unicast\n   route-reflector-client\n   exit\n  exit\n neighbor 10.0.0.4\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv6 unicast\n   route-reflector-client\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Add after the VPNv4 checkpoint. Each address family has its own client activation and retention.",
        "interpretation": "Do not set next-hop-self on RR1. Reflected service paths must continue to resolve to the originating PE, such as10.0.0.4, rather than the control-only RR."
      },
      {
        "kind": "text",
        "text": "VPN RTs travel as extended communities with the VPN routes. IOS XR VPNv4/vpnv6 iBGP carries this information without an IOS XE-style send-community extended line in these configurations. Prove the received RT attribute at RR1 and PE1; a BGP Established session alone does not prove that each VPN family, label or community is present."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l3vpn-implement-vpnv4",
    "title": "Trace local BGP through VPNv4 import into remote forwarding",
    "summary": "Check each table in the route’s direction of travel.",
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 VPNv4 session delta",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "! MPLS L3VPN; IOS XR7.11 ASR9000 syntax reference.\n! Documentation reviewed2026-11-27; device/emulator execution pending.\n! VPNv4 only checkpoint.\nconfigure\nrouter bgp 65000\n bgp router-id 10.0.0.1\n address-family vpnv4 unicast\n  exit\n neighbor 10.0.0.5\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv4 unicast\n   exit\n  exit\n exit\ncommit\nend",
        "note": "The neighbor transport is RR1 Loopback0 over IPv4. The PE next hop is preserved by reflection.",
        "interpretation": "CE-A2’s route should arrive as RD65000:102 with RT65000:100 and next-hop10.0.0.4; BETA uses RD65000:202 and RT65000:200."
      },
      {
        "kind": "cli",
        "title": "PE1 route evidence for remote ACME IPv4",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "show bgp vpnv4 unicast summary\nshow bgp vpnv4 unicast rd 65000:102 10.60.2.2/32 detail\nshow bgp vrf ACME ipv4 unicast 10.60.2.2/32\nshow route vrf ACME ipv4 10.60.2.2/32 detail\nshow cef vrf ACME ipv4 10.60.2.2/32 detail",
        "note": "Use the remote originating RD for the VPN table and ACME for the imported customer route. Repeat with BETA/RD65000:202.",
        "interpretation": "Compare VPN next hop, RT, service label, imported VRF route, transport recursion and the final CEF rewrite. Visibility in VPN BGP is earlier than successful VRF import and forwarding."
      },
      {
        "kind": "cli",
        "title": "CE-A1 and CE-B1 positive IPv4 tests",
        "os": "IOS XE17.x",
        "code": "show ip bgp 10.60.2.2\nshow ip route 10.60.2.2\nping 10.60.2.2 source Loopback0",
        "note": "Run separately on both site1 CEs and reverse from each site2 CE to10.60.1.1.",
        "interpretation": "Source Loopback0 is part of the advertised host contract, so the remote CE has a return route. A PE-originated probe using an unadvertised provider/attachment source can fail for return-path reasons."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l3vpn-implement-vpnv6",
    "title": "Add 6VPE over the same IPv4 MPLS transport",
    "summary": "Keep IPv6 service state independent from VPNv4.",
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 VPNv6 session delta",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "! MPLS L3VPN; IOS XR7.11 ASR9000 syntax reference.\n! Documentation reviewed2026-11-27; device/emulator execution pending.\n! Add VPNv6 over the same IPv4 loopback session.\nconfigure\nrouter bgp 65000\n bgp router-id 10.0.0.1\n address-family vpnv6 unicast\n  exit\n neighbor 10.0.0.5\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv6 unicast\n   exit\n  exit\n exit\ncommit\nend",
        "note": "The core remains IPv4-only. Dual-stack VRFs and PE–CE IPv6 eBGP already exist from earlier stages.",
        "interpretation": "VPNv6 distributes IPv6 VPN routes and service labels over IPv4 loopback sessions. The same LDP transport can carry the resulting label stack."
      },
      {
        "kind": "cli",
        "title": "PE1 remote ACME IPv6 evidence",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "show bgp vpnv6 unicast summary\nshow bgp vpnv6 unicast rd 65000:102 2001:db8:60:2::2/128 detail\nshow bgp vrf ACME ipv6 unicast 2001:db8:60:2::2/128\nshow route vrf ACME ipv6 2001:db8:60:2::2/128 detail\nshow cef vrf ACME ipv6 2001:db8:60:2::2/128 detail",
        "note": "Repeat for BETA using originating RD65000:202. XR7.11 displays actual IPv4 next-hop addresses for VPNv6.",
        "interpretation": "Check VPNv6 negotiation, RT, label, next-hop10.0.0.4, IPv6 VRF import and CEF independently. Working VPNv4 is not sufficient evidence for VPNv6."
      },
      {
        "kind": "cli",
        "title": "CE-A1 and CE-B1 IPv6 positive tests",
        "os": "IOS XE17.x",
        "code": "show bgp ipv6 unicast 2001:db8:60:2::2/128\nshow ipv6 route 2001:db8:60:2::2/128\nping ipv6 2001:db8:60:2::2 source Loopback0",
        "note": "Run separately on both site1 CEs. Reverse from CE-A2 and CE-B2 to site1’s IPv6 host.",
        "interpretation": "Use the advertised tenant Loopback0 as source. Record each tenant/family/direction so overlap cannot hide which service was tested."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l3vpn-implement-labels",
    "title": "Follow two labels through swap and transport PHP",
    "summary": "Preserve the service context until the egress PE.",
    "blocks": [
      {
        "kind": "diagram",
        "title": "Modeled ACME packet walk",
        "text": "MODEL — symbolic packet walk; no device capture\nACME CE-A1→CE-A2 IPv4:\nPE1 ingress Gi0/0/0/1 → ACME VRF lookup\nPE1→P1: [L_P1(10.0.0.4), V_PE2_ACME4] / customer IPv4\nP1→P2:  [L_P2(10.0.0.4), V_PE2_ACME4] / customer IPv4\nP2→PE2: [V_PE2_ACME4] / customer IPv4  (transport PHP)\nPE2: service-label disposition in ACME → CE-A2\nBETA uses its own service context; IPv6 uses V_PE2_ACME6.\nActual numbers and label allocation granularity must be observed."
      },
      {
        "kind": "cli",
        "title": "Correlate VPN label and transport label",
        "os": "IOS XR7.11.x — ASR9000 syntax reference",
        "code": "show bgp vpnv4 unicast rd 65000:102 10.60.2.2/32 detail\nshow cef vrf ACME ipv4 10.60.2.2/32 detail\nshow mpls ldp bindings 10.0.0.4/32 detail\nshow mpls ldp forwarding 10.0.0.4/32 detail\nshow mpls forwarding",
        "note": "Run the VPN/VRF checks on PE1, transport/LFIB checks at P1/P2 and service disposition at PE2. Read actual labels from the local router.",
        "interpretation": "P1 swaps the outer label and preserves the inner service label. P2 pops only the transport label. PE2 receives a service-labeled packet; it does not receive plain customer IP merely because PHP occurred."
      },
      {
        "kind": "text",
        "text": "The baseline does not force a service-label allocation mode. Platform defaults can allocate by prefix or shared service context. Observe the BGP label and egress disposition; do not grade for a fixed numeric label or require one unique label per prefix. P routers need transport labels and PE loopback routes, while the service context remains at the PEs."
      },
      {
        "kind": "text",
        "text": "A1500-byte IP packet with two labels needs1508 bytes of MPLS payload. On untagged XR Ethernet, frame MTU1600 includes14 bytes of Ethernet header, leaving1586 for payload. Core ipv4 mtu1500 retains ordinary IP limits. Validate effective MTUs and actual stack depth; virtual forwarding behavior has not been tested here."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  },
  {
    "id": "l3vpn-implement-isolation",
    "title": "Prove isolation and practice same-AS recovery",
    "summary": "Use unique test routes and paired optional changes.",
    "blocks": [
      {
        "kind": "text",
        "text": "Successful pings between overlapping10.60.x hosts prove positive connectivity only. The same destination exists in both tenants, so it cannot identify which tenant answered or demonstrate absence of route leaking. Inspect ingress VRF, originating RD, received RT, import configuration and egress service context."
      },
      {
        "kind": "list",
        "items": [
          "Optional isolation injects CE-A2 Loopback99:198.51.100.222/32 and2001:db8:ac:2::222/128. The apply files expand only ACME CE/PE allowlists.",
          "Prove the marker reaches ACME at PE1 and CE-A1. Confirm it is absent from BETA VRF tables at both PEs and from the default table; a negative BETA probe is supporting evidence.",
          "Use every matching restore file, refresh only the affected neighbor/AF if necessary, and prove marker withdrawal before continuing.",
          "The separate same-AS experiment changes CE-A2 to AS65011 and updates PE2 remote-as. Locate the first rejection boundary: the PE may suppress an own-CE-AS update before the CE sees it. Bounded IOS XE allowas-in1 is a conditional CE-acceptance comparison only when the unchanged update was sent. Additional paired provider-rpl files preserve exact outbound prefix allowlists and replace only65011 with the provider AS. Observe advertisement and CE paths, then restore RPL, remove allowas-in and restore CE-A2 AS65012."
        ]
      },
      {
        "kind": "text",
        "text": "Keep the optional experiments separate. The supplied same-AS BGP replacement changes only the isolated CE-A2 process. Native XR as-override was deprecated in7.11.1 and is not shipped as recommended CLI. CE allowas-in1 permits one own-AS occurrence without rewriting AS_PATH; it cannot repair provider suppression. The targeted provider RPL action replace as-path '65011' replaces that sequence with local65000 while retaining other ASes and the exact destination filter. Neither remedy adds tenant membership or repairs an RT mismatch. Source review does not guarantee processing on an untested image; multihoming requires a complete site-loop-prevention design."
      }
    ],
    "dimension": "Configuration Knowledge",
    "minutes": 15
  }
]

export const lab: Lab = {
  "setup": {
    "id": "l3vpn-lab-setup",
    "title": "Build the nine-node dual-stack VPN lab",
    "summary": "Create the topology manually and record the initial checkpoint.",
    "blocks": [
      {
        "kind": "text",
        "text": "Create PE1/P1/P2/PE2/RR1 as MPLS-capable IOS XR nodes and four IOS XE C8000V candidates for the CEs. The syntax reference is ASR9000 IOS XR7.11.x plus IOS XE17 family documentation. Check licensed images, resources, interfaces and features in CML/EVE-NG. Manual setup is supplied; no tested importable topology file or device capture is claimed."
      },
      {
        "kind": "diagram",
        "title": "Manual wiring",
        "text": "CE-A1 (ACME) ── PE1 ── P1 ── P2 ── PE2 ── CE-A2 (ACME)\nCE-B1 (BETA) ───┘       │             └──── CE-B2 (BETA)\n                       RR1\nData chain: PE1—P1—P2—PE2, LDP on all3 links.\nRR1—P1: IPv4 OSPF/control only; RR1 is outside the data path.\nProvider AS65000; all core link costs10; Loopback0 cost1."
      },
      {
        "kind": "table",
        "headers": [
          "Node",
          "Provider/customer role",
          "Loopback / BGP ID"
        ],
        "rows": [
          [
            "PE1",
            "PE; AS65000",
            "10.0.0.1/32; ID 10.0.0.1"
          ],
          [
            "P1",
            "P; AS65000",
            "10.0.0.2/32; ID 10.0.0.2"
          ],
          [
            "P2",
            "P; AS65000",
            "10.0.0.3/32; ID 10.0.0.3"
          ],
          [
            "PE2",
            "PE; AS65000",
            "10.0.0.4/32; ID 10.0.0.4"
          ],
          [
            "RR1",
            "RR; AS65000",
            "10.0.0.5/32; ID 10.0.0.5"
          ],
          [
            "CE-A1",
            "CE; AS65011",
            "10.60.1.1/32 / 2001:db8:60:1::1/128; ID 192.0.2.11"
          ],
          [
            "CE-A2",
            "CE; AS65012",
            "10.60.2.2/32 / 2001:db8:60:2::2/128; ID 192.0.2.12"
          ],
          [
            "CE-B1",
            "CE; AS65021",
            "10.60.1.1/32 / 2001:db8:60:1::1/128; ID 192.0.2.21"
          ],
          [
            "CE-B2",
            "CE; AS65022",
            "10.60.2.2/32 / 2001:db8:60:2::2/128; ID 192.0.2.22"
          ]
        ]
      },
      {
        "kind": "table",
        "headers": [
          "Link",
          "Endpoint A",
          "Endpoint B",
          "Purpose"
        ],
        "rows": [
          [
            "PE1—P1",
            "GigabitEthernet0/0/0/0 10.0.12.0/31",
            "GigabitEthernet0/0/0/0 10.0.12.1/31",
            "core"
          ],
          [
            "P1—P2",
            "GigabitEthernet0/0/0/1 10.0.23.0/31",
            "GigabitEthernet0/0/0/0 10.0.23.1/31",
            "core"
          ],
          [
            "P2—PE2",
            "GigabitEthernet0/0/0/1 10.0.34.0/31",
            "GigabitEthernet0/0/0/0 10.0.34.1/31",
            "core"
          ],
          [
            "P1—RR1",
            "GigabitEthernet0/0/0/2 10.0.25.0/31",
            "GigabitEthernet0/0/0/0 10.0.25.1/31",
            "control"
          ],
          [
            "PE1—CE-A1",
            "GigabitEthernet0/0/0/1 172.16.11.0/31 / 2001:db8:11::/127",
            "GigabitEthernet1 172.16.11.1/31 / 2001:db8:11::1/127",
            "ACME"
          ],
          [
            "PE2—CE-A2",
            "GigabitEthernet0/0/0/1 172.16.22.0/31 / 2001:db8:22::/127",
            "GigabitEthernet1 172.16.22.1/31 / 2001:db8:22::1/127",
            "ACME"
          ],
          [
            "PE1—CE-B1",
            "GigabitEthernet0/0/0/2 172.16.11.0/31 / 2001:db8:11::/127",
            "GigabitEthernet1 172.16.11.1/31 / 2001:db8:11::1/127",
            "BETA"
          ],
          [
            "PE2—CE-B2",
            "GigabitEthernet0/0/0/2 172.16.22.0/31 / 2001:db8:22::/127",
            "GigabitEthernet1 172.16.22.1/31 / 2001:db8:22::1/127",
            "BETA"
          ]
        ]
      },
      {
        "kind": "list",
        "items": [
          "Apply initial files to all nine nodes. The PE customer ports remain shutdown/unaddressed until VRFs are created. Preserve console/management settings separately.",
          "Apply stages in numeric order; verify each checkpoint and take snapshots before faults. XR files enter configuration and commit; XE files apply as entered. Inspect failed XR candidates before proceeding.",
          "The full final set is for a clean rebuild. Additive pasting does not remove wrong RTs, dropped AFs, unused test loopbacks or arbitrary faults. Use paired restore files or a known saved lab checkpoint.",
          "Source review date:2026-11-27. All output descriptions are modeled expectations; device/emulator execution and capture validation remain pending."
        ]
      }
    ],
    "dimension": "Lab Experience",
    "minutes": 15
  },
  "milestones": [
    {
      "id": "l3vpn-lab-1",
      "title": "1. Establish transport prerequisites",
      "summary": "Prove OSPF and LDP before examining VPN state.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/01-underlay on all five XR nodes. Verify OSPF FULL counts PE1/P1/P2/PE2/RR1=1/3/2/1/1.",
            "Verify LDP operational counts PE1/P1/P2/PE2=1/2/2/1; RR1 runs no LDP.",
            "From PE1 test PE2 and RR1 loopbacks with source10.0.0.1. Record /32 metrics31 and21.",
            "Validate the PE2 transport FEC with bindings, CEF/LFIB and MPLS OAM. Explain why RR1 requires no transport label for reflecting VPN routes."
          ]
        },
        {
          "kind": "cli",
          "title": "Underlay checks",
          "os": "IOS XR7.11.x — ASR9000 syntax reference",
          "code": "show ospf neighbor\nshow route ipv4 10.0.0.4/32\nshow route ipv4 10.0.0.5/32\nshow mpls ldp neighbor\nping 10.0.0.4 source 10.0.0.1\nping mpls ipv4 10.0.0.4/32",
          "note": "Run checks at the named endpoints, then verify the reverse direction.",
          "interpretation": "Pass when the intended PE transport and RR control paths are distinguished and the label switched FEC works."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 15
    },
    {
      "id": "l3vpn-lab-2",
      "title": "2. Create overlapping VRFs safely",
      "summary": "Map every attachment into its tenant and address family.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/02-vrfs at PE1/PE2.",
            "Verify ACME/BETA interface assignment and connected IPv4/IPv6 routes. Check both AF import/export RTs and unique RD plan.",
            "From each CE test its directly connected PE in both families.",
            "Explain why repeated attachment addresses and tenant host routes are legal here, and why they would collide in the default table."
          ]
        },
        {
          "kind": "cli",
          "title": "PE1 context checks",
          "os": "IOS XR7.11.x — ASR9000 syntax reference",
          "code": "show vrf all\nshow running-config vrf\nshow running-config interface GigabitEthernet0/0/0/1\nshow running-config interface GigabitEthernet0/0/0/2\nshow route vrf ACME ipv4\nshow route vrf BETA ipv6",
          "note": "Inspect both interfaces and AFs, not only VRF names.",
          "interpretation": "Pass requires correct ingress membership and connected routes, with no tenant attachment in the default table."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 15
    },
    {
      "id": "l3vpn-lab-3",
      "title": "3. Establish restricted PE–CE routing",
      "summary": "Prove local route learning before remote VPN distribution.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/03-pe-ce to PE1/PE2 and all four CEs.",
            "Verify all local IPv4 and IPv6 eBGP sessions, then confirm only the site’s host route is learned by its PE.",
            "Read one XR inbound/outbound RPL and one XE prefix-list/route-map pair. Explain implicit deny and policy direction.",
            "Confirm that remote CE host routes are not yet end-to-end: VPN distribution is not enabled until later stages."
          ]
        },
        {
          "kind": "cli",
          "title": "Local VRF BGP checks",
          "os": "IOS XR7.11.x — ASR9000 syntax reference",
          "code": "show bgp vrf ACME ipv4 unicast summary\nshow bgp vrf ACME ipv6 unicast summary\nshow bgp vrf ACME ipv4 unicast 10.60.1.1/32\nshow bgp vrf BETA ipv6 unicast 2001:db8:60:1::1/128",
          "note": "Run site1-prefix checks on PE1; use site2 prefixes on PE2.",
          "interpretation": "Pass requires local CE host routes in the correct VRF, explicit permitted prefixes and no unrestricted redistribution."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 20
    },
    {
      "id": "l3vpn-lab-4",
      "title": "4. Deliver IPv4 VPN service through RR1",
      "summary": "Follow RD, RT, next hop, label and import.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/04-vpnv4 to both PEs and RR1.",
            "At RR1 inspect four originating RDs and both RTs for the overlapping host routes. Check clients and preserved PE next hops.",
            "At PE1 trace CE-A2’s IPv4 route from VPNv4 RD65000:102 into ACME and CE-B2’s equivalent under RD65000:202 into BETA.",
            "Probe site1↔site2 separately within ACME and BETA using CE Loopback0 sources. Record both directions."
          ]
        },
        {
          "kind": "cli",
          "title": "PE1 IPv4 route walk",
          "os": "IOS XR7.11.x — ASR9000 syntax reference",
          "code": "show bgp vpnv4 unicast summary\nshow bgp vpnv4 unicast rd 65000:102 10.60.2.2/32 detail\nshow bgp vrf ACME ipv4 unicast 10.60.2.2/32\nshow route vrf ACME ipv4 10.60.2.2/32 detail\nshow cef vrf ACME ipv4 10.60.2.2/32 detail",
          "note": "Repeat with BETA and its RD.",
          "interpretation": "Pass requires a coherent route in every relevant table plus positive CE probes."
        },
        {
          "kind": "cli",
          "title": "Site1 CE probe",
          "os": "IOS XE17.x",
          "code": "ping 10.60.2.2 source Loopback0",
          "note": "Run independently on CE-A1 and CE-B1; reverse from both site2 CEs.",
          "interpretation": "Do not merge results just because the source/destination addresses are the same."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 20
    },
    {
      "id": "l3vpn-lab-5",
      "title": "5. Deliver IPv6 VPN service over IPv4 MPLS",
      "summary": "Validate VPNv6 independently of working IPv4.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply stages/05-vpnv6 to both PEs and RR1.",
            "Inspect VPNv6 family negotiation, originating RD, RT, label and PE IPv4 next hop.",
            "Verify each tenant IPv6 route and CEF recursion. The core remains IPv4-only.",
            "Run CE IPv6 probes in both tenant/direction pairs using advertised Loopback0 sources."
          ]
        },
        {
          "kind": "cli",
          "title": "PE1 IPv6 route walk",
          "os": "IOS XR7.11.x — ASR9000 syntax reference",
          "code": "show bgp vpnv6 unicast summary\nshow bgp vpnv6 unicast rd 65000:102 2001:db8:60:2::2/128 detail\nshow bgp vrf ACME ipv6 unicast 2001:db8:60:2::2/128\nshow route vrf ACME ipv6 2001:db8:60:2::2/128 detail\nshow cef vrf ACME ipv6 2001:db8:60:2::2/128 detail",
          "note": "Repeat with BETA and originating RD65000:202.",
          "interpretation": "Pass requires independent VPNv6 control-plane, VRF forwarding and CE probe evidence."
        },
        {
          "kind": "cli",
          "title": "Site1 CE dual-stack probes",
          "os": "IOS XE17.x",
          "code": "ping 10.60.2.2 source Loopback0\nping ipv6 2001:db8:60:2::2 source Loopback0",
          "note": "Run on CE-A1 and CE-B1, then reverse from CE-A2 and CE-B2.",
          "interpretation": "A failure in only one AF narrows the search but does not uniquely identify the fault."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 20
    },
    {
      "id": "l3vpn-lab-6",
      "title": "6. Prove the two-label packet walk",
      "summary": "Explain what every node looks up and what PHP removes.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Record actual PE2 service labels and P1/P2 transport labels.",
            "Draw CE-A1→CE-A2 IPv4 and IPv6 on PE1→P1, P1→P2 and P2→PE2 links.",
            "Explain which label remains after P2 PHP, which VRF PE2 uses and why P1/P2 need no tenant routes.",
            "Check effective interface/MPLS MTUs and calculate1508-byte payload headroom for1500-byte IP plus two labels.",
            "Use a supported link capture if available; clearly separate an actual capture from the provided model."
          ]
        },
        {
          "kind": "diagram",
          "title": "Expected logic, not a capture",
          "text": "MODEL — symbolic packet walk; no device capture\nACME CE-A1→CE-A2 IPv4:\nPE1 ingress Gi0/0/0/1 → ACME VRF lookup\nPE1→P1: [L_P1(10.0.0.4), V_PE2_ACME4] / customer IPv4\nP1→P2:  [L_P2(10.0.0.4), V_PE2_ACME4] / customer IPv4\nP2→PE2: [V_PE2_ACME4] / customer IPv4  (transport PHP)\nPE2: service-label disposition in ACME → CE-A2\nBETA uses its own service context; IPv6 uses V_PE2_ACME6.\nActual numbers and label allocation granularity must be observed."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 20
    },
    {
      "id": "l3vpn-lab-7",
      "title": "7. Demonstrate tenant isolation with a unique marker",
      "summary": "Avoid ambiguous tests with overlapping destinations.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "From the clean final baseline apply optional/isolation files on CE-A2, PE2, PE1 and CE-A1. Read the exact allowlist extensions before applying.",
            "Verify unique IPv4 and IPv6 marker routes at RR1, PE2 ACME, PE1 ACME and CE-A1; inspect RT65000:100.",
            "Verify neither marker exists in BETA VRF tables at either PE or the global RIB. Run BETA negative probes as supporting evidence.",
            "Probe the markers from CE-A1 with Loopback0 source. Explain why same-overlap pings could not establish isolation.",
            "Apply all four restore files, refresh affected AFs if required, and prove marker withdrawal and baseline host connectivity."
          ]
        },
        {
          "kind": "cli",
          "title": "Unique-marker table checks",
          "os": "IOS XR7.11.x — ASR9000 syntax reference",
          "code": "show route vrf ACME ipv4 198.51.100.222/32\nshow route vrf BETA ipv4 198.51.100.222/32\nshow route vrf ACME ipv6 2001:db8:ac:2::222/128\nshow route vrf BETA ipv6 2001:db8:ac:2::222/128\nshow route ipv4 198.51.100.222/32",
          "note": "Run at both PEs. Baseline has no default route or broader covering route to these markers.",
          "interpretation": "Pass combines positive ACME delivery with control-plane evidence of absence from BETA/default tables."
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 25
    },
    {
      "id": "l3vpn-lab-8",
      "title": "8. Diagnose scoped faults and restore service",
      "summary": "Find the first failed dependency before making changes.",
      "blocks": [
        {
          "kind": "list",
          "items": [
            "The instructor selects one paired fault: PE2 ACME IPv4 import RT, PE1 CE-A1 IPv4 inbound policy, PE2 VPNv6 AF or P1 LDP link activation.",
            "State the affected tenant, AF and direction; collect the next discriminating evidence before editing.",
            "Verify the expected scope of impact for the selected fault: a tenant policy error can be local, PE2 VPNv6 removal affects both tenants' IPv6, and the core LDP fault can affect every VPN service. Correct the smallest relevant scope, then verify all tenant, family and direction pairs after restoration, including those expected to remain unaffected.",
            "Optional: run the separate same-AS comparison, locate provider suppression versus CE rejection, compare bounded CE acceptance with targeted provider RPL, and restore every phase.",
            "Submit your route/label diagrams, actual outputs, isolation evidence, fault reasoning, restore evidence and platform limitations."
          ]
        }
      ],
      "dimension": "Lab Experience",
      "minutes": 25
    }
  ],
  "solutions": {
    "id": "l3vpn-lab-solutions",
    "title": "Instructor key and restoration checkpoints",
    "summary": "Use after the student has collected evidence.",
    "blocks": [
      {
        "kind": "text",
        "text": "The separate instructor.md provides exact injection, expected observations and restoration. Fault files are isolated controls, not a configuration stage. Source review does not substitute for an observed outcome on the selected image."
      },
      {
        "kind": "table",
        "headers": [
          "Fault or exercise",
          "Expected causal explanation"
        ],
        "rows": [
          [
            "Wrong ACME IPv4 import RT at PE2",
            "Remote site1 VPNv4 can remain visible while ACME IPv4 import fails. Export/IPv6/BETA stay baseline. Restore import100 and remove999."
          ],
          [
            "PE1 CE-A1 inbound IPv4 DROP-ALL",
            "Local CE-A1 IPv4 host is filtered before VPN export. Session may remain Established; IPv6/BETA stay healthy. Restore VPN-S1-IN4."
          ],
          [
            "PE2 RR VPNv6 AF removed",
            "VPNv4 can work over the same neighbor while VPNv6 service paths withdraw. Restore only the neighbor VPNv6 AF."
          ],
          [
            "P1 LDP missing on chain link",
            "IP/OSPF/BGP may remain up while service-label transport breaks. This topology has no alternate LSP. Restore LDP and prove labeled service, not just PE-loopback IP."
          ],
          [
            "PHP",
            "Only the transport label is popped at P2; PE2 still receives and interprets the service label."
          ],
          [
            "Isolation",
            "Use unique ACME markers and RT/VRF evidence. Overlapping destination pings alone cannot prove no leak."
          ],
          [
            "Same customer AS",
            "Inspect provider advertisement before assuming CE rejection. Conditional allowas-in1 permits one own-AS occurrence only if the update reaches the CE. Targeted provider RPL changes65011 to local65000 within the exact prefix filter. Verify actual paths and restore RPL, CE exceptions and distinct ASN baseline."
          ]
        ]
      },
      {
        "kind": "text",
        "text": "Full final files assume a clean lab. They do not remove arbitrary injected state when pasted additively. Use the paired restores or a saved known checkpoint; verify every tenant/AF/direction afterward."
      }
    ],
    "dimension": "Instructor Readiness",
    "minutes": 20
  },
  "downloads": [
    {
      "title": "Complete lab configurations ZIP",
      "path": "downloads/mpls-l3vpn/mpls-l3vpn-configs.zip"
    },
    {
      "title": "Student setup and verification workbook",
      "path": "downloads/mpls-l3vpn/README.md"
    },
    {
      "title": "Separate instructor faults and solutions",
      "path": "downloads/mpls-l3vpn/instructor.md"
    },
    {
      "title": "Topology, addressing and test invariants",
      "path": "downloads/mpls-l3vpn/topology.json"
    },
    {
      "title": "Public source metadata",
      "path": "downloads/mpls-l3vpn/sources.json"
    },
    {
      "title": "PE1 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/PE1.cfg"
    },
    {
      "title": "P1 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/P1.cfg"
    },
    {
      "title": "P2 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/P2.cfg"
    },
    {
      "title": "PE2 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/PE2.cfg"
    },
    {
      "title": "RR1 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/RR1.cfg"
    },
    {
      "title": "CE-A1 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/CE-A1.cfg"
    },
    {
      "title": "CE-A2 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/CE-A2.cfg"
    },
    {
      "title": "CE-B1 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/CE-B1.cfg"
    },
    {
      "title": "CE-B2 complete clean baseline",
      "path": "downloads/mpls-l3vpn/final/CE-B2.cfg"
    }
  ]
}
