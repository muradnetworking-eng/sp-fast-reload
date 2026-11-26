# MPLS L3VPN: two overlapping dual-stack tenants

Build ACME and BETA IPv4/IPv6 VPNs across an IPv4 OSPF/LDP core. The syntax reference is Cisco ASR 9000 IOS XR 7.11.x for provider nodes and IOS XE 17.x C8000V candidates for customer nodes. Reviewed against public Cisco/IETF documentation on 2026-11-27. Device/emulator execution and packet capture validation are pending. All expected results below are models for the supplied topology.

## Manual CML / EVE-NG setup

Create five MPLS-capable IOS XR nodes named PE1, P1, P2, PE2 and RR1. Create four IOS XE nodes named CE-A1, CE-A2, CE-B1 and CE-B2. In CML, use available licensed XRv 9000 and C8000V images; in EVE-NG, use supported templates for your licensed images. Follow the vendor resource requirements. Confirm interface naming, LDP/MPLS VPN forwarding, VPNv6/6VPE, OAM and RPL support on the actual image.

No tested CML YAML/EVE UNL import is supplied. Wire the eight links manually. Preserve console access, management/bootstrap configuration and image-specific prerequisites outside these data-plane examples.

~~~text
CE-A1 (ACME) --- PE1 --- P1 --- P2 --- PE2 --- CE-A2 (ACME)
CE-B1 (BETA) ----/        |              \---- CE-B2 (BETA)
                        RR1
~~~

The provider AS is 65000. OSPFv2 process CORE uses area 0; each core/control link costs 10 in both directions and each Loopback0 costs 1. PE1 to PE2's /32 has metric 31; PE1 to RR1's /32 has metric 21. LDP runs only on PE1–P1, P1–P2 and P2–PE2. RR1's branch carries IP control traffic, not VPN customer data.

| Node | OS syntax reference | ASN | Loopback0 | BGP router ID |
| --- | --- | --- | --- | --- |
| PE1 | IOS XR 7.11.x ASR 9000 | 65000 | 10.0.0.1/32 | 10.0.0.1 |
| P1 | IOS XR 7.11.x ASR 9000 | Provider domain | 10.0.0.2/32 | No BGP |
| P2 | IOS XR 7.11.x ASR 9000 | Provider domain | 10.0.0.3/32 | No BGP |
| PE2 | IOS XR 7.11.x ASR 9000 | 65000 | 10.0.0.4/32 | 10.0.0.4 |
| RR1 | IOS XR 7.11.x ASR 9000 | 65000 | 10.0.0.5/32 | 10.0.0.5 |
| CE-A1 | IOS XE 17.x C8000V | 65011 | 10.60.1.1/32; 2001:db8:60:1::1/128 | 192.0.2.11 |
| CE-A2 | IOS XE 17.x C8000V | 65012 | 10.60.2.2/32; 2001:db8:60:2::2/128 | 192.0.2.12 |
| CE-B1 | IOS XE 17.x C8000V | 65021 | 10.60.1.1/32; 2001:db8:60:1::1/128 | 192.0.2.21 |
| CE-B2 | IOS XE 17.x C8000V | 65022 | 10.60.2.2/32; 2001:db8:60:2::2/128 | 192.0.2.22 |

The CE router IDs deliberately remain unique even where advertised addresses overlap. A BGP router ID is a process identifier; it need not be an advertised interface address.

| Link | Endpoint A | Endpoint B | Function |
| --- | --- | --- | --- |
| PE1–P1 | PE1 Gi0/0/0/0 10.0.12.0/31 | P1 Gi0/0/0/0 10.0.12.1/31 | OSPF + LDP |
| P1–P2 | P1 Gi0/0/0/1 10.0.23.0/31 | P2 Gi0/0/0/0 10.0.23.1/31 | OSPF + LDP |
| P2–PE2 | P2 Gi0/0/0/1 10.0.34.0/31 | PE2 Gi0/0/0/0 10.0.34.1/31 | OSPF + LDP |
| P1–RR1 | P1 Gi0/0/0/2 10.0.25.0/31 | RR1 Gi0/0/0/0 10.0.25.1/31 | OSPF; IP control only |
| PE1–CE-A1 | PE1 Gi0/0/0/1 172.16.11.0/31; 2001:db8:11::/127 | CE-A1 Gi1 172.16.11.1/31; 2001:db8:11::1/127 | ACME |
| PE1–CE-B1 | PE1 Gi0/0/0/2 172.16.11.0/31; 2001:db8:11::/127 | CE-B1 Gi1 172.16.11.1/31; 2001:db8:11::1/127 | BETA |
| PE2–CE-A2 | PE2 Gi0/0/0/1 172.16.22.0/31; 2001:db8:22::/127 | CE-A2 Gi1 172.16.22.1/31; 2001:db8:22::1/127 | ACME |
| PE2–CE-B2 | PE2 Gi0/0/0/2 172.16.22.0/31; 2001:db8:22::/127 | CE-B2 Gi1 172.16.22.1/31; 2001:db8:22::1/127 | BETA |

