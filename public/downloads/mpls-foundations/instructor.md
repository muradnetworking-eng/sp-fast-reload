# MPLS Foundations instructor workbook

Complete the healthy student lab before teaching. Solutions describe expected mechanisms and synthetic cases. Device execution is pending.

## Instructor fault controls

Begin from a healthy recorded checkpoint and select one variant. Give the learner its symptom first and ask for a discriminating check before showing the solution.

| Control | Apply | Restore | Evidence |
| --- | --- | --- | --- |
| Physical P1-P2 loss | faults/P1-link-down-apply.cfg | faults/P1-link-down-restore.cfg | OSPF adjacency, two metric-51 paths, rewrites and recovery |
| Remove P1-P2 LDP | faults/P1-ldp-link-apply.cfg | faults/P1-ldp-link-restore.cfg | IP versus labeled forwarding and actual synchronization applicability |
| Unrouted P1 transport | faults/P1-transport-apply.cfg | faults/P1-transport-restore.cfg | Hello source, LDP ID, advertised transport and reverse reachability |
| P1-P2 authentication mismatch | faults/P1-auth-apply.cfg | faults/P1-auth-restore.cfg | Keep LDP interfaces configured and inspect session/readiness |
| PE2 explicit-null | stages/03-explicit-null/PE2-apply.cfg | stages/03-explicit-null/PE2-restore-php.cfg | Binding, P2 outgoing action and final-link header |
| Local TTL propagation | optional/ttl/PE1-disable-local.cfg and PE2-disable-local.cfg | optional/ttl/PE1-restore.cfg and PE2-restore.cfg | Router-generated probes, label TTL and visibility |
| MPLS payload budget | optional/mtu/P1-reduce.cfg and P2-reduce.cfg | optional/mtu/P1-restore.cfg and P2-restore.cfg | Matching endpoints, effective size threshold and restoration |

LAB_ONLY_MISMATCH is an intentionally public lab value. Verify each commit and the effective peer authentication configuration. Reset only the intended P1-P2 session using the documented EXEC command in the fault file if needed, then restore the test override.

To demonstrate synchronization, keep LDP configured on the interface and use a session failure such as authentication mismatch. Deleting LDP from an interface can change whether synchronization applies. Observe the administrative case separately.

The unrouted transport override affects P1's design across all its LDP adjacencies. Record those sessions before and after. Its restore file returns transport to Loopback0 and removes temporary Loopback99.

Apply and restore both MTU endpoint files. XR frame MTU 1514 on untagged Ethernet leaves a 1500-byte MPLS payload ceiling. One four-byte entry leaves 1496 bytes for the inner IP datagram. Establish actual DF/datagram size using the image's ping help and capture where possible. Verify OSPF/LDP before attributing loss to size. The two-label budget is a conceptual calculation here, with no configured service label.

The interactive forwarded-TTL scenario requires traffic entering a PE from an external generator. The OAM-source scenario requires a separate source address and an intentionally absent return route. These are extensions to the four-node baseline.

## Instructor controls and expected reasoning

Reveal only after the learner has collected evidence.

The separate instructor.md contains exact injection, restoration and grading notes. Apply one isolated fault at a time in the manual lab. The fault directory is excluded from the baseline; do not paste it as a configuration stage. All outcomes below are model expectations, not captured execution.

| Exercise | Expected reasoning and recovery |
| --- | --- |
| OSPF baseline | PE1 selects P1 then P2 to PE2; installed metric 31 includes PE2 Loopback0 cost 1. All loopbacks are reachable. |
| LDP baseline | Sessions2/3/3/2. Stable IDs/transport use Loopback0. P1 and P2 labels differ by local ownership; non-selected mappings may remain in the LIB. |
| PHP/explicit-null | P2 Pop for PE2 implicit-null; with explicit-null P2 sends0 to PE2. Label3 never appears on wire. Restore advertisement on PE2 and verify P2 Pop. |
| Physical P1–P2 outage | PE1 next hops P1 and P2, each metric 51; hashes determine traffic sharing. Restore link and wait for sync. |
| Transport fault | P1’s unadvertised 192.0.2.2 transport is unreachable although its LDP identifier remains10.10.0.2:0. Restore explicit 10.10.0.2 and remove Loopback99. |
| Authentication versus sync | An LDP session can be down with OSPF FULL and discovery present. Keep LDP configured, remove the injected password mismatch, reset only that session if needed, then verify sync. |
| MTU/TTL | Interpret the configured layer, effective budget and probe class. Restore both endpoint settings and verify large labeled traffic as well as small IP probes. |

