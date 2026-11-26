# BGP / MP-BGP six-node lab

Build global IPv4 and IPv6 BGP, then convert the same customer routes into VPNv4 and VPNv6. The topology and CLI were reviewed against Cisco public documentation on 2026-11-26. Hardware and emulator execution are pending. Expected outputs describe model checkpoints.

## Manual setup

Create PE1, P1, PE2 and RR1 as MPLS-capable IOS XR nodes and CE1/CE2 as IOS XE nodes. In CML, select available XRv 9000 and Catalyst 8000V or CSR1000V reference platforms. In EVE-NG, select supported templates for your licensed images. Verify resources, MPLS VPNv6 forwarding and interface names on the actual image. The ASR 9000 7.11.x guides provide the XR syntax baseline. Match every data port to the table and retain console access and bootstrap/management configuration separately.

~~~text
                         RR1
                          |
CE1 ---- PE1 ----------- P1 ----------- PE2 ---- CE2
~~~

AS 65000 contains the four core routers. CE1 uses AS 65101 and CE2 uses AS 65102. Core IS-IS instance CORE uses Level 2 and area 49.0001. Every core link has metric 10 in each direction. Core NETs end in 0001 through 0004, matching the loopback identity below. CE prefixes stay outside the IGP.

| Node | Loopback IPv4 | Loopback IPv6 |
| --- | --- | --- |
| PE1 | 10.0.0.1/32 | 2001:db8:0::1/128 |
| P1 | 10.0.0.2/32 | 2001:db8:0::2/128 |
| PE2 | 10.0.0.3/32 | 2001:db8:0::3/128 |
| RR1 | 10.0.0.4/32 | 2001:db8:0::4/128 |
| CE1 Loopback100 | 192.0.2.11/32 | 2001:db8:101:100::11/128 |
| CE2 Loopback100 | 198.51.100.22/32 | 2001:db8:102:100::22/128 |

| Link | Endpoint A | Endpoint B |
| --- | --- | --- |
| PE1–P1 | PE1 Gi0/0/0/0, 10.0.12.0/31, 2001:db8:12::0/127 | P1 Gi0/0/0/0, 10.0.12.1/31, 2001:db8:12::1/127 |
| P1–PE2 | P1 Gi0/0/0/1, 10.0.23.0/31, 2001:db8:23::0/127 | PE2 Gi0/0/0/0, 10.0.23.1/31, 2001:db8:23::1/127 |
| P1–RR1 | P1 Gi0/0/0/2, 10.0.24.0/31, 2001:db8:24::0/127 | RR1 Gi0/0/0/0, 10.0.24.1/31, 2001:db8:24::1/127 |
| PE1–CE1 | PE1 Gi0/0/0/1, 172.16.101.1/30, 2001:db8:101:1::1/64 | CE1 Gi1, 172.16.101.2/30, 2001:db8:101:1::2/64 |
| PE2–CE2 | PE2 Gi0/0/0/1, 172.16.102.1/30, 2001:db8:102:1::1/64 | CE2 Gi1, 172.16.102.2/30, 2001:db8:102:1::2/64 |

Core XR interfaces use MTU 1600. Check actual layer 2/MPLS MTU accounting and the deepest label stack before testing customer-size packets. The baseline has one core path and one RR. The optional extension adds a CE attachment for selection and failover experiments.

## Configuration order

Extract bgp-configs.zip. Paste the matching node file from EXEC. XR scripts enter configuration and end with commit/end. XE scripts apply as entered. Verify each stage before continuing. Inspect a failed XR candidate with show configuration failed and resolve it before applying the next stage.

1. Apply initial/ to all six routers.
2. Apply stages/01-isis/ to all four XR routers.
3. Apply stages/02-global-bgp/ to all six routers.
4. Apply stages/03-ldp/ to PE1, P1 and PE2.
5. Record each XR router’s latest verified global checkpoint commit ID and save snapshots.
6. Apply stages/04-vpn/ to all four XR routers.

The complete final-global files describe the pre-VPN checkpoint including LDP. The final-vpn files describe CORAL after conversion. Each full set assumes a clean corresponding checkpoint. The CEs have the same ordinary unicast BGP configuration in both phases.

## 1. Prove the underlay

Test every direct link in both families. PE1, PE2 and RR1 each have one Level 2 neighbor, P1 has three. On PE1 inspect and probe RR1 using the eventual session source.