The /31 and /127 links are two-endpoint routed links. RFC 6164 permits both /127 endpoint values; 2001:db8:11:: is a concrete address within that /127, not the unspecified address ::. Confirm the actual image accepts and forwards this plan before proceeding.

| Tenant | PE1 RD | PE2 RD | Import/export RT in IPv4 and IPv6 |
| --- | --- | --- | --- |
| ACME | 65000:101 | 65000:102 | 65000:100 |
| BETA | 65000:201 | 65000:202 | 65000:200 |

RD differentiates VPN NLRI; RT extended communities control membership. The same customer prefixes coexist under distinct RDs and VRF tables. RR1 retains both VPN families without local VRFs. P1/P2 have no customer BGP or VRFs.

## Files and application order

Extract mpls-l3vpn-configs.zip. XR files start from EXEC, enter configuration, commit and end. XE files apply as entered. Verify every commit before continuing; inspect show configuration failed after rejection. Save a known snapshot/checkpoint after each healthy stage.

1. Apply initial/ to all nine nodes.
2. Apply stages/01-underlay/ to all five XR nodes.
3. Apply stages/02-vrfs/ to PE1 and PE2.
4. Apply stages/03-pe-ce/ to PE1, PE2 and all four CEs.
5. Apply stages/04-vpnv4/ to PE1, PE2 and RR1.
6. Apply stages/05-vpnv6/ to PE1, PE2 and RR1.

Initial PE customer ports are unaddressed and shutdown. The VRF stage creates the context first, then assigns repeated addresses and enables the ports. Moving an already addressed XR interface into another VRF can remove its addresses; reapply and verify them after any such change.

The final/ directory contains nine complete clean baseline files. These describe desired configuration, not a universal replacement operation. Pasting them additively will not delete unknown wrong RTs, extra loopbacks, policy overrides or unrelated changes. Use paired restore files or a known saved checkpoint for recovery.

The faults/ directory and optional/ directories are isolated controls, never initial baseline stages. Do not combine same-AS and unique-marker experiments.

## 1. Prove the underlay

After stage 01, expected OSPF FULL counts are PE1/P1/P2/PE2/RR1 = 1/3/2/1/1. Expected operational LDP counts on the data chain are 1/2/2/1. RR1 has no LDP.

On PE1:

~~~text
show ospf neighbor
show route ipv4 10.0.0.4/32
show route ipv4 10.0.0.5/32
ping 10.0.0.4 source 10.0.0.1
ping 10.0.0.5 source 10.0.0.1
show mpls ldp neighbor
show mpls ldp bindings 10.0.0.4/32 detail
show cef ipv4 10.0.0.4/32 detail
ping mpls ipv4 10.0.0.4/32
traceroute mpls ipv4 10.0.0.4/32
~~~

Check the reverse direction too. Each LDP router ID and explicit discovery transport-address equals its Loopback0. Link discovery and TCP transport remain different dependencies. A successful ordinary PE-loopback ping alone does not prove an end-to-end labeled transport.

## 2. Prove attachment and local PE–CE routing

After stage 02, check both PE VRFs and both customer interfaces:

~~~text
show vrf all
show running-config vrf
show running-config interface GigabitEthernet0/0/0/1
show running-config interface GigabitEthernet0/0/0/2
show route vrf ACME ipv4
show route vrf BETA ipv6
~~~

Check both IPv4 and IPv6 route tables for both tenants. Connected customer addresses belong to VRFs, not the default table. The CE can test its local PE using the directly connected address in each family.

After stage 03, verify local CE eBGP:

~~~text
show bgp vrf ACME ipv4 unicast summary
show bgp vrf ACME ipv6 unicast summary
show bgp vrf BETA ipv4 unicast summary
show bgp vrf BETA ipv6 unicast summary
show bgp vrf ACME ipv4 unicast 10.60.1.1/32
show bgp vrf BETA ipv6 unicast 2001:db8:60:1::1/128
~~~

Use site1 prefixes on PE1 and site2 prefixes on PE2. Remote host connectivity is not expected yet.