### Instructor recovery evidence

IOS XR 7.11.x — ASR 9000 reference

Compare with the recorded healthy checkpoint. Full final files describe the desired baseline but additive pasting does not remove arbitrary faults.

~~~text
show ospf neighbor
show mpls ldp neighbor detail
show mpls ldp ipv4 igp sync
show route ipv4 10.10.0.4/32
show cef ipv4 10.10.0.4/32 detail
ping mpls ipv4 10.10.0.4/32
~~~

For an unknown state restore the saved lab snapshot/checkpoint, or explicitly remove the injected fault first. Do not treat a final-file paste as a universal reset.

## Troubleshooting solutions

### OSPF is up but one link has no LDP discovery

The lab’s P1–P2 OSPF adjacency is Full. A cold-start LDP check finds no discovery adjacency for that link, while P1’s other LDP-enabled interfaces exchange Hellos.

**Root cause**

P2’s P1-facing interface lacks the intended IPv4 LDP configuration. OSPF and link state remain healthy independently.

**Correction**

Under P2 mpls ldp → interface GigabitEthernet0/0/0/1 → address-family ipv4, restore the baseline activation and commit. Keep the stable Loopback0 LDP identity and transport design.

**Verification**

Verify bidirectional discovery on P1–P2, an Operational session for the expected peer transport endpoints, the PE2 /32 binding selected from the IGP next hop, and the programmed forwarding action. Run sourced LSP OAM and capture the intended core path where supported.

### Hellos arrive but the TCP transport address is unreachable

In the lab’s transport-address fault variant, P2 receives P1’s UDP link Hellos advertising transport 192.0.2.2. The direct P1 address 10.10.23.0 responds, but the LDP session never reaches Operational.

**Root cause**

P1’s discovered TCP transport was changed to the isolated, unrouted Loopback99 address. Local-link Hellos still reach P2, but the selected transport endpoint is unreachable.

**Correction**

Restore discovery transport-address 10.10.0.2 under P1’s mpls ldp IPv4 family and commit. Changing transport addresses affects sessions, so perform this only in the isolated fault exercise. Remove the temporary Loopback99 after verifying recovery.

**Verification**

Confirm P2 reaches 10.10.0.2 from 10.10.0.3, the discovered transport and actual TCP endpoints match the baseline, bindings arrive, and the PE2 FEC resolves through the appropriate peer. Repeat forwarding checks after the session recovers.

### Transport routes work but the LDP session stays down

In an isolated cold-start variant, P1 and P2 have bidirectional Hello discovery and reachable Loopback0 transport addresses. ICMP succeeds, but LDP TCP does not establish.

**Root cause**

A deliberate transport filter permits discovery and ICMP while denying LDP TCP between the actual loopback endpoints.

**Correction**

Correct the specific test ACL to permit the intended LDP TCP flow and its return traffic. Account for which endpoint initiates the connection and TCP source/destination ports. Preserve the rest of the reviewed filter and commit.

**Verification**

Compare ACL counters, actual TCP endpoints, successful Initialization/KeepAlive exchange and Operational state. Then verify FEC bindings and LFIB state. Restore the isolated test ACL and its attachment to the clean baseline after the exercise.

### A remote binding exists but it belongs to the wrong next hop

PE1 has a remote label for 10.10.0.4/32 from P2, yet its intended continuous LDP path through primary P1 has no usable downstream label. The IPv4 destination remains reachable.

**Root cause**

P1’s advertisement control omits the required PE2 loopback FEC. PE1 retains P2’s alternate binding but cannot apply that receiving label in P1’s label space.

**Correction**

