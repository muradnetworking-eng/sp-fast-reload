# L2VPN: instructor faults and solutions

Use the student README first. This file reveals isolated injection, expected reasoning and restore steps. All outcomes are documentation-reviewed expectations; actual device/emulator execution is pending. Save a known checkpoint, apply one fault, observe it and restore before the next exercise.

## Reference state and evidence chain

The physical topology has no alternate core path across P1–P2. OSPF/link-LDP counts before PWs exist are PE1/P1/P2/PE2/PE3 = 1/2/3/1/1. Service configuration adds targeted PE sessions; one session can carry both VPWS and VPLS PW mappings for the same PE pair.

VPWS uses group VPWS / p2p CE1-CE2 / PW-ID 100 at PE1 and PE2, with .100 ACs. VPLS uses group VPLS / BD LAN200 / VFI MESH200 / PW-ID 200 on a full mesh of PE1, PE2 and PE3, with .200 ACs. Every PW attaches L2-CW, which explicitly selects LDP, CW and raw Ethernet transport.

Expected service MTU is a calculated EVC model, not an executed result: access parent 1514, one tag adds 4 to inherited subinterface MTU 1518, then Ethernet 14 and popped tag 4 are subtracted for signaled 1500. Read actual local/remote attributes.

Check platform capability before grading forwarding. The CML XRv 9000 L2 MPLS test covers VPWS and does not prove VPLS data-plane support. If VFI/bridge-domain configuration or forwarding is unsupported, stop that phase and move to a qualified platform; do not grade an unsupported feature as a configuration fault. Legacy XRv is a different image.

Grade the first broken dependency:
1. Physical and administrative state.
2. Local VLAN classification/rewrite and attachment membership.
3. Targeted-LDP discovery/session reachability.
4. Matching PW-ID, type, CW, MTU and status.
5. Core label transport and forwarding rewrite.
6. Customer ARP/ND, traffic size and sourced delivery.

Do not require a command dump when an earlier discriminating check has already established the cause.

## Fault 1: wrong PW-ID at PE2

Apply faults/PE2-pwid-apply.cfg. It removes PE2's neighbor 10.20.0.1 PW-ID 100 and creates ID 101 with the same PW class. PE1 still expects ID 100.

~~~text
show l2vpn xconnect group VPWS xc-name CE1-CE2 detail
show running-config l2vpn
show mpls ldp discovery detail
show mpls ldp neighbor detail
~~~

Expected reasoning: the peer session may stay up, especially because the VPLS ID 200 service shares that PE pair. AC state and transport can remain healthy while the matching service mapping is missing. Do not conclude that an operational targeted session implies this PW is valid.

Expected blast radius is VPWS only. VPLS pair/family tests are controls. Restore faults/PE2-pwid-restore.cfg, which deletes 101 and reinstates 100 plus L2-CW. Verify reciprocal IDs, attributes, labels, OAM and both CE IP families/directions. Do not leave both IDs configured as a supposed fix.

## Fault 2: local tag mismatch with an apparently healthy PW

Apply faults/PE2-tag-apply.cfg. PE2 .100 now classifies dot1q 101, while CE2 still transmits tag 100. PW-ID remains 100.

~~~text
show running-config interface GigabitEthernet0/0/0/1.100
show interfaces GigabitEthernet0/0/0/1.100
show l2vpn xconnect group VPWS xc-name CE1-CE2 detail
~~~

Expected reasoning: a physical link and administrative AC/PW state can remain up despite no matching customer frames. Inspect the CE encapsulation and actual wire tag, counters and ARP/ND. The problem is classification, not a need to reset LDP or change PW-ID.

VPLS .200 should remain usable. Restore faults/PE2-tag-restore.cfg. Verify local tag 100, bidirectional resolution/probes and VPLS controls. This differs from intentional translation, where both sides of the local PE–CE wire move to the same new tag.

## Fault 3: attachment shutdown

Apply faults/PE2-ac-down-apply.cfg, which shuts only PE2 Gi0/0/0/1.100.