XR SITE1-V4/V6 and SITE2-V4/V6 contain exact host routes. VPN-S1-IN4/6 accepts only the local site1 host and VPN-S1-OUT4/6 permits only the remote site2 host. PE2 uses VPN-S2 equivalents. These prefix sets are shared across tenants because the address contract is identical; they do not create route leaking.

Each CE uses SITE-LOCAL4/6 and SITE-REMOTE4/6 prefix lists, with CE-IN4/6 and CE-OUT4/6 route maps. Network statements originate only the CE's Loopback0 hosts. No broad connected redistribution is configured. Nonmatching prefix-list/route-map and RPL branches deny the update.

## 3. Prove VPNv4 distribution and import

After stage 04, check RR1 and both PEs:

~~~text
show bgp vpnv4 unicast summary
show bgp vpnv4 unicast rd 65000:102 10.60.2.2/32 detail
show bgp vpnv4 unicast rd 65000:202 10.60.2.2/32 detail
~~~

RR1 should retain both tenants' routes, distinguish the originating RDs and preserve the egress PE next hop. For site2 routes, the next hop is PE2 10.0.0.4, not RR1 10.0.0.5. The RR configuration explicitly retains route-target all and marks both PE clients in each VPN AF. There is no RR next-hop-self.

On PE1:

~~~text
show bgp vrf ACME ipv4 unicast 10.60.2.2/32
show route vrf ACME ipv4 10.60.2.2/32 detail
show cef vrf ACME ipv4 10.60.2.2/32 detail
show bgp vrf BETA ipv4 unicast 10.60.2.2/32
show route vrf BETA ipv4 10.60.2.2/32 detail
show cef vrf BETA ipv4 10.60.2.2/32 detail
~~~

For ACME, correlate remote RD 65000:102, RT 65000:100, PE2 next hop, VPN label, imported route and transport recursion. BETA uses remote RD 65000:202 and RT 65000:200. The RD in the received VPN table identifies the originating PE/VRF; do not substitute PE1's local RD when looking for PE2's route.

VPN RTs are extended communities. IOS XR VPN iBGP carries them with the VPN paths without an IOS XE-style send-community extended command in this configuration. Prove the attributes in received route detail; Established alone does not prove a route, label or RT.

## 4. Prove VPNv6 independently

After stage 05:

~~~text
show bgp vpnv6 unicast summary
show bgp vpnv6 unicast rd 65000:102 2001:db8:60:2::2/128 detail
show bgp vpnv6 unicast rd 65000:202 2001:db8:60:2::2/128 detail
show bgp vrf ACME ipv6 unicast 2001:db8:60:2::2/128
show route vrf ACME ipv6 2001:db8:60:2::2/128 detail
show cef vrf ACME ipv6 2001:db8:60:2::2/128 detail
~~~

Repeat the VRF checks for BETA. VPNv6 service uses the same IPv4 MPLS core: this is 6VPE, not native IPv6 routing in P1/P2 and not global IPv6 labeled-unicast 6PE. The service label identifies IPv6 VPN forwarding at the PE. The XR7.11 guide specifies that XR displays actual IPv4 next-hop addresses for VPNv6, so expect next-hop 10.0.0.4 in the modeled route logic.

A working VPNv4 session does not prove VPNv6 activation or import. Check global AF, neighbor AF, RR client AF, VRF IPv6 RTs, local CE IPv6 learning, labels and recursion separately.

## 5. Positive service tests

Run each row separately and record the CE name, tenant, source, destination, AF and result. Source Loopback0 belongs to the allowed host-prefix contract, so return reachability exists.

| Source CE | IPv4 destination | IPv6 destination | Tenant |
| --- | --- | --- | --- |
| CE-A1 | 10.60.2.2 | 2001:db8:60:2::2 | ACME |
| CE-A2 | 10.60.1.1 | 2001:db8:60:1::1 | ACME |
| CE-B1 | 10.60.2.2 | 2001:db8:60:2::2 | BETA |
| CE-B2 | 10.60.1.1 | 2001:db8:60:1::1 | BETA |

Site1 CE example:

~~~text
show ip bgp 10.60.2.2
show ip route 10.60.2.2
show bgp ipv6 unicast 2001:db8:60:2::2/128
show ipv6 route 2001:db8:60:2::2/128
ping 10.60.2.2 source Loopback0
ping ipv6 2001:db8:60:2::2 source Loopback0
~~~

A PE-generated probe with a provider or attachment source may lack a return route at the remote CE: attachment/provider prefixes are deliberately not exported by these host-only policies. Such a failure is not sufficient to declare the VPN broken. Use the contracted CE host sources for end-to-end acceptance.