Restore the intended local-label advertisement for the PE2 /32 toward PE1 on P1, then commit and allow the mapping to be distributed. Preserve any intentional prefix/peer filtering. Do not copy P2’s numeric label into P1’s rewrite.

**Verification**

Verify a remote mapping from P1 for the exact FEC, the selected IGP next hop, PE1’s imposed label and P1’s matching local LFIB action. Follow P1→P2→PE2 and run LDP FEC OAM. Record any native IP fallback separately from proof of the intended LSP.

### Labeled replay fails although the IP route and LDP are healthy

The baseline loopback LSP works, but a manually crafted replay packet fails on PE1→P1. The replay used a label copied from P2’s local LFIB instead of reading PE1’s current rewrite.

**Root cause**

The replay exposed P2’s incoming label at P1. A dynamically allocated MPLS label has meaning in the receiving label space, rather than identifying the same FEC everywhere.

**Correction**

Rebuild the isolated replay from the currently programmed PE1 rewrite, with P1’s accepted top label. Keep label source, receiving node and capture timestamp with the test. Use normal forwarding and OAM to establish the baseline first.

**Verification**

Capture PE1→P1 and P1→P2 and correlate each top label with that receiver’s LFIB. Confirm PE2 disposition and return reachability. Re-read label allocations after any reset or reconfiguration before replaying.

### Small LSP probes pass while large labeled packets fail

In an optional packet-size variant, both ends of PE1–P1 have matching untagged XR interface MTU 1514, giving a 1500-byte effective MPLS payload ceiling, and OSPF remains Full. A small LSP echo succeeds, but a 1500-byte inner IPv4 packet with DF set drops when a transport label is imposed.

**Root cause**

The imposed transport label adds four bytes beyond the configured effective MPLS payload ceiling. The optional low-MTU variant differs from the baseline XR MTU 1600 configuration.

**Correction**

Restore the documented baseline MTU headroom on both ends and any intervening logical/physical interfaces. Calculate the deepest required stack, including service, entropy or repair entries in future service designs. Keep DF and fragmentation behavior explicit.

**Verification**

Retest the same sourced packets across the size boundary with DF set and inspect counters or captures. Verify both paths after a failure and all relevant stack sizes. Confirm that ICMP error delivery also permits a sender to learn an actual packet-size limit.

### The final link still uses PHP after an explicit-null change

An engineer enables explicit-null at PE1, then expects IPv4 label 0 on the P2→PE2 wire for the PE2 loopback FEC. The capture still shows a native IPv4 packet on that final link.

**Root cause**

The requested change targets PE2’s egress FEC, but the explicit-null setting was applied at PE1.

**Correction**

For the isolated lab test, configure label local advertise explicit-null under PE2’s mpls ldp → address-family ipv4 and commit. Remove the unintended PE1 change and restore the default after measuring. Scope the prefix/peer effect if the production requirement is narrower.

**Verification**

Confirm PE2 advertises IPv4 explicit-null 0, P2’s LFIB sends outgoing 0, and a capture on P2→PE2 contains label 0. PE2 performs the label disposition. Revert PE2 to PHP and confirm the advertisement returns to implicit-null while no label 3 appears on the wire.

### Transit hops disappear from an IP traceroute

After an optional PE1 TTL-policy change, the loopback service and LSP OAM still work. A forwarded IP traceroute exposes fewer core hops, while a locally generated router trace behaves differently.

**Root cause**

The optional change disabled IP-to/from-MPLS TTL propagation for forwarded packets. That changes the customer trace’s hop visibility while the underlying MPLS path still exists.

**Correction**

Compare the result to the intended visibility contract. Restore the baseline with no mpls ip-ttl-propagate disable forwarded and commit when completing the lab. Apply a deliberate, consistent TTL model before carrying customer services.

**Verification**

Compare local and forwarded traces with identical source/destination contexts, actual route/LFIB state and captures. Verify TTL expiry still bounds loops and that ICMP return traffic works. Record the exact platform’s observed behavior.

### LSP echo times out even though the request reaches the egress