Expected reasoning: the parent trunk and .200 can remain operational while the VPWS attachment is administratively down. Read local AC state and status propagation separately from targeted session state. PW operational/remote status wording can vary; inspect actual fields rather than demand a fixed display string.

Restore faults/PE2-ac-down-restore.cfg. Prove local AC recovery, service status, OAM and both customer families/directions. Do not shut or restart the whole access trunk to repair one subinterface.

## Fault 4: normalized service MTU mismatch

Apply faults/PE2-mtu-apply.cfg. It sets PE2 .100 MTU 1418; the model yields service 1400 after Ethernet/tag normalization, against the remote model 1500. The parent and .200 remain unchanged.

~~~text
show interfaces GigabitEthernet0/0/0/1
show interfaces GigabitEthernet0/0/0/1.100
show l2vpn xconnect group VPWS xc-name CE1-CE2 detail
show l2vpn bridge-domain bd-name LAN200 detail
~~~

Expected reasoning: local/remote service MTU attributes disagree. Check actual reported values and rejection reason. This can prevent PW establishment independently of the core's spare payload capacity. Raising core MTU cannot repair a signaled service mismatch. Do not grade an unobserved numeric value as a device result.

Restore faults/PE2-mtu-restore.cfg, which removes the child override with no mtu and restores inheritance. Verify configured/effective values, negotiated match and full-size customer probes. Small pings are insufficient for service-size acceptance. Check VPLS remains healthy.

## Fault 5: missing core LDP on P1–P2

Apply faults/P1-ldp-apply.cfg. It removes LDP activation from P1 Gi0/0/0/1, leaving IPv4/OSPF enabled. The baseline has no LDP auto-configuration.

~~~text
show ospf neighbor
show route ipv4 10.20.0.4/32
show running-config mpls ldp
show mpls ldp discovery detail
show mpls ldp neighbor detail
show mpls ldp bindings 10.20.0.4/32 detail
show mpls ldp forwarding 10.20.0.4/32 detail
show mpls forwarding
~~~

Expected reasoning: IP/IGP reachability and targeted PE sessions may survive while the transport label path is broken. Some PW summaries can retain state even though the customer stack cannot cross the missing segment. Inspect selected label rewrites and active MPLS/service probes.

Expected blast radius is PE1's VPWS to PE2 and PE1's VPLS communication with PE2/PE3. PE2↔PE3 transport stays on the P2 side and is a useful healthy control. Do not claim all services are unaffected or all VPLS pairs fail.

Restore faults/P1-ldp-restore.cfg. Verify link discovery, operational session, selected transport labels, MPLS echo, PW attributes and every service pair/family/direction. An ordinary PE-loopback IP ping is not sufficient recovery evidence.

## Optional local tag translation

Apply optional/translation/PE2-apply.cfg and CE2-apply.cfg from a healthy baseline. The logical .100 interfaces now use local VLAN 110 on both ends of that attachment. PE1 still uses tag 100. PW-ID stays 100 and raw Ethernet normalization still pops/restores the local tag.

Grade:
- Correct local PE2/CE2 tag pairing.
- Unchanged peer/PW-ID/service identity.
- Correct symmetric rewrite and local egress tag.
- Compatible actual PW type/CW/MTU.
- VPWS IPv4/IPv6 in both directions and VPLS controls.

Restore both matching files, then prove tag 100 baseline. The local subinterface number .100 is not required to equal its tag; changing that classifier does not require renaming the interface or PW.

## MAC learning, BUM and unknown unicast

After VPLS traffic, inspect:

~~~text
show l2vpn bridge-domain bd-name LAN200 detail
show platform
show l2vpn forwarding bridge-domain VPLS:LAN200 mac-address detail location <actual-node>
~~~

Replace the location placeholder with the image's real forwarding node. Use supported software views if the virtual hardware view is unavailable.

Observed source MACs should map to the receiving local AC or remote PW. Entries depend on received source frames and aging; a fixed three-CE count after one probe is not an acceptance condition. VPWS does not require bridge MAC learning. Learn source, forward using destination. A ping after ARP/ND resolution is generally known unicast; it does not demonstrate unknown-unicast replication.