## 6. Explain the label stack

For CE-A1 to CE-A2 in ACME:

| Link/router | Modeled operation |
| --- | --- |
| PE1 ingress | Gi0/0/0/1 selects ACME; VRF destination lookup selects remote service |
| PE1→P1 | Push [L_P1(PE2 loopback), V_PE2_ACME4] over customer IPv4 |
| P1→P2 | Swap outer L_P1 to L_P2; preserve V_PE2_ACME4 |
| P2→PE2 | Pop only outer transport label; service label remains |
| PE2 | Interpret service label, select ACME forwarding, send unlabelled IP toward CE-A2 |

IPv6 uses its VPNv6 service label/context while the outer transport still resolves PE2's IPv4 loopback. BETA carries its own service context. The service-label allocation mode is not forced in the baseline; observe whether the image allocates by prefix or a shared context. Do not grade for a particular number or assume one label per route.

Use VPN BGP detail, VRF CEF, transport bindings/LFIB and actual link capture when supported. Symbols L_P1/L_P2/V_PE2_ACME4/6 are explanations, not router output. PHP does not imply plain customer IP reaches PE2 in a two-label VPN.

Core XR interfaces set frame MTU 1600 and IPv4 MTU 1500. With untagged Ethernet accounting, 1600 includes 14 bytes of Ethernet header and leaves 1586 bytes for payload. A 1500-byte IP packet plus two labels needs 1508 bytes of MPLS payload. Validate the actual effective MTU and stack depth rather than assuming configured values prove hardware/emulator behavior.

## 7. Isolation experiment with unique ACME routes

Overlapping destination pings alone cannot prove isolation. Both tenants legitimately contain the same host addresses, so the address does not identify which VPN answered. First inspect VRF attachment, RTs, imported RDs and the egress service context.