In an optional OAM-source variant, PE1 has a local Loopback99 at 10.10.99.1/32 outside OSPF. A probe to the PE2 FEC using that source times out, while the same probe sourced from PE1 Loopback0 succeeds.

**Root cause**

The selected OAM source exists at PE1 but is absent from the return routing domain. PE2 cannot deliver the requested ordinary IPv4 echo reply to it.

**Correction**

Use the routed baseline source 10.10.0.1 for the normal lab. If a dedicated OAM source is required, supply intentional bidirectional reachability and permitted reply handling. Remove Loopback99 when restoring the isolated source experiment.

**Verification**

Confirm the request FEC, egress return code, reply mode, route to source and actual received reply. Repeat ordinary data-plane tests separately. A timeout alone does not establish where the forward path failed.

### A restored OSPF link remains expensive until LDP recovers

After restoring P1–P2, OSPF is Full but the link retains its synchronization penalty and PE1 keeps using the alternatives with transit-link cost sum 50. The baseline normal path has link-cost sum 30. The PE2 loopback cost of 1 makes the installed route metrics 51 and 31 respectively.

**Root cause**

The physical/OSPF link returned while the isolated authentication mismatch still blocked LDP TCP. Synchronization keeps the normal metric from attracting traffic until the link satisfies its readiness conditions.

**Correction**

Restore the baseline by removing the isolated P1 neighbor 10.10.0.3:0 password override under mpls ldp and committing. Use the documented peer-scoped clear mpls ldp neighbor 10.10.0.3 when needed by the controlled test. Verify discovery, session and applicable binding exchange, then observe synchronization completion.

**Verification**

Confirm both ends’ synchronization state, advertised normal cost, PE1’s primary P1→P2→PE2 route and all next-hop label rewrites. Test loss and restoration with timed traffic. The mechanism discourages an unsynchronized link where an alternate exists; it does not create physical redundancy or a fast-reroute timing guarantee.

## Acceptance and restoration

Require a source-and-FEC-specific label walk, the distinction between OSPF metric 31 and transit cost 30, and both post-failure metric-51 paths. Grade the first useful check, receiving label context, correction and restored traffic evidence separately. Retest PHP, expected IGP cost, relevant sessions, packet-size range and original TTL settings before closing the lab.

## Public references

Reviewed 2026-11-26. Device and emulator execution remain pending.

