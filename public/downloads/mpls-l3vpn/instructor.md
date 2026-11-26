# MPLS L3VPN: instructor key and paired fault controls

Use README.md for student tasks first. This file reveals exact controls and expected reasoning. All checkpoints are documentation-reviewed models; device/emulator execution is pending. Save a healthy snapshot/checkpoint, apply one isolated fault, collect evidence, restore it and verify baseline before the next case.

## Healthy baseline

- Provider OSPF FULL counts PE1/P1/P2/PE2/RR1 = 1/3/2/1/1.
- Data-chain LDP sessions PE1/P1/P2/PE2 = 1/2/2/1; RR1 has none.
- PE1→PE2 Loopback0 route metric 31; PE1→RR1 metric 21.
- Both tenants' CE host routes exist in their own VRFs and both VPN families.
- Site1 ACME/BETA originate identical 10.60.1.1/32 and 2001:db8:60:1::1/128; site2 originate identical 10.60.2.2/32 and 2001:db8:60:2::2/128.
- RDs differ per PE/tenant. RT 65000:100 is ACME and 65000:200 is BETA, in both AFs.
- RR1 reflects both AFs, retains routes, preserves the egress PE next hop and is outside the data path.
- PE1 ingress attachment selects VRF; two labels normally traverse PE1→P1→P2; P2 PHP removes transport only; the service label reaches PE2.
- Actual numeric labels and allocation granularity are observed, not preassigned.
- Each CE advertises only its allowed host routes; all CE policy directions are explicit.

Grade the learner's selected discriminating checks and interpretation. Do not require every command when earlier evidence decisively locates a fault.

## Fault 1: wrong import RT only in PE2 ACME IPv4

Apply faults/PE2-acme-rt4-apply.cfg to PE2. It removes ACME IPv4 import 65000:100 and adds 65000:999. It leaves IPv4 export 65000:100, ACME IPv6 RTs and all BETA settings unchanged.

Expected distinction: site1 ACME VPNv4 may still appear in PE2's VPN BGP table under originating RD 65000:101 with RT 65000:100, but fails ACME IPv4 import. PE2 can continue exporting its own site2 route, and both BETA and ACME IPv6 can remain healthy.

~~~text
show running-config vrf ACME
show bgp vpnv4 unicast rd 65000:101 10.60.1.1/32 detail
show bgp vrf ACME ipv4 unicast 10.60.1.1/32
show route vrf ACME ipv4 10.60.1.1/32 detail
show route vrf ACME ipv6 2001:db8:60:1::1/128
show route vrf BETA ipv4 10.60.1.1/32
~~~

Do not claim that a route disappears from the RR or that the RD must match the import RT. The fault is a receiving VRF membership error. End-to-end ping can fail in both directions because the reverse route is missing, even though the configuration fault is one import direction.

Restore faults/PE2-acme-rt4-restore.cfg. Confirm 999 is removed, 100 is restored, the route imports, CEF resolves and all four CE tenant/AF pairs work in both directions. If an image needs route refresh/re-evaluation, scope it to the affected family/neighbor rather than resetting all BGP.

## Fault 2: PE1 drops CE-A1 IPv4 inbound

Apply faults/PE1-acme-policy4-apply.cfg. Stage03 defined DROP-ALL but did not attach it. The fault replaces only ACME neighbor 172.16.11.1 IPv4 inbound policy with DROP-ALL.

Expected distinction: the session can remain Established while the local site1 ACME IPv4 route is filtered before VPN export. IPv6 from CE-A1 and BETA remain permitted. This is earlier than an RT-import error.

~~~text
show bgp vrf ACME ipv4 unicast summary
show bgp vrf ACME ipv4 unicast 10.60.1.1/32
show running-config router bgp
show bgp vrf ACME ipv6 unicast 2001:db8:60:1::1/128
show bgp vpnv4 unicast rd 65000:101 10.60.1.1/32 detail
~~~

Observe the applied policy and local acceptance before blaming RR reflection. If policy re-evaluation is not immediate, verify route-refresh support and use the selective XR inbound soft refresh:

~~~text
clear bgp vrf ACME ipv4 unicast 172.16.11.1 soft in
~~~

The release-specific XR7.11 BGP guide documents VRF/AF-scoped soft reset. Confirm accepted parser syntax on the actual image.

Restore faults/PE1-acme-policy4-restore.cfg, which reattaches VPN-S1-IN4. Refresh only that neighbor/family if needed. Prove local acceptance, VPN export/remote import, return reachability and both tenant/AF baselines. Do not solve a deliberate drop by adding unrestricted pass-all.

## Fault 3: only PE2 RR VPNv6 neighbor AF removed

Apply faults/PE2-rr-vpnv6-apply.cfg. It removes address-family vpnv6 unicast under PE2 neighbor 10.0.0.5 while preserving VPNv4 and the neighbor transport.

Expected distinction: VPNv4 may stay healthy over the same IPv4 TCP relationship, while PE2 no longer exchanges VPNv6 with RR1. The local IPv6 CE–PE sessions/routes can remain valid. Loss of an address family does not require the entire TCP session to be down; capability renegotiation and implementation may affect transition behavior.