~~~text
show isis adjacency
show route ipv4 10.0.0.4/32
show route ipv6 2001:db8:0::4/128
ping 10.0.0.4 source 10.0.0.1
ping ipv6 2001:db8:0::4 source 2001:db8:0::1
~~~

Repeat from P1 and PE2 with their own sources. Read each CE’s exact connected Loopback100 /32 and /128. Record actual IPv6 next hops, including any link-local address and outgoing interface.

## 2. Exchange global routes

PE RPL policies admit only the local site’s exact prefix and export only the remote site’s exact prefix. IPv4 core sessions use IPv4 Loopback0, IPv6 sessions use IPv6 Loopback0. The PEs apply next-hop-self per global AF toward RR1. RR1 has PE1, P1 and PE2 clients in both AFs and preserves the PE next hops.

On PE1 read both AFs and compare BGP to its RIB/FIB.

~~~text
show bgp ipv4 unicast summary
show bgp ipv6 unicast summary
show bgp ipv4 unicast 198.51.100.22/32 detail
show bgp ipv6 unicast 2001:db8:102:100::22/128 detail
show cef ipv4 198.51.100.22/32 detail
show cef ipv6 2001:db8:102:100::22/128 detail
~~~

Predict the supplier, next hop and AS_PATH at PE1. Compare P1 and RR1. Probe from CE1 and repeat in reverse from CE2.

~~~text
ping 198.51.100.22 source 192.0.2.11
ping ipv6 2001:db8:102:100::22 source 2001:db8:101:100::11
~~~

Before stage 03, MPLS is absent and P1’s global BGP routes support native IP transit. After LDP is added, IPv4 recursion may impose labels. Inspect CEF at the selected checkpoint to determine the actual packet behavior. The policies do not export transit CE-link prefixes, so use the advertised loopback source.

## 3. Diagnose AF and policy faults

Have an instructor inject one fault at a time from the separate workbook. Write the expected distinguishing evidence before opening the solution.

- IPv4 works but CE1’s IPv6 exchange is unavailable on PE1.
- CE1’s IPv4 session is Established but its /32 is not admitted on PE1.

Inspect negotiated capabilities, active AFs, the attached policies and the exact prefix. After a correction, inspect route-refresh capability and request a narrow soft re-evaluation if needed. Confirm the accepted route, forwarding and customer traffic.

## 4. Add MPLS transport

Apply stage 03 on PE1, P1 and PE2. LDP operates over PE1–P1–PE2. RR1 has no LDP role. At PE1 identify P1’s binding for PE2’s loopback. At P1 inspect the forwarding action toward PE2.

~~~text
show mpls ldp neighbor
show mpls ldp bindings 10.0.0.3/32 detail
show mpls ldp forwarding 10.0.0.3/32 detail
show cef ipv4 10.0.0.3/32 detail
ping mpls ipv4 10.0.0.3/32
~~~

Use actual allocated labels in your diagrams. Save each XR node’s latest verified commit ID from show configuration commit list and take a snapshot. IDs are local to each router.

## 5. Convert the sites to VPNv4 and VPNv6

Apply the complete stage 04 files. PE conversion removes global CE neighbors, withdraws global unicast AFs and removes the IPv6 RR session. It creates CORAL in both AFs, explicitly removes and reapplies both interface addresses across the VRF move, and creates VRF eBGP neighbors. Verify both addresses in CORAL after commit. P1’s BGP is removed and RR1 converts to VPN reflection over IPv4 Loopback0 sessions.

PE1 uses RD 65000:101 and PE2 uses RD 65000:102. Both AFs import/export RT 65000:100. Explicit retain-all documents the RR intent and matches the IOS XR RR default. XR iBGP sends extended communities automatically. Preserve the egress PE next hop and service label through reflection.

On PE1 compare VPN NLRI to CORAL import and forwarding. XR prints actual IPv4 next hops for VPNv6 over this transport model.

~~~text
show bgp vpnv4 unicast summary
show bgp vpnv6 unicast summary
show bgp vpnv4 unicast rd 65000:102 198.51.100.22/32 detail
show bgp vpnv6 unicast rd 65000:102 2001:db8:102:100::22/128 detail
show bgp vrf CORAL ipv4 unicast 198.51.100.22/32 detail
show bgp vrf CORAL ipv6 unicast 2001:db8:102:100::22/128 detail
show route vrf CORAL ipv4 198.51.100.22/32
show route vrf CORAL ipv6 2001:db8:102:100::22/128
show cef vrf CORAL ipv4 198.51.100.22/32 detail
show cef vrf CORAL ipv6 2001:db8:102:100::22/128 detail
~~~