For a positive/negative route test, start from the clean final baseline and apply the four optional/isolation/*-apply.cfg files to their named nodes:

- CE-A2 adds Loopback99 198.51.100.222/32 and 2001:db8:ac:2::222/128, originates them and permits them outbound.
- PE2 attaches ACME-only inbound policies permitting the baseline host and test marker.
- PE1 attaches ACME-only outbound policies permitting those routes toward CE-A1.
- CE-A1 expands only its permitted remote prefix lists.

BETA policy attachments, RTs and CEs are untouched. The optional policy attachment names are ACME-TEST-IN4/6 on PE2 and ACME-TEST-OUT4/6 on PE1.

Verify both PEs:

~~~text
show route vrf ACME ipv4 198.51.100.222/32
show route vrf BETA ipv4 198.51.100.222/32
show route vrf ACME ipv6 2001:db8:ac:2::222/128
show route vrf BETA ipv6 2001:db8:ac:2::222/128
show route ipv4 198.51.100.222/32
show route ipv6 2001:db8:ac:2::222/128
~~~

Expected: ACME contains the marker; BETA and default RIBs do not. Inspect VPN BGP route detail at RR1 and PE1 to prove RT 65000:100 and the originating ACME RD. The baseline has no default route or broader covering route to these markers.

From CE-A1:

~~~text
ping 198.51.100.222 source Loopback0
ping ipv6 2001:db8:ac:2::222 source Loopback0
~~~

Run the same probes from CE-B1 as supporting negative evidence, and confirm CE-B1 lacks those routes. A failed ping alone is not an isolation proof; combine it with absence from BETA routing and the correct export/import membership.

Apply all four matching restore files. Refresh only affected neighbors/AFs if necessary. Verify withdrawal from ACME/CE-A1 and continued baseline host reachability in both tenants. Do not combine this experiment with the optional same-AS phase.

## 8. Optional same-customer-AS experiment

Use a clean distinct-AS baseline. The sequence changes CE-A2 from AS 65012 to 65011, matching CE-A1. It intentionally replaces the isolated CE-A2 BGP process while preserving addresses and prefix policies.

1. Apply optional/same-as/01-change-as/CE-A2.cfg and PE2.cfg. Wait for both CE AFs to reestablish. The remote site's AS_PATH contains 65011. Locate the first rejection boundary: XR can suppress an update containing the target CE's AS before transmission, depending on its outbound loop checks/update group. Do not assume the CE received it.
2. Inspect actual provider advertisements and the CE path or a permitted CE-facing capture. If the unchanged update was sent, compare the CE's own-AS rejection with bounded neighbor <PE> allowas-in 1 using optional/same-as/02-allowas-in/ on both CEs and both AFs. Exact prefix filters remain. Allowas-in does not rewrite AS_PATH and cannot repair provider suppression. If the PE did not send the path, record that boundary; do not claim CE-only recovery.
3. Remove the CE exceptions with optional/same-as/03-remove-allowas-in/. As a separate provider remedy, apply optional/same-as/provider-rpl/PE1-apply.cfg and PE2-apply.cfg. SAME-AS-S1-OUT4/6 and SAME-AS-S2-OUT4/6 retain each site's exact remote host allowlist and run replace as-path '65011' only in the permitted branch. This replaces that matching sequence with local AS65000, retains other ASes and changes only ACME CE outbound policy. Inspect actual advertisements, CE paths and probes; source review is not a guarantee of processing on an untested image.
4. Apply both provider-rpl restore files first, ensure both CE allowas-in exceptions are removed, then apply optional/same-as/04-restore-as/ to CE-A2 and PE2. Prove the original ASNs, policy attachments and service.

Example provider advertisement checks on PE1:

~~~text
show bgp vrf ACME ipv4 unicast advertised neighbor 172.16.11.1
show bgp vrf ACME ipv6 unicast advertised neighbor 2001:db8:11::1
~~~

Read the corresponding CE accepted table and, when a rejected incoming UPDATE must be inspected, use a supported capture or deliberately configured inbound soft-reconfiguration/refresh workflow. Do not issue received-routes and assume rejected updates were retained when that feature was not enabled.

Native IOS XR as-override is not shipped as the recommended remedy here. The cumulative ASR9000 BGP command reference marks it deprecated from 7.11.1 and retained for OpenConfig compatibility, rather than intended native CLI use. Older guide examples must be release-qualified. The targeted RPL action is documented in the [ASR9000 RPL command reference](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/routing/command/reference/b-routing-cr-asr9000/routing-policy-language-commands.html); the [XR7.11 RPL guide](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-routing-policy.html) lists replace at the neighbor-out attach point. It is not whole-path replacement or broad private-AS removal.

This is a single-homed controlled lab. Allowing your own AS weakens a loop check. Multihoming or site reentry needs a complete loop-prevention design, including site-of-origin or appropriate site policy where applicable.

## Blind faults and recovery

Ask the instructor for one isolated fault at a time. The four baseline paired controls are:

| Symptom scope to investigate | Changed dependency |
| --- | --- |
| ACME IPv4 remote import at PE2 | Import RT only |
| CE-A1 IPv4 origin disappears remotely | PE1 inbound CE policy only |
| VPNv6 service fails while VPNv4 can remain | PE2 RR neighbor AF only |
| IP underlay/BGP up, labeled service fails | P1 LDP link activation only |

Do not open the instructor key before collecting evidence. State tenant, AF and direction, then follow local CE learning → VPN export/RR distribution → RT import → next-hop/LDP recursion → CEF/LFIB → end-to-end probe. Check the expected scope of impact for each fault: a tenant policy fault can be local, PE2 VPNv6 removal affects both tenants' IPv6, and the core LDP fault can affect every VPN service. Make the smallest correction, then verify all tenant, family and direction pairs after restoration, including those expected to remain unaffected.

With a missing LDP link, PE-loopback IP ping may still succeed while the VPN transport fails. Unlike the simple global IPv4 MPLS foundations lab, the customer service label is meaningful at the egress PE, not as an ordinary globally routable IP destination in P1/P2.

## Completion evidence

Submit actual image/release and mapping; underlay neighbor counts and sourced probes; local PE–CE policy evidence; each tenant/AF/direction result; received RD/RT/next-hop/label; VRF import and CEF recursion; a two-label packet walk; unique-marker isolation proof; fault reasoning; complete restoration; and any emulator limitations.

The primary documentation sources and scope are listed in sources.json. Main references include [XR7.11 L3VPN](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/l3vpn/configuration/guide/b-l3vpn-cg-asr9000-711x/implementing-mpls-layer-3-VPNs.html), [XR7.11 6VPE](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/l3vpn/configuration/guide/b-l3vpn-cg-asr9000-711x/implementing-ipv6-VPN-provider-edge-transport-over-mpls.html), [XR7.11 BGP](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-bgp.html), [XE17 IPv6 MP-BGP](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-routing/b-ip-routing/m_ip6-mbgp-ext-xe.html), [RFC4364](https://www.rfc-editor.org/rfc/rfc4364.html), [RFC4659](https://www.rfc-editor.org/rfc/rfc4659.html) and [RFC6164](https://www.rfc-editor.org/rfc/rfc6164.html).

No private fieldbook content or invented execution captures were used.
