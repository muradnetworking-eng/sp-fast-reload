import type { Lab, Unit } from '../../../schemas/content'

export const implement: Unit[] = [
  {
    "id": "bgp-xr-underlay",
    "title": "Prepare routed loopback peering",
    "summary": "Build dual-stack reachability and prove both session source return paths.",
    "dimension": "Configuration Knowledge",
    "minutes": 8,
    "blocks": [
      {
        "kind": "diagram",
        "title": "AS65000 core and two customer sites",
        "text": "                           RR1 (.4)\n                             | Gi0/0/0/0\n                             | 10.0.24.0/31\n                             | P1 Gi0/0/0/2\nCE1 ----- PE1 (.1) ---------- P1 (.2) -------- PE2 (.3) ----- CE2\nAS65101      | 10.0.12.0/31       10.0.23.0/31  |          AS65102\n           Gi0/0/0/0          Gi0/0/0/1        Gi0/0/0/0\nCE links use PE Gi0/0/0/1 and CE GigabitEthernet1.\nAll core IS-IS links have metric 10 in both directions."
      },
      {
        "kind": "table",
        "headers": [
          "Node",
          "Role / AS",
          "Loopback IPv4",
          "Loopback IPv6"
        ],
        "rows": [
          [
            "PE1",
            "Site 1 PE / 65000",
            "10.0.0.1/32",
            "2001:db8:0::1/128"
          ],
          [
            "P1",
            "Global transit, later MPLS P / 65000",
            "10.0.0.2/32",
            "2001:db8:0::2/128"
          ],
          [
            "PE2",
            "Site 2 PE / 65000",
            "10.0.0.3/32",
            "2001:db8:0::3/128"
          ],
          [
            "RR1",
            "Route reflector / 65000",
            "10.0.0.4/32",
            "2001:db8:0::4/128"
          ],
          [
            "CE1",
            "Site 1 / 65101",
            "192.0.2.11/32 on Loopback100",
            "2001:db8:101:100::11/128"
          ],
          [
            "CE2",
            "Site 2 / 65102",
            "198.51.100.22/32 on Loopback100",
            "2001:db8:102:100::22/128"
          ]
        ]
      },
      {
        "kind": "table",
        "headers": [
          "Endpoint A",
          "Endpoint B",
          "IPv4 A / B",
          "IPv6 A / B"
        ],
        "rows": [
          [
            "PE1 Gi0/0/0/0",
            "P1 Gi0/0/0/0",
            "10.0.12.0 / .1, /31",
            "2001:db8:12::0 / ::1, /127"
          ],
          [
            "P1 Gi0/0/0/1",
            "PE2 Gi0/0/0/0",
            "10.0.23.0 / .1, /31",
            "2001:db8:23::0 / ::1, /127"
          ],
          [
            "P1 Gi0/0/0/2",
            "RR1 Gi0/0/0/0",
            "10.0.24.0 / .1, /31",
            "2001:db8:24::0 / ::1, /127"
          ],
          [
            "PE1 Gi0/0/0/1",
            "CE1 Gi1",
            "172.16.101.1 / .2, /30",
            "2001:db8:101:1::1 / ::2, /64"
          ],
          [
            "PE2 Gi0/0/0/1",
            "CE2 Gi1",
            "172.16.102.1 / .2, /30",
            "2001:db8:102:1::1 / ::2, /64"
          ]
        ]
      },
      {
        "kind": "cli",
        "title": "PE1 · Prove both loopback session paths",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "show isis adjacency\nshow route ipv4 10.0.0.4/32\nshow route ipv6 2001:db8:0::4/128\nping 10.0.0.4 source 10.0.0.1\nping ipv6 2001:db8:0::4 source 2001:db8:0::1",
        "note": "Run after initial addressing and stage 01 on all core nodes. Repeat sourced loopback reachability from P1 and PE2. Read the observed IPv6 next hop, which can be a link-local address plus egress interface.",
        "output": "Model checkpoints\nPE1 Level 2 neighbor: P1, Up\nIPv4 RR1 route: via 10.0.12.1\nIPv6 RR1 route: resolved through P1\nBoth sourced probes: replies",
        "interpretation": "Loopback sessions need a return route to the selected local source. CE links and customer loopbacks are outside IS-IS."
      },
      {
        "kind": "text",
        "text": "Core IS-IS uses CORE, Level2, area49.0001 and unique NET suffixes0001 through0004. Initial and stage01 files include each device’s complete addressing and IGP configuration. Keep CE prefixes outside the IGP."
      }
    ]
  },
  {
    "id": "bgp-xr-global",
    "title": "Configure eBGP and reflected global IPv4 / IPv6",
    "summary": "Define admission, activate both AFs and preserve reachable PE next hops.",
    "dimension": "Configuration Knowledge",
    "minutes": 15,
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 · Define strict per-AF import and export policies",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nprefix-set SITE1-V4\n 192.0.2.11/32\nend-set\nprefix-set SITE1-V6\n 2001:db8:101:100::11/128\nend-set\nprefix-set SITE2-V4\n 198.51.100.22/32\nend-set\nprefix-set SITE2-V6\n 2001:db8:102:100::22/128\nend-set\nroute-policy CE1-IN-V4\n if destination in SITE1-V4 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy CE1-OUT-V4\n if destination in SITE2-V4 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy CE1-IN-V6\n if destination in SITE1-V6 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy CE1-OUT-V6\n if destination in SITE2-V6 then\n  pass\n else\n  drop\n endif\nend-policy\ncommit\nend",
        "note": "Attach the CE1-IN policies to receive Site 1 and CE1-OUT policies to advertise Site 2. PE2 uses the inverse SITE2/SITE1 relationship. Every exact prefix is paired with its own AF.",
        "interpretation": "IOS XR ordinary eBGP requires inbound and outbound policy. An Established session can coexist with route rejection. Admission policy applies before a path is eligible for selection."
      },
      {
        "kind": "cli",
        "title": "PE1 · Activate global eBGP and reflected iBGP",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nrouter bgp 65000\n bgp router-id 10.0.0.1\n address-family ipv4 unicast\n  exit\n address-family ipv6 unicast\n  exit\n neighbor 10.0.0.4\n  remote-as 65000\n  update-source Loopback0\n  address-family ipv4 unicast\n   next-hop-self\n   exit\n  exit\n neighbor 2001:db8:0::4\n  remote-as 65000\n  update-source Loopback0\n  address-family ipv6 unicast\n   next-hop-self\n   exit\n  exit\n neighbor 172.16.101.2\n  remote-as 65101\n  address-family ipv4 unicast\n   route-policy CE1-IN-V4 in\n   route-policy CE1-OUT-V4 out\n   exit\n  exit\n neighbor 2001:db8:101:1::2\n  remote-as 65101\n  address-family ipv6 unicast\n   route-policy CE1-IN-V6 in\n   route-policy CE1-OUT-V6 out\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Apply the policies first. The IPv4 and IPv6 RR sessions use Loopback0. Each ingress PE applies next-hop-self in its global AF toward RR1, making the CE route resolve through a core-reachable PE loopback.",
        "interpretation": "RR1 preserves the PE next hop. The full stage 02 files include P1 as a global IPv4/IPv6 RR client, so native IP transit has customer destination routes before MPLS is added."
      },
      {
        "kind": "cli",
        "title": "RR1 · Make the three core speakers global clients",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nrouter bgp 65000\n bgp router-id 10.0.0.4\n address-family ipv4 unicast\n  exit\n address-family ipv6 unicast\n  exit\n neighbor 10.0.0.1\n  remote-as 65000\n  update-source Loopback0\n  address-family ipv4 unicast\n   route-reflector-client\n   exit\n  exit\n neighbor 2001:db8:0::1\n  remote-as 65000\n  update-source Loopback0\n  address-family ipv6 unicast\n   route-reflector-client\n   exit\n  exit\n neighbor 10.0.0.2\n  remote-as 65000\n  update-source Loopback0\n  address-family ipv4 unicast\n   route-reflector-client\n   exit\n  exit\n neighbor 2001:db8:0::2\n  remote-as 65000\n  update-source Loopback0\n  address-family ipv6 unicast\n   route-reflector-client\n   exit\n  exit\n neighbor 10.0.0.3\n  remote-as 65000\n  update-source Loopback0\n  address-family ipv4 unicast\n   route-reflector-client\n   exit\n  exit\n neighbor 2001:db8:0::3\n  remote-as 65000\n  update-source Loopback0\n  address-family ipv6 unicast\n   route-reflector-client\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Apply after the underlay. Client status is AF-specific. RR1 is cabled off the CE data path.",
        "interpretation": "A client route is reflected to other clients with the PE next hop preserved. Originator ID and cluster list prevent reflection loops. Removing client status from just one PE can still permit reflection through another client."
      },
      {
        "kind": "cli",
        "title": "PE1 · Read route acceptance, next hop and forwarding",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "show bgp ipv4 unicast summary\nshow bgp ipv6 unicast summary\nshow bgp ipv4 unicast 198.51.100.22/32 detail\nshow bgp ipv6 unicast 2001:db8:102:100::22/128 detail\nshow cef ipv4 198.51.100.22/32 detail\nshow cef ipv6 2001:db8:102:100::22/128 detail",
        "note": "Run after all six stage 02 files. Compare PE1, RR1 and P1 views before probing from CE1.",
        "output": "Model fields at PE1\nIPv4 route supplier: RR1 10.0.0.4\nIPv4 next hop: PE2 10.0.0.3\nIPv6 next hop: PE2 Loopback0, resolved\nAS_PATH inside AS65000: 65102\nReflection attributes: originator PE2, cluster RR1",
        "interpretation": "The supplier of the BGP UPDATE differs from the forwarding next hop. At this phase P1 has global customer routes and the native data path is CE1→PE1→P1→PE2→CE2."
      }
    ]
  },
  {
    "id": "bgp-xr-policy",
    "title": "Apply and re-evaluate routing policy",
    "summary": "Separate route admission from preference and verify a controlled refresh.",
    "dimension": "Configuration Knowledge",
    "minutes": 8,
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 · Define strict per-AF import and export policies",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nprefix-set SITE1-V4\n 192.0.2.11/32\nend-set\nprefix-set SITE1-V6\n 2001:db8:101:100::11/128\nend-set\nprefix-set SITE2-V4\n 198.51.100.22/32\nend-set\nprefix-set SITE2-V6\n 2001:db8:102:100::22/128\nend-set\nroute-policy CE1-IN-V4\n if destination in SITE1-V4 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy CE1-OUT-V4\n if destination in SITE2-V4 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy CE1-IN-V6\n if destination in SITE1-V6 then\n  pass\n else\n  drop\n endif\nend-policy\nroute-policy CE1-OUT-V6\n if destination in SITE2-V6 then\n  pass\n else\n  drop\n endif\nend-policy\ncommit\nend",
        "note": "Attach the CE1-IN policies to receive Site 1 and CE1-OUT policies to advertise Site 2. PE2 uses the inverse SITE2/SITE1 relationship. Every exact prefix is paired with its own AF.",
        "interpretation": "IOS XR ordinary eBGP requires inbound and outbound policy. An Established session can coexist with route rejection. Admission policy applies before a path is eligible for selection."
      },
      {
        "kind": "text",
        "text": "Admission decides which paths are eligible. LOCAL_PREF influences the provider AS’s choice among eligible exits. Outbound MED influences the external AS when the relevant comparison applies and earlier attributes tie. Use the optional second CE attachment to create two real candidates."
      },
      {
        "kind": "cli",
        "title": "PE1 · Re-evaluate a deliberately changed global IPv4 policy",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "show running-config route-policy CE1-IN-V4\nshow bgp ipv4 unicast neighbors 172.16.101.2\nclear bgp ipv4 unicast 172.16.101.2 soft in\nshow bgp ipv4 unicast 192.0.2.11/32 detail",
        "note": "Use after a deliberate policy change in the global phase. Check negotiated route refresh. After conversion use the corresponding vrf CORAL context.",
        "interpretation": "A narrow soft refresh re-evaluates routes without a deliberate hard session reset. Check the accepted prefix and attributes, then RIB/FIB."
      }
    ]
  },
  {
    "id": "bgp-xr-vpn",
    "title": "Convert the sites to VPNv4 and VPNv6",
    "summary": "Build transport, relocate the CE attachments and verify route import plus labels.",
    "dimension": "Configuration Knowledge",
    "minutes": 20,
    "blocks": [
      {
        "kind": "cli",
        "title": "PE1 · Add transport labels for remote PE loopbacks",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nmpls ldp\n router-id 10.0.0.1\n address-family ipv4\n  exit\n interface GigabitEthernet0/0/0/0\n  address-family ipv4\n   exit\n  exit\n exit\nmpls oam\n exit\ncommit\nend",
        "note": "Stage 03 also enables LDP on P1’s two PE links and PE2’s P1 link. RR1 has no LDP role. Core MTU is 1600 in the initial files. Verify actual MPLS payload headroom and image support.",
        "interpretation": "VPNv4 and VPNv6 each supply a service label. IPv4 LDP provides the outer transport to the egress PE. The customer IPv6 payload needs no IPv6 LDP transport."
      },
      {
        "kind": "cli",
        "title": "PE1 and P1 · Prove the PE2 transport FEC",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "show mpls ldp neighbor\nshow mpls ldp bindings 10.0.0.3/32 detail\nshow mpls ldp forwarding 10.0.0.3/32 detail\nshow cef ipv4 10.0.0.3/32 detail\nping mpls ipv4 10.0.0.3/32",
        "note": "Read the actual downstream binding and installed rewrite. Label values are dynamic.",
        "output": "Model checkpoints\nPE1 LDP peer: P1\nP1 LDP peers: PE1 and PE2\nPE1: outgoing transport label from P1 for PE2 /32\nP1 toward PE2: Pop under default implicit-null",
        "interpretation": "An IP path to PE2 permits the control session. The VPN data path additionally needs a usable transport rewrite to the PE owning its inner service label."
      },
      {
        "kind": "cli",
        "title": "PE1 · Move the CE attachment into CORAL",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nvrf CORAL\n address-family ipv4 unicast\n  import route-target 65000:100\n  export route-target 65000:100\n  exit\n address-family ipv6 unicast\n  import route-target 65000:100\n  export route-target 65000:100\n  exit\n exit\ninterface GigabitEthernet0/0/0/1\n no ipv4 address 172.16.101.1 255.255.255.252\n no ipv6 address 2001:db8:101:1::1/64\n vrf CORAL\n ipv4 address 172.16.101.1 255.255.255.252\n ipv6 address 2001:db8:101:1::1/64\n exit\ncommit\nend",
        "note": "Use the full stage 04 file for the complete conversion. It removes old global BGP neighbors first. Record an XR commit ID on each node and save a pre-conversion snapshot. Explicitly remove and reapply both interface addresses around the VRF move.",
        "interpretation": "Confirm the CE interface’s IPv4 and IPv6 addresses in CORAL after commit. PE1 RD is 65000:101, PE2 RD is 65000:102. Both AFs import and export RT65000:100."
      },
      {
        "kind": "cli",
        "title": "PE1 · Carry VPN families and move CE neighbors under CORAL",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nrouter bgp 65000\n bgp router-id 10.0.0.1\n address-family vpnv4 unicast\n  exit\n address-family vpnv6 unicast\n  exit\n neighbor 10.0.0.4\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv4 unicast\n   exit\n  address-family vpnv6 unicast\n   exit\n  exit\n vrf CORAL\n  rd 65000:101\n  bgp router-id 10.0.0.1\n  address-family ipv4 unicast\n   exit\n  address-family ipv6 unicast\n   exit\n  neighbor 172.16.101.2\n   remote-as 65101\n   address-family ipv4 unicast\n    route-policy CE1-IN-V4 in\n    route-policy CE1-OUT-V4 out\n    exit\n   exit\n  neighbor 2001:db8:101:1::2\n   remote-as 65101\n   address-family ipv6 unicast\n    route-policy CE1-IN-V6 in\n    route-policy CE1-OUT-V6 out\n    exit\n   exit\n  exit\n exit\ncommit\nend",
        "note": "Run as part of the complete stage 04 conversion after CORAL and its interface exist. The existing IPv4 RR session carries VPNv4 and VPNv6. The old global unicast AFs and IPv6 RR session are removed.",
        "interpretation": "Eligible locally learned CORAL routes are exported as VPN NLRI. The remote PE matches RT for import and resolves the preserved IPv4 PE next hop through MPLS. The CE still speaks ordinary unicast."
      },
      {
        "kind": "cli",
        "title": "RR1 · Reflect both VPN families",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nrouter bgp 65000\n no neighbor 2001:db8:0::1\n no neighbor 2001:db8:0::2\n no neighbor 2001:db8:0::3\n no neighbor 10.0.0.2\n neighbor 10.0.0.1\n  no address-family ipv4 unicast\n  exit\n neighbor 10.0.0.3\n  no address-family ipv4 unicast\n  exit\n no address-family ipv4 unicast\n no address-family ipv6 unicast\n exit\nrouter bgp 65000\n bgp router-id 10.0.0.4\n address-family vpnv4 unicast\n  retain route-target all\n  exit\n address-family vpnv6 unicast\n  retain route-target all\n  exit\n neighbor 10.0.0.1\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv4 unicast\n   route-reflector-client\n   exit\n  address-family vpnv6 unicast\n   route-reflector-client\n   exit\n  exit\n neighbor 10.0.0.3\n  remote-as 65000\n  update-source Loopback0\n  address-family vpnv4 unicast\n   route-reflector-client\n   exit\n  address-family vpnv6 unicast\n   route-reflector-client\n   exit\n  exit\n exit\ncommit\nend",
        "note": "This file removes global sessions and AFs and makes PE1/PE2 VPN clients. P1’s conversion removes its BGP process. RR1 has no customer VRF. Explicit retain route-target all documents the retention intent, which is also the XR RR default.",
        "interpretation": "Keep the PE next hop and RT extended community intact. XR iBGP carries extended communities automatically. Verify the remote PE receives the service label and the next hop belonging to its owner."
      },
      {
        "kind": "cli",
        "title": "PE1 · Follow NLRI, RT import and label recursion",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "show bgp vpnv4 unicast summary\nshow bgp vpnv6 unicast summary\nshow bgp vpnv4 unicast rd 65000:102 198.51.100.22/32 detail\nshow bgp vpnv6 unicast rd 65000:102 2001:db8:102:100::22/128 detail\nshow bgp vrf CORAL ipv4 unicast 198.51.100.22/32 detail\nshow bgp vrf CORAL ipv6 unicast 2001:db8:102:100::22/128 detail\nshow route vrf CORAL ipv4 198.51.100.22/32\nshow route vrf CORAL ipv6 2001:db8:102:100::22/128\nshow cef vrf CORAL ipv4 198.51.100.22/32 detail\nshow cef vrf CORAL ipv6 2001:db8:102:100::22/128 detail",
        "note": "Check IPv4 and IPv6 independently. XR prints an actual IPv4 next hop for VPNv6 over this IPv4 MPLS transport. Read the allocated service label from each VPN route.",
        "output": "Model fields\nRD: 65000:102\nRT: 65000:100\nVPN next hop: PE2 10.0.0.3\nImport destination: CORAL\nFIB: transport label to PE2 above PE2 service label\nP1: no customer IP route after conversion",
        "interpretation": "VPN-table presence does not establish VRF import. VRF import does not establish transport forwarding. Close the evidence chain with the sourced CE probes."
      },
      {
        "kind": "table",
        "headers": [
          "Device",
          "Packet action",
          "Lookup or decision"
        ],
        "rows": [
          [
            "CE1",
            "Sends original IPv4/IPv6 packet toward PE1.",
            "Ordinary CE BGP route to remote Loopback100."
          ],
          [
            "PE1",
            "Ingress interface selects CORAL. Push [transport-to-PE2, service-label-from-PE2], top first.",
            "VRF FIB selects remote route, then resolves PE2 Loopback0 via LDP."
          ],
          [
            "P1",
            "Looks up outer label and performs PHP under default implicit-null.",
            "Forwards remaining service label to PE2. Customer IP prefix is unnecessary here."
          ],
          [
            "PE2",
            "Consumes its service label and forwards the payload toward CE2.",
            "Service entry and CORAL route select local CE. Label allocation mode determines prefix or VRF context."
          ],
          [
            "CE2",
            "Receives original payload and returns toward Site 1.",
            "Repeat the same evidence chain in reverse. RR1 is outside this data path."
          ]
        ]
      }
    ]
  },
  {
    "id": "bgp-xe-ce",
    "title": "Configure the IOS XE customer edges",
    "summary": "Originate exact per-AF routes and prove the complete return path.",
    "dimension": "Configuration Knowledge",
    "minutes": 8,
    "blocks": [
      {
        "kind": "cli",
        "title": "CE1 · Originate exact site prefixes in each AF",
        "os": "Cisco IOS XE 17 · Catalyst 8000V / CSR1000V CE reference",
        "code": "configure terminal\nip prefix-list CE1-V4-OUT seq 10 permit 192.0.2.11/32\nip prefix-list CE1-V4-IN seq 10 permit 198.51.100.22/32\nipv6 prefix-list CE1-V6-OUT seq 10 permit 2001:db8:101:100::11/128\nipv6 prefix-list CE1-V6-IN seq 10 permit 2001:db8:102:100::22/128\nrouter bgp 65101\n bgp router-id 192.0.2.11\n no bgp default ipv4-unicast\n neighbor 172.16.101.1 remote-as 65000\n neighbor 2001:db8:101:1::1 remote-as 65000\n address-family ipv4 unicast\n  network 192.0.2.11 mask 255.255.255.255\n  neighbor 172.16.101.1 activate\n  neighbor 172.16.101.1 prefix-list CE1-V4-OUT out\n  neighbor 172.16.101.1 prefix-list CE1-V4-IN in\n exit-address-family\n address-family ipv6 unicast\n  network 2001:db8:101:100::11/128\n  neighbor 2001:db8:101:1::1 activate\n  neighbor 2001:db8:101:1::1 prefix-list CE1-V6-OUT out\n  neighbor 2001:db8:101:1::1 prefix-list CE1-V6-IN in\n exit-address-family\n exit\nend",
        "note": "Initial CE1 configuration creates Loopback100 and enables IPv6 forwarding. IOS XE applies commands as entered. The CE2 download supplies its own AS, prefixes, neighbors and exact filters.",
        "interpretation": "Each network statement requires the exact prefix in the local RIB. AF activation and route filtering are separate dependencies. CEs exchange ordinary IPv4/IPv6 unicast in both main phases."
      },
      {
        "kind": "cli",
        "title": "CE1 · Test both loopback-source return paths",
        "os": "Cisco IOS XE 17 · Catalyst 8000V / CSR1000V CE reference",
        "code": "show bgp ipv4 unicast summary\nshow bgp ipv6 unicast summary\nshow ip route 198.51.100.22\nshow ipv6 route 2001:db8:102:100::22/128\nping 198.51.100.22 source 192.0.2.11\nping ipv6 2001:db8:102:100::22 source 2001:db8:101:100::11",
        "note": "Repeat in reverse on CE2. Source from the advertised Loopback100 prefix. The policies do not export CE transit-link prefixes."
      }
    ]
  },
  {
    "id": "bgp-dual-home",
    "title": "Add a controlled second CE attachment",
    "summary": "Compare LOCAL_PREF, MED, reflection visibility and withdrawal-driven failover.",
    "dimension": "Configuration Knowledge",
    "minutes": 15,
    "blocks": [
      {
        "kind": "table",
        "headers": [
          "Optional extension",
          "Configuration or expected comparison"
        ],
        "rows": [
          [
            "New link",
            "CE1 Gi2 ↔ PE2 Gi0/0/0/2. PE2 172.16.111.1/30, CE1 172.16.111.2/30."
          ],
          [
            "IPv6 link",
            "PE2 2001:db8:111:1::1/64, CE1 2001:db8:111:1::2/64."
          ],
          [
            "Provider decision for Site 1",
            "PE1 inbound LOCAL_PREF200, PE2 backup LOCAL_PREF80, both AFs."
          ],
          [
            "CE1 decision for Site 2",
            "PE1 outbound MED50, PE2 backup MED150. Both providers seen by CE1 use AS65000."
          ],
          [
            "Admission",
            "New peer accepts SITE1 and exports SITE2 only. Unexpected prefixes fail the whitelist."
          ],
          [
            "Restore",
            "Restore PE1, PE2 and CE1 pre-extension snapshots or their recorded checkpoints, then remove the optional wire."
          ]
        ]
      },
      {
        "kind": "text",
        "text": "Apply only the optional-global or optional-vpn overlays matching the current checkpoint on PE1, PE2 and CE1. In global unicast inspect one prefix table. In VPN mode inspect the separate RD-qualified routes and the imported CORAL best path. Distinct RDs preserve separate VPN NLRIs at RR1."
      },
      {
        "kind": "cli",
        "title": "PE2 · Admit Site1 with backup preference",
        "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
        "code": "configure\nroute-policy CE1-BACKUP-IN-V4\n if destination in SITE1-V4 then\n  set local-preference 80\n  pass\n else\n  drop\n endif\nend-policy\ncommit\nend",
        "note": "The complete overlay attaches this policy to the new CE1 neighbor, adds its IPv6 equivalent, and raises the original PE1 path to LOCAL_PREF200.",
        "output": "Model prediction: the provider prefers the PE1 entry while it is qualified.",
        "interpretation": "A higher-LOCAL_PREF iBGP path can beat a directly learned eBGP path because LOCAL_PREF is considered earlier. After primary withdrawal, the remaining path can become best."
      },
      {
        "kind": "text",
        "text": "At CE1, compare received Site2 routes from both peers. With equal weight, LOCAL_PREF, AS_PATH length and origin, lower MED from the same AS favors PE1. Disable CE1’s original link, observe withdrawals and forwarding in both AFs, then restore it. Record actual loss with probe interval and VM timing granularity."
      }
    ]
  }
]