Write each on-wire stack top first using observed labels. PE1 pushes outer transport-to-PE2 and inner service-from-PE2. P1’s default PHP removes the transport label and forwards the service label to PE2. The service entry and CORAL route select local CE forwarding. VPNv6 has its own service label over the same IPv4 LDP transport.

Probe both site loopbacks in both directions and families. Confirm P1 has no customer IP route while customer traffic works. Capture both core links where supported and correlate the first link’s two-label stack with the last core link’s service label.

## 6. Isolate import and forwarding failures

Use a clean VPN snapshot before each ticket.

- Site 2 VPNv4 reaches PE1 with the intended RD, RT and next hop, but CORAL has no matching IPv4 route. VPNv6 provides a comparison.
- VPN routes are imported, but an MPLS transport dependency fails after a change to P1–PE2 LDP.

Record symptom, hypothesis, decisive command and field, correction and restored customer traffic. If a virtual image exposes different failure behavior, retain the actual output and explain its first divergence.

## 7. Optional CE1 dual-homing

Add CE1 GigabitEthernet2 ↔ PE2 GigabitEthernet0/0/0/2. PE2 uses 172.16.111.1/30 and 2001:db8:111:1::1/64. CE1 uses 172.16.111.2/30 and 2001:db8:111:1::2/64. ASNs stay the same.

Apply only optional-global or optional-vpn on PE1, PE2 and CE1, matching the current checkpoint. These are overlays. Baseline final configurations retain single attachments.

The overlays set provider inbound LOCAL_PREF 200 at PE1 and 80 at PE2 for Site 1 in both AFs. They set outbound MED 50 at PE1 and 150 at PE2 for Site 2 toward CE1. Each new peer uses the same exact prefix whitelist.

Compare PE2’s direct backup with the higher-LOCAL_PREF path through PE1 in the global variant. In VPN mode inspect each RD-qualified NLRI and CORAL’s choice separately. Distinct RDs preserve separate VPN prefixes at RR1. At CE1 check earlier best-path attributes before attributing selection to MED. Both neighbors use AS 65000, satisfying normal same-neighbor-AS MED comparability.

Shut CE1 GigabitEthernet1, record withdrawals and backup forwarding in both AFs, then restore it. Measure actual loss with the probe interval and virtual timing stated. Restore the three pre-extension checkpoints before removing the optional wire.

## Restore the global checkpoint

Use each XR node’s own recorded global commit ID. Substitute the actual ID in the following XR EXEC commands.

~~~text
show configuration rollback changes to <recorded-id> diff
rollback configuration to <recorded-id>
~~~

Restore CE snapshots too if optional CE changes were applied. Recheck the global AFs and both sourced customer probes. Complete final-global files also support rebuilding on clean nodes.

## Public technical references

- [IOS XR 7.11 BGP](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-bgp.html)
- [IOS XR 7.11 RPL](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-routing-policy.html)
- [IOS XR 7.11 IS-IS](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-is-is.html)
- [IOS XR 7.11 LDP](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/mpls/configuration/guide/b-mpls-cg-asr9000-711x/implementing-mpls-ldp.html)
- [IOS XR 7.11 L3VPN](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/l3vpn/configuration/guide/b-l3vpn-cg-asr9000-711x/implementing-mpls-layer-3-VPNs.html)
- [IOS XR 7.11 IPv6 VPN over MPLS](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/l3vpn/configuration/guide/b-l3vpn-cg-asr9000-711x/implementing-ipv6-VPN-provider-edge-transport-over-mpls.html)
- [ASR 9000 BGP command reference](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/routing/command/reference/b-routing-cr-asr9000/bgp-commands.html)
- [IOS XE 17 basic BGP](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-routing/b-ip-routing/m_irg-basic-net-0.html)
- [IOS XE 17 MP-BGP for IPv6](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-routing/b-ip-routing/m_ip6-mbgp-ext-xe.html)
- [CML IOS XRv 9000](https://developer.cisco.com/docs/modeling-labs/ios-xrv-9000/)