- FEC, label spaces, label control and forwarding architecture. [RFC 3031 · Multiprotocol Label Switching Architecture](https://www.rfc-editor.org/rfc/rfc3031.html)
- Four-byte stack entries, bottom-of-stack and special-purpose labels. [RFC 3032 · MPLS Label Stack Encoding](https://www.rfc-editor.org/rfc/rfc3032.html)
- Discovery, transport roles, sessions, mappings, retention and distribution control. [RFC 5036 · LDP Specification](https://www.rfc-editor.org/rfc/rfc5036.html)
- Uniform, pipe and short-pipe TTL including PHP and nested tunnels. [RFC 3443 · TTL Processing in MPLS Networks](https://www.rfc-editor.org/rfc/rfc3443.html)
- Explicit-null use above another label in a stack. [RFC 4182 · Removing a Restriction on MPLS Explicit NULL](https://www.rfc-editor.org/rfc/rfc4182.html)
- Traffic Class field terminology. [RFC 5462 · MPLS Label Stack Entry EXP Field Renamed TC](https://www.rfc-editor.org/rfc/rfc5462.html)
- E-LSP/L-LSP concepts, class treatment and tunneling models. [RFC 3270 · MPLS Support of Differentiated Services](https://www.rfc-editor.org/rfc/rfc3270.html)
- Service versus transport labels and PE forwarding context. [RFC 4364 · BGP/MPLS IP VPNs](https://www.rfc-editor.org/rfc/rfc4364.html)
- Classic synchronization dependency. The lab uses the documented IOS XR 7.11 mechanism.. [RFC 5443 · LDP IGP Synchronization](https://www.rfc-editor.org/rfc/rfc5443.html)
- Failure detection distinct from routing computation and forwarding repair. [RFC 5880 · Bidirectional Forwarding Detection](https://www.rfc-editor.org/rfc/rfc5880.html)
- MPLS echo, Target FEC Stack and traceroute validation. [RFC 8029 · Detecting MPLS Data-Plane Failures](https://www.rfc-editor.org/rfc/rfc8029.html)
- ELI/entropy label, supported capability and load balancing. [RFC 6790 · The Use of Entropy Labels in MPLS Forwarding](https://www.rfc-editor.org/rfc/rfc6790.html)
- Pseudowire mesh, service labels and MAC-based service forwarding overview. [RFC 4762 · VPLS Using LDP Signaling](https://www.rfc-editor.org/rfc/rfc4762.html)
- Targeted service signaling and pseudowire bindings, updating RFC 4447. [RFC 8077 · Pseudowire Setup and Maintenance Using LDP](https://www.rfc-editor.org/rfc/rfc8077.html)
- Control-word role and payload disambiguation. [RFC 4385 · Pseudowire Emulation Edge-to-Edge Control Word](https://www.rfc-editor.org/rfc/rfc4385.html)
- SR index mapping and shared MPLS label operations. [RFC 8660 · Segment Routing with the MPLS Data Plane](https://www.rfc-editor.org/rfc/rfc8660.html)
- Coexistence, translation boundaries and staged migration. [RFC 8661 · SR MPLS Interworking with LDP](https://www.rfc-editor.org/rfc/rfc8661.html)
- XR LDP activation, transport addresses, filtering, null labels and IGP sync. [Cisco ASR 9000 IOS XR 7.11 · MPLS LDP](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/mpls/configuration/guide/b-mpls-cg-asr9000-711x/implementing-mpls-ldp.html)
- MPLS echo and traceroute examples, return codes and prerequisites. [Cisco ASR 9000 IOS XR 7.11 · MPLS OAM](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/mpls/configuration/guide/b-mpls-cg-asr9000-711x/implementing-mpls-oam.html)
- LDP discovery, bindings, neighbors and synchronization command grammar. [Cisco ASR 9000 · MPLS LDP Commands](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/mpls/command/reference/b-mpls-cr-asr9000/mpls-label-distribution-protocol-commands.html)
- LFIB, interface MPLS state, label allocation and TTL controls. [Cisco ASR 9000 · MPLS Forwarding Commands](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/mpls/command/reference/b-mpls-cr-asr9000/mpls-forwarding-commands.html)
- MPLS ping and traceroute options and image-specific release history. [Cisco ASR 9000 · MPLS OAM Commands](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/mpls/command/reference/b-mpls-cr-asr9000/mpls-oam-commands.html)
- OSPF interface configuration and LDP IGP synchronization. [Cisco ASR 9000 IOS XR 7.11 · OSPF](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/routing/configuration/guide/b-routing-cg-asr9000-711x/implementing-ospf.html)
- OSPF area/interface hierarchy, passive mode and interface cost. [Cisco ASR 9000 · OSPF Commands](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/routing/command/reference/b-routing-cr-asr9000/ospf-commands.html)
- Interface MPLS, stable router ID, explicit-null and verification syntax. [Cisco IOS XE 17 · MPLS LDP](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/mpls/b-mpls/m_mp-ldp-overview.html)
- OSPF/IS-IS synchronization, restrictions and show commands. [Cisco IOS XE 17 · LDP IGP Synchronization](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/mpls/b-mpls/m_mp-ldp-igp-synch.html)
- Different interface and packet MTU accounting across Cisco platforms. [Cisco TAC · MTU Behavior on IOS XR and IOS](https://www.cisco.com/c/en/us/support/docs/ios-nx-os-software/ios-xr-software/116350-trouble-ios-xr-mtu-00.html)
- IP classification, next-hop recursion and imposed-label evidence. [Cisco ASR 9000 · CEF Commands](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/ip-addresses/command/reference/b-ip-addresses-cr-asr9000/b-ipaddr-cr-asr9k_chapter_011.html)
- Virtual router resources and limits of documented feature tests. [Cisco Modeling Labs · IOS XRv 9000](https://developer.cisco.com/docs/modeling-labs/ios-xrv-9000/)