~~~text
show bgp vpnv4 unicast summary
show bgp vpnv6 unicast summary
show running-config router bgp
show bgp vrf ACME ipv6 unicast summary
show bgp vrf ACME ipv6 unicast 2001:db8:60:2::2/128
show bgp vpnv6 unicast rd 65000:102 2001:db8:60:2::2/128 detail
~~~

Check peer AF configuration/negotiation at both ends and the originating local route. Do not change the OSPF/LDP core to repair an absent VPN family. Restore faults/PE2-rr-vpnv6-restore.cfg and wait for family exchange, then verify both tenants' IPv6 import, labels, CEF and CE probes. Prove VPNv4 still works.

## Fault 4: LDP missing on P1–P2 while IP remains

Apply faults/P1-ldp-apply.cfg. It removes P1's LDP interface Gi0/0/0/1 only. The physical IPv4/OSPF interface remains active. The baseline has no LDP auto-configuration or alternate path.

After discovery/session expiry, P1–P2 cannot provide the normal LDP segment. OSPF and PE/RR BGP may stay up. PE-loopback IP ping may succeed, while customer label-dependent service fails. A BGP VPN route alone does not guarantee an installed usable transport stack.

~~~text
show ospf neighbor
show route ipv4 10.0.0.4/32
show running-config mpls ldp
show mpls ldp discovery detail
show mpls ldp neighbor
show mpls ldp bindings 10.0.0.4/32 detail
show mpls ldp forwarding 10.0.0.4/32 detail
show mpls forwarding
~~~

At PE1 also inspect VRF CEF and run MPLS transport OAM plus CE sourced service probes. Inspect the actual missing rewrite or fallback behavior; do not invent a line-card drop counter or exact failure string. In this VPN, an inner service label must be delivered to the egress PE, so ordinary IP fallback through P routers is not equivalent to service recovery.

Restore faults/P1-ldp-restore.cfg. Verify discovery, operational LDP, selected binding/LFIB, MPLS echo to PE2 and CE IPv4/IPv6 service. Do not stop after a successful small ordinary PE-loopback ping.

## Unique-marker tenant isolation exercise

Start from clean final, distinct-AS baseline. Apply the four optional/isolation apply files to CE-A2, PE2, PE1 and CE-A1.

Marker routes:
- 198.51.100.222/32
- 2001:db8:ac:2::222/128

Only ACME origin/outbound/inbound allowlists are expanded. CE-A2 originates the marker from Loopback99. PE2 uses ACME-TEST-IN4/6 and PE1 uses ACME-TEST-OUT4/6 on ACME neighbors. BETA keeps baseline attachments and RTs.

Expected evidence:
1. CE-A2 has the connected marker and advertises it.
2. PE2 learns it in ACME and exports it with ACME RD/RT.
3. RR1 retains it with RT 65000:100 and PE2 next hop.
4. PE1 imports it into ACME and permits it toward CE-A1.
5. CE-A1 accepts and reaches both markers with Loopback0 source.
6. BETA RIB/CEF at both PEs and CE-B1 do not contain the marker. The default tables also lack it; there is no baseline covering/default route.
7. Negative CE-B1 probes support the routing evidence.

The original overlapping pings prove only positive connectivity. A failed marker ping alone is also incomplete: policy, underlay, return path or a missing origin can cause failure. Require positive ACME delivery and absence from BETA/default tables with correct RT/import inspection.

If needed, refresh only affected policies/AFs. Example XR commands at PE2:

~~~text
clear bgp vrf ACME ipv4 unicast 172.16.22.1 soft in
clear bgp vrf ACME ipv6 unicast 2001:db8:22::1 soft in
~~~

Use equivalent selective CE refresh when supported; inspect negotiated refresh and actual parser. Apply every matching restore file. Prove marker withdrawal and baseline host connectivity. The restore files delete only experiment-specific loopback, network statements, prefix-list entries and RPL attachments/definitions.

## Optional same-AS experiment with bounded CE acceptance

Start from clean distinct-AS baseline, with isolation markers withdrawn.

Phase01:
- Apply optional/same-as/01-change-as/CE-A2.cfg, which removes BGP65012 and rebuilds the isolated CE-A2 process as65011 with the same hosts/filters.
- Apply the matching PE2 file to change ACME IPv4/IPv6 CE remote-as to65011.
- Confirm local sessions and PE route learning. The remote site's path contains65011. Locate the first rejection boundary: XR outbound loop checks can suppress the path before the CE sees it, depending on update-group behavior. Only a transmitted path can reach the CE's own-AS check. Inspect actual PE advertisements, CE path evidence or a permitted capture before naming the rejecting node.

