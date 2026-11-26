# BGP / MP-BGP instructor workbook

Start each fault from a verified checkpoint. Record image, router, AF and output. Expected behavior is documentation-derived. Hardware and emulator execution are pending. Give the learner only the symptom until they write their diagnosis.

## Global baseline

- PE1, P1, PE2 and RR1 have 1, 3, 1 and 1 Level 2 neighbors. Both loopback families are reachable. Customer prefixes stay outside IS-IS.
- PE1 sees Site 2 from RR1 with AS_PATH 65102 and PE2 next hop. CE1 sees AS_PATH 65000 65102 and its directly attached PE1. Global IPv6 has a separate AF and PE2 IPv6 next hop.
- Before stage 03, P1’s global routes support native transit. RR1 is outside the data path. After stage 03, inspect actual IPv4 recursive label behavior.
- Capability, accepted BGP route, RIB/FIB and customer forwarding are separate observations.

## Fault A. Missing CE IPv6 AF on PE1

Use the global checkpoint, capture baseline and remove the neighbor AF.

~~~text
configure
router bgp 65000
 neighbor 2001:db8:101:1::2
  no address-family ipv6 unicast
  exit
 exit
commit
end
~~~

Read negotiated capabilities and the IPv6 summary. Restore address-family ipv6 unicast with CE1-IN-V6 inbound and CE1-OUT-V6 outbound under that neighbor. The exact session state depends on the remaining configured and negotiated families. Verify Site 1’s /128 at PE1, RR1 and PE2, then customer sourced probes.

## Fault B. Remove the IPv4 input policy

From the clean global checkpoint apply on PE1.

~~~text
configure
router bgp 65000
 neighbor 172.16.101.2
  address-family ipv4 unicast
   no route-policy CE1-IN-V4 in
   exit
  exit
 exit
commit
end
~~~

The session can remain Established while XR eBGP default route policy prevents exchange. Check the policy state and exact /32. Restore CE1-IN-V4 in the same neighbor AF. Inspect route-refresh capability and request a narrow re-evaluation when needed.

~~~text
clear bgp ipv4 unicast 172.16.101.2 soft in
show bgp ipv4 unicast 192.0.2.11/32 detail
~~~

Confirm propagation, RIB/FIB and CE probes after the repair.

## VPN baseline

- RD 65000:101 originates Site 1 and RD 65000:102 originates Site 2. CORAL imports/exports RT 65000:100 per AF. RD distinguishes NLRI and RT determines import eligibility.
- RR1 preserves PE next hop, RT and label. Explicit retain-all matches the XR RR default. An absent retain-all line alone cannot prove route rejection.
- PE1 receives PE2’s service label and resolves outer transport through P1 to PE2 Loopback0. P1 normally pops the transport label. VPNv6 has its own service label using IPv4 MPLS transport.
- P1 no longer runs customer BGP after conversion. Its transport LFIB still carries customer traffic.

## Fault C. Wrong CORAL IPv4 import RT

From the clean VPN checkpoint apply on PE1.

~~~text
configure
vrf CORAL
 address-family ipv4 unicast
  no import route-target 65000:100
  import route-target 65000:999
  exit
 exit
commit
end
~~~

The VPN NLRI can remain present while CORAL lacks the imported IPv4 route. Compare RD, RT, PE next hop and service label to the import list. IPv6 is an unaffected comparison. Restore import RT 65000:100 and remove import RT 65000:999, then verify VRF route, FIB and sourced customer traffic.

## Fault D. Remove P1’s PE2-facing LDP interface

From the clean VPN checkpoint apply on P1. Keep the physical interface and IS-IS active.

~~~text
configure
mpls ldp
 no interface GigabitEthernet0/0/0/1
 exit
commit
end
~~~

Observe discovery/session expiry and the PE2 /32 transport entry. IP and VPN control information can remain while the transport rewrite changes or fails. Compare actual LFIB and probes on the selected image. Restore the LDP IPv4 interface with the P1 stage 03 file. Verify downstream binding, rewrite and both customer AFs.

## Optional dual-home solutions

Read the overlay files before class. PE1 sets Site 1 inbound LOCAL_PREF 200 and Site 2 outbound MED 50. PE2’s new CE1 peer uses LOCAL_PREF 80 inbound and MED 150 outbound. CE1’s added peer uses AS 65000 and the same exact filters.

In global mode a higher-LOCAL_PREF iBGP path can beat PE2’s direct eBGP backup. RR1 normally reflects its selected path, so distinguish eligibility from path visibility. VPN mode uses distinct RDs. Inspect the per-RD VPN routes and CORAL selection independently.

At CE1 verify equal earlier attributes before assigning the decision to MED. Both peers have AS 65000, so normal MED comparability applies. Shut CE1 GigabitEthernet1, record withdrawals and backup forwarding, then restore it. State actual probe interval and VM timing with loss estimates.

## Restore and assessment

Record each XR node’s pre-change commit ID. Preview show configuration rollback changes to <recorded-id> diff before rollback configuration to <recorded-id>. Restore CE snapshots for optional changes. Return to clean checkpoints between faults. Complete final-global and final-vpn configurations support manual rebuilds on clean nodes.

Ask the learner to name device, AF, routing context, decisive field and next verification for each diagnosis. Require the complete route-to-forwarding evidence chain. Label modeled predictions and actual captures according to the evidence available.