The student workbook provides a scoped CE1 static-ARP probe to unused 198.51.100.254 / MAC 0200.0000.0254. Check both are unused and the destination MAC absent from the BD. No reply is expected. Captures/counters should show ingress replication to eligible remote PWs and delivery to eligible remote ACs. Remote PEs must not re-flood PW-ingress traffic into another core PW in the same split-horizon group. Remove the exact temporary ARP entry afterward.

Fresh ARP is broadcast and IPv6 ND includes multicast. Treat those as separate observations. There are no customer switch loops or multicast routing protocols configured.

## Optional missing-mesh split-horizon experiment

Apply optional/split-horizon/PE1-apply.cfg. It removes only the PE1→PE3 VFI PW-ID 200 neighbor. The remote PE3 side may show missing/remote state; inspect both sides rather than assume one exact string.

Expected model:
- CE1↔CE2 VPLS still uses its direct PW.
- CE2↔CE3 VPLS still uses its direct PW.
- CE1↔CE3 cannot use PE2 as a transit VPLS bridge because PE2 does not forward a core-PW ingress frame to another core PW in the group.
- VPWS ID 100 is unchanged.

A packet or ARP from CE1 may reach PE2, but PE2 must not re-flood it toward PE3 over its other core PW. Capture that distinction if supported. A failed ping alone does not prove split horizon; combine service membership, direct-PW state and ingress/egress evidence.

Restore optional/split-horizon/PE1-restore.cfg, which reinstates the PE3 neighbor and L2-CW attachment. Prove all three pair/family/direction tests again.

## Provider separation is not CE security isolation

CE1/CE2 each have both service subnets connected as routed interfaces. They can route between those subnets. A cross-subnet success/failure cannot establish provider Layer2 separation or an end-to-end tenant security policy.

Grade provider separation from exact .100 VPWS membership, .200 VPLS membership, tags/rewrite, MAC table context and captures. Do not add CE VRFs or bridge interfaces to silently change the agreed host model.

## Packet and MTU grading

A correct walk states:
- Ingress local tag selects the AC and is symmetrically popped.
- Transport label resolves the egress PE; PW label is advertised by the receiving service endpoint.
- CW follows the label stack and precedes normalized Ethernet; it is not a label.
- P1 swaps only transport; P2 PHP removes only transport.
- PW label/CW still reach the egress PE, which performs service disposition and restores its local tag.
- Return PW labels are separately allocated.
- VPLS adds MAC learning/forwarding and replication; VPWS does not become a provider routed IP service.

For 1500-byte IP with a popped service tag, customer Ethernet 14 + IP 1500 + CW 4 + labels 8 = 1526 bytes MPLS payload. Provider Ethernet 14 gives frame 1540 excluding FCS. Core XR frame 1600 provides 1586 payload. Additional labels or retained tags change the calculation.

Separate this core budget from the normalized signaled PW service MTU. Actual local/remote values and image forwarding limits must be observed. No fixed dynamic label, exact counter value, convergence time or capture is prescribed as if executed.

## Recovery and completion

Use the paired restore or a saved known checkpoint. Full final files do not delete arbitrary extra neighbors, classifier changes or child MTU overrides when pasted additively.

Confirm:
- Physical/OSPF/link-LDP health and sourced PE reachability.
- Targeted discovery/session and each service's own attributes.
- Reciprocal PW IDs, CW, MTU, type and labels.
- Full VPLS mesh and correct AC/BD membership.
- VPWS both IP families/directions and every VPLS CE pair/family/direction.
- Optional ARP removed, direct mesh restored and local tags returned to baseline.
- Correct full-size service evidence and documented image limitations.

Exact source metadata is in sources.json. Syntax was checked against XR7.11 point-to-point/multipoint guides, ASR9000 command references and Cisco's EVC MTU/CW technical notes. None of these modeled outcomes has been executed by the author.