Phase02:
- Apply optional/same-as/02-allowas-in/CE-A1.cfg and CE-A2.cfg.
- Both address families configure neighbor <PE> allowas-in1.
- This is a conditional comparison. If the provider sent the unchanged UPDATE, verify whether one own-AS occurrence is accepted. AS_PATH remains intact; this is not a provider rewrite. If the provider suppressed the route, allowas-in cannot recover it. Record that boundary rather than claiming CE-only success.
- Preserve and verify exact inbound/outbound host prefix allowlists.
- Run both directions and families where the UPDATE was delivered. Source-reviewed commands do not guarantee recovery on an untested image.

Phase03:
- Apply optional/same-as/03-remove-allowas-in/ on both CEs. Prove the temporary exception is removed.

Additional provider RPL remedy, while both ACME CEs still use65011:
- Apply optional/same-as/provider-rpl/PE1-apply.cfg and PE2-apply.cfg.
- PE1 attaches SAME-AS-S1-OUT4/6 to ACME CE outbound only, with the exact SITE2-V4/V6 allowlist. PE2 uses SAME-AS-S2-OUT4/6 and SITE1-V4/V6.
- Inside the permitted destination branch, replace as-path '65011' replaces that sequence with the local provider AS65000; pass follows, and all other destinations drop. Other ASes remain. No BETA policy or RT is changed.
- Inspect the actual provider advertisement and CE path to establish the processing/result on the selected image. Do not grade an assumed fixed rewritten path without evidence.
- Apply both matching provider-rpl restore files before phase04. They reattach baseline VPN-S1/2-OUT4/6 and remove experiment policies. Ensure CE allowas-in exceptions are also absent.

PE1 advertisement checks:

~~~text
show bgp vrf ACME ipv4 unicast advertised neighbor 172.16.11.1
show bgp vrf ACME ipv6 unicast advertised neighbor 2001:db8:11::1
~~~

For rejected incoming CE updates, use a supported CE-facing capture or an explicitly enabled inbound soft-reconfiguration/refresh workflow. The baseline does not retain every rejected UPDATE for a received-routes display.

Phase04:
- Apply optional/same-as/04-restore-as/CE-A2.cfg and PE2.cfg.
- Confirm CE-A2 AS65012, PE2 remote-as65012, original PE outbound policies, no CE allowas-in exception, and the original dual-stack service.

Do not skip phase03: CE-A1 would otherwise retain its temporary exception even after CE-A2 returns to the normal ASN. Do not combine this sequence with optional marker origin, because the CE BGP process replacement intentionally restores only the baseline hosts.

The ASR9000 cumulative BGP reference explicitly deprecates native as-override from7.11.1, retaining it for OpenConfig compatibility rather than intended native CLI use. The main lab does not require it, and these optional files do not ship it. The targeted replacement syntax and local-AS semantics are documented in the [ASR9000 RPL command reference](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/routing/command/reference/b-routing-cr-asr9000/routing-policy-language-commands.html); the [XR7.11 RPL guide](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-routing-policy.html) lists replace at neighbor-out. It retains the exact prefix filter and does not replace the whole AS_PATH or every private ASN.

This single-homed topology has no customer reentry path. Allowas-in and targeted provider AS rewriting change loop-prevention behavior; multihoming requires a complete SoO/site loop-prevention design. Grade the learner for stating that limit and the observed rejection boundary.

## Packet walk and MTU scoring

Full credit requires:
- Ingress PE attachment selects tenant VRF.
- VRF lookup selects remote VPN path/service context.
- MP-BGP carries the service label and RT; LDP provides the outer PE transport label.
- P1 swaps the outer label only.
- P2 PHP removes the outer label only.
- PE2 interprets the remaining service label, uses the correct VRF/forwarding context and sends ordinary IP to the CE.
- Overlapping tenant addresses do not change P router forwarding requirements.
- IPv6 service uses VPNv6/6VPE over the IPv4 LDP core, independently of VPNv4.
- A1500-byte IP packet with2labels needs1508bytes of MPLS payload. XR frame1600 includes14bytes Ethernet overhead, leaving1586 under the stated untagged accounting.
- Actual label mode/values, hardware limits and capture evidence are observed, not fabricated.

## Final restoration and acceptance

Remove all injected or optional state using paired files or restore the saved healthy lab checkpoint. Full final files are desired-state examples; additive pasting does not remove arbitrary faults.

Check all nine nodes as relevant:
- Correct OS/interface mapping, VRFs, ASNs and policies.
- OSPF and LDP neighbor counts, sourced underlay and MPLS OAM.
- VPNv4/vpnv6 neighbor families, reflected paths, RTs, preserved PE next hop.
- Correct local CE routes, VPN BGP, VRF import and CEF/LFIB.
- Both tenants, both AFs, both directions using CE Loopback0 sources.
- Isolation markers absent after restoration.
- No allowas-in exception or Loopback99 left after optional work.

Record actual image/release, captures, timings and limitations. Never grade for fixed allocated labels or claim the author executed these expectations.

Primary references are the XR7.11 L3VPN/BGP/6VPE guides, cumulative ASR9000 BGP/CEF references, IOS XE BGP/IPv6 command references and RFC4364/RFC4659. See sources.json for source scope and URLs. The separate instructor key is intentionally included in the downloadable archive; distribute it separately for a blind student exercise.