export const lab: Lab = {
  "setup": {
    "id": "bgp-lab-setup",
    "title": "Build six nodes in four progressive phases",
    "summary": "Start with global MP-BGP, then carry the same site prefixes in a labeled VPN.",
    "dimension": "Lab Experience",
    "minutes": 12,
    "blocks": [
      {
        "kind": "text",
        "text": "Create PE1, P1, PE2 and RR1 as IOS XR MPLS-capable nodes and CE1/CE2 as IOS XE nodes. In CML use available XRv9000 and Catalyst8000V or CSR1000V reference platforms. In EVE-NG select supported templates for your licensed images. Match actual data interface numbers and verify resources, VPNv6 and MPLS forwarding support. The public ASR9000 7.11.x guides are the XR syntax baseline. Manual build instructions and console configuration files are provided. Router and emulator execution are pending."
      },
      {
        "kind": "diagram",
        "title": "AS65000 core and two customer sites",
        "text": "                           RR1 (.4)\n                             | Gi0/0/0/0\n                             | 10.0.24.0/31\n                             | P1 Gi0/0/0/2\nCE1 ----- PE1 (.1) ---------- P1 (.2) -------- PE2 (.3) ----- CE2\nAS65101      | 10.0.12.0/31       10.0.23.0/31  |          AS65102\n           Gi0/0/0/0          Gi0/0/0/1        Gi0/0/0/0\nCE links use PE Gi0/0/0/1 and CE GigabitEthernet1.\nAll core IS-IS links have metric 10 in both directions."
      },
      {
        "kind": "table",
        "headers": [
          "Node",
          "Role / AS",
          "Loopback IPv4",
          "Loopback IPv6"
        ],
        "rows": [
          [
            "PE1",
            "Site 1 PE / 65000",
            "10.0.0.1/32",
            "2001:db8:0::1/128"
          ],
          [
            "P1",
            "Global transit, later MPLS P / 65000",
            "10.0.0.2/32",
            "2001:db8:0::2/128"
          ],
          [
            "PE2",
            "Site 2 PE / 65000",
            "10.0.0.3/32",
            "2001:db8:0::3/128"
          ],
          [
            "RR1",
            "Route reflector / 65000",
            "10.0.0.4/32",
            "2001:db8:0::4/128"
          ],
          [
            "CE1",
            "Site 1 / 65101",
            "192.0.2.11/32 on Loopback100",
            "2001:db8:101:100::11/128"
          ],
          [
            "CE2",
            "Site 2 / 65102",
            "198.51.100.22/32 on Loopback100",
            "2001:db8:102:100::22/128"
          ]
        ]
      },
      {
        "kind": "table",
        "headers": [
          "Endpoint A",
          "Endpoint B",
          "IPv4 A / B",
          "IPv6 A / B"
        ],
        "rows": [
          [
            "PE1 Gi0/0/0/0",
            "P1 Gi0/0/0/0",
            "10.0.12.0 / .1, /31",
            "2001:db8:12::0 / ::1, /127"
          ],
          [
            "P1 Gi0/0/0/1",
            "PE2 Gi0/0/0/0",
            "10.0.23.0 / .1, /31",
            "2001:db8:23::0 / ::1, /127"
          ],
          [
            "P1 Gi0/0/0/2",
            "RR1 Gi0/0/0/0",
            "10.0.24.0 / .1, /31",
            "2001:db8:24::0 / ::1, /127"
          ],
          [
            "PE1 Gi0/0/0/1",
            "CE1 Gi1",
            "172.16.101.1 / .2, /30",
            "2001:db8:101:1::1 / ::2, /64"
          ],
          [
            "PE2 Gi0/0/0/1",
            "CE2 Gi1",
            "172.16.102.1 / .2, /30",
            "2001:db8:102:1::1 / ::2, /64"
          ]
        ]
      },
      {
        "kind": "table",
        "headers": [
          "Phase",
          "Files to apply",
          "Evidence checkpoint"
        ],
        "rows": [
          [
            "Underlay",
            "initial/ on all6; stages/01-isis/ on4XR.",
            "Core dual-stack loopbacks and direct CE links reachable."
          ],
          [
            "Global BGP",
            "stages/02-global-bgp/ on all6.",
            "Both loopback-source CE probes work. P1 has customer global routes."
          ],
          [
            "MPLS transport",
            "stages/03-ldp/ on PE1,P1,PE2.",
            "Remote PE FECs and transport rewrites verified. Save global checkpoint."
          ],
          [
            "VPN conversion",
            "stages/04-vpn/ on all4XR.",
            "RT imports and service/transport labels verified. P1 customer BGP removed."
          ]
        ]
      },
      {
        "kind": "text",
        "text": "final-global/ describes the pre-VPN checkpoint including LDP. At that checkpoint inspect CEF to determine whether IPv4 BGP recursion imposes a transport label. The native IP walkthrough applies before stage03. final-vpn/ describes CORAL with P1 using IGP/LDP only. Complete final files assume a clean corresponding checkpoint and preserve image bootstrap/management separately."
      }
    ]
  },
  "milestones": [
    {
      "id": "bgp-lab-underlay",
      "title": "1 · Prove transport prerequisites",
      "summary": "Map interfaces and test source reachability before enabling BGP.",
      "dimension": "Lab Experience",
      "minutes": 15,
      "blocks": [
        {
          "kind": "list",
          "items": [
            "Apply initial files after matching each physical or virtual interface. Use console access and save clean snapshots.",
            "Apply all four stage01 files. PE1,PE2 andRR1 each have one Level2 neighbor; P1 has three.",
            "Probe both loopbacks to RR1 from every future BGP speaker. Check CE1 and CE2 exact connected site prefixes."
          ]
        },
        {
          "kind": "cli",
          "title": "PE1 · Prove both loopback session paths",
          "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
          "code": "show isis adjacency\nshow route ipv4 10.0.0.4/32\nshow route ipv6 2001:db8:0::4/128\nping 10.0.0.4 source 10.0.0.1\nping ipv6 2001:db8:0::4 source 2001:db8:0::1",
          "note": "Run after initial addressing and stage 01 on all core nodes. Repeat sourced loopback reachability from P1 and PE2. Read the observed IPv6 next hop, which can be a link-local address plus egress interface.",
          "output": "Model checkpoints\nPE1 Level 2 neighbor: P1, Up\nIPv4 RR1 route: via 10.0.12.1\nIPv6 RR1 route: resolved through P1\nBoth sourced probes: replies",
          "interpretation": "Loopback sessions need a return route to the selected local source. CE links and customer loopbacks are outside IS-IS."
        }
      ]
    },
    {
      "id": "bgp-lab-global",
      "title": "2 · Exchange global IPv4 and IPv6 routes",
      "summary": "Interpret negotiated families, policy acceptance, reflection and next-hop resolution.",
      "dimension": "Lab Experience",
      "minutes": 20,
      "blocks": [
        {
          "kind": "text",
          "text": "Apply each of the six stage02 files. PE policies precede neighbor attachment. RR1 has PE1,P1 andPE2 as clients in each global AF. Each PE’s IPv4 summary has its CE and RR1 peers, and the IPv6 summary has the corresponding IPv6 peers."
        },
        {
          "kind": "cli",
          "title": "PE1 · Read route acceptance, next hop and forwarding",
          "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
          "code": "show bgp ipv4 unicast summary\nshow bgp ipv6 unicast summary\nshow bgp ipv4 unicast 198.51.100.22/32 detail\nshow bgp ipv6 unicast 2001:db8:102:100::22/128 detail\nshow cef ipv4 198.51.100.22/32 detail\nshow cef ipv6 2001:db8:102:100::22/128 detail",
          "note": "Run after all six stage 02 files. Compare PE1, RR1 and P1 views before probing from CE1.",
          "output": "Model fields at PE1\nIPv4 route supplier: RR1 10.0.0.4\nIPv4 next hop: PE2 10.0.0.3\nIPv6 next hop: PE2 Loopback0, resolved\nAS_PATH inside AS65000: 65102\nReflection attributes: originator PE2, cluster RR1",
          "interpretation": "The supplier of the BGP UPDATE differs from the forwarding next hop. At this phase P1 has global customer routes and the native data path is CE1→PE1→P1→PE2→CE2."
        },
        {
          "kind": "cli",
          "title": "CE1 · Test both loopback-source return paths",
          "os": "Cisco IOS XE 17 · Catalyst 8000V / CSR1000V CE reference",
          "code": "show bgp ipv4 unicast summary\nshow bgp ipv6 unicast summary\nshow ip route 198.51.100.22\nshow ipv6 route 2001:db8:102:100::22/128\nping 198.51.100.22 source 192.0.2.11\nping ipv6 2001:db8:102:100::22 source 2001:db8:101:100::11",
          "note": "Repeat in reverse on CE2. Source from the advertised Loopback100 prefix. The policies do not export CE transit-link prefixes."
        },
        {
          "kind": "text",
          "text": "Explain the Site2 AS_PATH at PE1 versus CE1, the route supplier, its next hop, and the physical path. Save BGP detail, RIB/FIB and both sourced probes. RR1’s customer routes must retain the PE next hop."
        }
      ]
    },
    {
      "id": "bgp-lab-policy",
      "title": "3 · Separate session and policy failures",
      "summary": "Diagnose one missing AF and one policy boundary without a premature fix.",
      "dimension": "Lab Experience",
      "minutes": 12,
      "blocks": [
        {
          "kind": "text",
          "text": "From the global checkpoint, write evidence that distinguishes an IPv6 AF mismatch from a missing IPv4 inbound policy. Have a partner inject one fault at a time from the separate instructor workbook."
        },
        {
          "kind": "list",
          "items": [
            "FaultA: IPv4 works but CE1’s IPv6 session has no usable IPv6 AF on PE1. Inspect capabilities and AF configuration.",
            "FaultB: CE1’s IPv4 session is Established but its prefix is not admitted on PE1. Check attached input policy and exact prefix.",
            "Restore the fault, refresh only the affected AF when appropriate, then recheck route evidence and both CE probes."
          ]
        }
      ]
    },
    {
      "id": "bgp-lab-transport",
      "title": "4 · Add and prove MPLS transport",
      "summary": "Read real allocated labels before moving customer interfaces.",
      "dimension": "Lab Experience",
      "minutes": 12,
      "blocks": [
        {
          "kind": "text",
          "text": "Apply stage03 on PE1,P1,PE2. Record the binding for each remote PE loopback and installed rewrite. RR1 has no LDP dependency."
        },
        {
          "kind": "cli",
          "title": "PE1 and P1 · Prove the PE2 transport FEC",
          "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
          "code": "show mpls ldp neighbor\nshow mpls ldp bindings 10.0.0.3/32 detail\nshow mpls ldp forwarding 10.0.0.3/32 detail\nshow cef ipv4 10.0.0.3/32 detail\nping mpls ipv4 10.0.0.3/32",
          "note": "Read the actual downstream binding and installed rewrite. Label values are dynamic.",
          "output": "Model checkpoints\nPE1 LDP peer: P1\nP1 LDP peers: PE1 and PE2\nPE1: outgoing transport label from P1 for PE2 /32\nP1 toward PE2: Pop under default implicit-null",
          "interpretation": "An IP path to PE2 permits the control session. The VPN data path additionally needs a usable transport rewrite to the PE owning its inner service label."
        },
        {
          "kind": "cli",
          "title": "Record each XR global checkpoint ID",
          "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
          "code": "show configuration commit list",
          "note": "After verifying the global/LDP checkpoint, record the latest commit ID separately for PE1,P1,PE2,RR1. Take an emulator snapshot too. IDs are local to each node."
        }
      ]
    },
    {
      "id": "bgp-lab-vpn",
      "title": "5 · Move the sites into CORAL",
      "summary": "Verify VPN NLRI, import, forwarding and both customer AFs.",
      "dimension": "Lab Experience",
      "minutes": 25,
      "blocks": [
        {
          "kind": "text",
          "text": "Apply all four stage04 files. PE1/PE2 remove their global CE neighbors, explicitly relocate link addresses into CORAL and create VRF eBGP neighbors. RR1’s IPv4 sessions carry VPNv4/v6. P1’s BGP process is removed. Resolve any failed commit with show configuration failed before proceeding."
        },
        {
          "kind": "cli",
          "title": "PE1 · Follow NLRI, RT import and label recursion",
          "os": "Cisco IOS XR 7.11.x · ASR 9000 syntax reference",
          "code": "show bgp vpnv4 unicast summary\nshow bgp vpnv6 unicast summary\nshow bgp vpnv4 unicast rd 65000:102 198.51.100.22/32 detail\nshow bgp vpnv6 unicast rd 65000:102 2001:db8:102:100::22/128 detail\nshow bgp vrf CORAL ipv4 unicast 198.51.100.22/32 detail\nshow bgp vrf CORAL ipv6 unicast 2001:db8:102:100::22/128 detail\nshow route vrf CORAL ipv4 198.51.100.22/32\nshow route vrf CORAL ipv6 2001:db8:102:100::22/128\nshow cef vrf CORAL ipv4 198.51.100.22/32 detail\nshow cef vrf CORAL ipv6 2001:db8:102:100::22/128 detail",
          "note": "Check IPv4 and IPv6 independently. XR prints an actual IPv4 next hop for VPNv6 over this IPv4 MPLS transport. Read the allocated service label from each VPN route.",
          "output": "Model fields\nRD: 65000:102\nRT: 65000:100\nVPN next hop: PE2 10.0.0.3\nImport destination: CORAL\nFIB: transport label to PE2 above PE2 service label\nP1: no customer IP route after conversion",
          "interpretation": "VPN-table presence does not establish VRF import. VRF import does not establish transport forwarding. Close the evidence chain with the sourced CE probes."
        },
        {
          "kind": "table",
          "headers": [
            "Device",
            "Packet action",
            "Lookup or decision"
          ],
          "rows": [
            [
              "CE1",
              "Sends original IPv4/IPv6 packet toward PE1.",
              "Ordinary CE BGP route to remote Loopback100."
            ],
            [
              "PE1",
              "Ingress interface selects CORAL. Push [transport-to-PE2, service-label-from-PE2], top first.",
              "VRF FIB selects remote route, then resolves PE2 Loopback0 via LDP."
            ],
            [
              "P1",
              "Looks up outer label and performs PHP under default implicit-null.",
              "Forwards remaining service label to PE2. Customer IP prefix is unnecessary here."
            ],
            [
              "PE2",
              "Consumes its service label and forwards the payload toward CE2.",
              "Service entry and CORAL route select local CE. Label allocation mode determines prefix or VRF context."
            ],
            [
              "CE2",
              "Receives original payload and returns toward Site 1.",
              "Repeat the same evidence chain in reverse. RR1 is outside this data path."
            ]
          ]
        },
        {
          "kind": "cli",
          "title": "CE1 · Test both loopback-source return paths",
          "os": "Cisco IOS XE 17 · Catalyst 8000V / CSR1000V CE reference",
          "code": "show bgp ipv4 unicast summary\nshow bgp ipv6 unicast summary\nshow ip route 198.51.100.22\nshow ipv6 route 2001:db8:102:100::22/128\nping 198.51.100.22 source 192.0.2.11\nping ipv6 2001:db8:102:100::22 source 2001:db8:101:100::11",
          "note": "Repeat in reverse on CE2. Source from the advertised Loopback100 prefix. The policies do not export CE transit-link prefixes."
        },
        {
          "kind": "text",
          "text": "Locate RD65000:102 at RR1 and PE1, RT65000:100, and the service label. Find CORAL’s imported route, then its IPv4 transport recursion. Capture both core links where supported and identify outer versus inner labels. Repeat for IPv6, and verify P1 has no customer IP route while sourced CE probes work."
        }
      ]
    },
    {
      "id": "bgp-lab-faults",
      "title": "6 · Isolate import and forwarding failures",
      "summary": "Find the first broken dependency and validate the repaired service.",
      "dimension": "Lab Experience",
      "minutes": 20,
      "blocks": [
        {
          "kind": "list",
          "items": [
            "FaultC: PE1 receives Site2 VPNv4 with its expected RD,RT,next hop, but CORAL has no usable IPv4 route. Check import separately. VPNv6 is the comparison.",
            "FaultD: VPN routes and imports exist, but an MPLS dependency fails between P1 andPE2. Inspect the PE2 loopback FEC, downstream binding and outer-label forwarding.",
            "Record symptom, hypotheses, decisive command/field, correction and both restored customer directions. Return to the clean VPN snapshot between tickets."
          ]
        },
        {
          "kind": "text",
          "text": "Exact fault controls and restorations are in the instructor workbook. Write your diagnosis before opening the solutions."
        }
      ]
    },
    {
      "id": "bgp-lab-dual-home",
      "title": "7 · Compare selection and failover with two attachments",
      "summary": "Create observable alternate paths using the optional CE1 link.",
      "dimension": "Lab Experience",
      "minutes": 25,
      "blocks": [
        {
          "kind": "table",
          "headers": [
            "Optional extension",
            "Configuration or expected comparison"
          ],
          "rows": [
            [
              "New link",
              "CE1 Gi2 ↔ PE2 Gi0/0/0/2. PE2 172.16.111.1/30, CE1 172.16.111.2/30."
            ],
            [
              "IPv6 link",
              "PE2 2001:db8:111:1::1/64, CE1 2001:db8:111:1::2/64."
            ],
            [
              "Provider decision for Site 1",
              "PE1 inbound LOCAL_PREF200, PE2 backup LOCAL_PREF80, both AFs."
            ],
            [
              "CE1 decision for Site 2",
              "PE1 outbound MED50, PE2 backup MED150. Both providers seen by CE1 use AS65000."
            ],
            [
              "Admission",
              "New peer accepts SITE1 and exports SITE2 only. Unexpected prefixes fail the whitelist."
            ],
            [
              "Restore",
              "Restore PE1, PE2 and CE1 pre-extension snapshots or their recorded checkpoints, then remove the optional wire."
            ]
          ]
        },
        {
          "kind": "text",
          "text": "Start from a clean global or VPN checkpoint and apply only the matching overlay on PE1,PE2,CE1. Read all candidates at PE2,RR1,CE1. In VPN mode compare per-RD NLRIs with CORAL’s chosen path."
        },
        {
          "kind": "list",
          "items": [
            "Predict the AS65000 path for Site1 under LOCAL_PREF200 versus80 and verify inbound policy results.",
            "Predict CE1’s Site2 path under MED50 versus150. Check earlier attributes and common neighborAS first.",
            "Shut CE1 GigabitEthernet1, observe withdrawal and backup forwarding for both AFs, then restore it. Record measured loss and timing.",
            "Restore pre-extension checkpoints on PE1,PE2,CE1 and remove the optional wire. Recheck the single-homed baseline before continuing."
          ]
        }
      ]
    }
  ],
  "solutions": {
    "id": "bgp-lab-solutions",
    "title": "Instructor solutions and evidence standards",
    "summary": "Justify each result from routing state and an observed forwarding test.",
    "dimension": "Lab Experience",
    "minutes": 12,
    "blocks": [
      {
        "kind": "table",
        "headers": [
          "Checkpoint",
          "Expected evidence and reasoning"
        ],
        "rows": [
          [
            "Global PE1 route",
            "Site2 arrives from RR1 with AS_PATH65102 and PE2 next hop. The IPv6 route has PE2’s reachable IPv6 next hop. Reflection attributes identify PE2 and RR1."
          ],
          [
            "CE1 view",
            "Site2 normally has AS_PATH65000 65102 and direct PE1 next hop. The loopback-source probe also tests the advertised return route."
          ],
          [
            "P1 before MPLS",
            "P1 receives global customer IPv4/IPv6 routes from RR1. The native data path bypasses RR1."
          ],
          [
            "VPN control plane",
            "RD65000:102 distinguishes Site2, RT65000:100 authorizes CORAL import, next hop10.0.0.3 identifies PE2. VPNv6 has its own NLRI and service label over IPv4 LDP transport."
          ],
          [
            "VPN forwarding",
            "PE1 pushes transport/service labels. P1 pops the transport label. PE2 consumes its service label and forwards in CORAL towardCE2."
          ],
          [
            "FaultA",
            "Restore PE1 IPv6 neighbor AF and its CE1-IN-V6/CE1-OUT-V6 policy attachments. Validate capabilities and the exact IPv6 prefix."
          ],
          [
            "FaultB",
            "Restore CE1-IN-V4 on PE1’s global CE IPv4 AF. Refresh that AF and verify accepted prefix, propagation and CE traffic."
          ],
          [
            "FaultC",
            "Restore PE1 CORAL IPv4 importRT65000:100 and remove injected65000:999. The VPN NLRI was already received. Recheck VRF import,FIB,probe."
          ],
          [
            "FaultD",
            "Restore LDP on P1 Gi0/0/0/1 towardPE2 and verify PE2/32 FEC, forwarding and both customer AFs. Service labels do not substitute for broken transport."
          ],
          [
            "Optional extension",
            "Higher LOCAL_PREF selects the original provider entry. CE1 compares MED from two peers in AS65000 subject to earlier ties. Withdrawal makes the remaining qualified path usable."
          ]
        ]
      },
      {
        "kind": "text",
        "text": "For rollback, preview show configuration rollback changes to <recorded-id> diff, then use rollback configuration to <recorded-id> from XR EXEC in the isolated lab. Substitute each node’s own global checkpoint ID. Restore CE snapshots after optional changes. Recheck both global AFs, sourced customer probes and transport."
      },
      {
        "kind": "text",
        "text": "Require the router, address family, routing context, decisive field and next verification for each diagnosis. Credit captured lab observations separately from a paper prediction. Virtual timing and forwarding claims apply to the tested image and host."
      }
    ]
  },
  "downloads": [
    {
      "title": "Manual setup and student workbook",
      "path": "downloads/bgp/README.md"
    },
    {
      "title": "Instructor controls and solutions",
      "path": "downloads/bgp/instructor.md"
    },
    {
      "title": "Topology and phase model",
      "path": "downloads/bgp/topology.json"
    },
    {
      "title": "All staged and final configurations (ZIP)",
      "path": "downloads/bgp/bgp-configs.zip"
    },
    {
      "title": "PE1 final VPN configuration",
      "path": "downloads/bgp/final-vpn/PE1.cfg"
    },
    {
      "title": "P1 final VPN configuration",
      "path": "downloads/bgp/final-vpn/P1.cfg"
    },
    {
      "title": "PE2 final VPN configuration",
      "path": "downloads/bgp/final-vpn/PE2.cfg"
    },
    {
      "title": "RR1 final VPN configuration",
      "path": "downloads/bgp/final-vpn/RR1.cfg"
    },
    {
      "title": "CE1 final VPN configuration",
      "path": "downloads/bgp/final-vpn/CE1.cfg"
    },
    {
      "title": "CE2 final VPN configuration",
      "path": "downloads/bgp/final-vpn/CE2.cfg"
    }
  ]
}
