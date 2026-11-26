# MPLS Foundations student workbook

Build an OSPF/LDP core, predict each label action, and validate it with your observations. CLI is documentation-reviewed. Supplied output descriptions are modeled expectations.

## Build the four-node forwarding laboratory

Create the topology manually and capture a known initial checkpoint.

Use four MPLS-capable IOS XR nodes named PE1, P1, P2 and PE2. The CLI baseline is Cisco ASR9000 IOS XR 7.11.x documentation; XRv9000 in CML/EVE is a candidate that must be checked on the actual licensed image. This material has undergone documentation review only. No router execution, packet capture, emulator import or measured convergence is claimed.

### OSPF/LDP topology

~~~text
PE1 --10-- P1 --10-- P2 --10-- PE2
  \-------40------/     P1 -------40------- PE2

Exact alternate links: PE1—P2 cost 40; P1—PE2 cost 40.
Baseline: PE1 → P1 → P2 → PE2; link sum30, /32 OSPF metric 31.
P1—P2 down: PE1 → P1 → PE2 or PE1 → P2 → PE2;
link sum50, /32 OSPF metric 51. All costs bidirectional.
~~~

| Node | Loopback0 / LDP identity / transport | Core ports |
| --- | --- | --- |
| PE1 | 10.10.0.1/32 | GigabitEthernet0/0/0/0, GigabitEthernet0/0/0/1 |
| P1 | 10.10.0.2/32 | GigabitEthernet0/0/0/0, GigabitEthernet0/0/0/1, GigabitEthernet0/0/0/2 |
| P2 | 10.10.0.3/32 | GigabitEthernet0/0/0/0, GigabitEthernet0/0/0/1, GigabitEthernet0/0/0/2 |
| PE2 | 10.10.0.4/32 | GigabitEthernet0/0/0/0, GigabitEthernet0/0/0/1 |

| Link | Endpoint A | Endpoint B | OSPF cost |
| --- | --- | --- | --- |
| PE1—P1 | GigabitEthernet0/0/0/0 10.10.12.0/31 | GigabitEthernet0/0/0/0 10.10.12.1/31 | 10 |
| PE1—P2 | GigabitEthernet0/0/0/1 10.10.13.0/31 | GigabitEthernet0/0/0/0 10.10.13.1/31 | 40 |
| P1—P2 | GigabitEthernet0/0/0/1 10.10.23.0/31 | GigabitEthernet0/0/0/1 10.10.23.1/31 | 10 |
| P1—PE2 | GigabitEthernet0/0/0/2 10.10.24.0/31 | GigabitEthernet0/0/0/0 10.10.24.1/31 | 40 |
| P2—PE2 | GigabitEthernet0/0/0/2 10.10.34.0/31 | GigabitEthernet0/0/0/1 10.10.34.1/31 | 10 |

- In CML, create four available XRv9000 nodes; in EVE-NG use supported templates for your licensed XR images. Apply the vendor resource recommendations. No pretested .yaml/.unl import is supplied.
- Map all five data links exactly. Preserve management/bootstrap settings outside these files; verify real port names and MPLS/OSPF/OAM support.
- Extract the ZIP and read README.md. Apply initial files to each router from EXEC. Every XR file enters configuration and ends with commit/end. Inspect show configuration failed if a commit is rejected.
- Use only the main XR files for this run. ios-xe-reference is a separate alternative. Fault files are instructor controls and are not part of initial/final.
- Take an initial snapshot and record release, image, port mapping and verification limitations. Save actual output in your own worksheet; supplied outputs are interpreted expectations.

## Apply and restore checkpoints

Use the console and a clean snapshot. Apply each node's matching file from EXEC and verify its commit before continuing.

1. Apply initial/ on all four routers.
2. Apply stages/01-ospf/ on all four routers.
3. Apply stages/02-ldp/ on all four routers.
4. Save a healthy PHP checkpoint and record each XR commit ID.
5. Apply stages/03-explicit-null/PE2-apply.cfg to PE2, observe the change, then apply PE2-restore-php.cfg.
6. Apply stages/04-sync/ on all four routers and verify the healthy final baseline.
7. Apply one optional or instructor fault at a time and restore its matching controls afterward.

The final/ files describe a clean desired baseline. Pasting them over unknown state can leave unrelated settings or faults present. Restore a saved snapshot or explicitly remove injected changes. Keep management and bootstrap settings outside this exercise.

For a separate all-IOS-XE run, use ios-xe-reference/ and map the data-port names. Its interface MTU accounting differs from XR. Check the platform, license, release, MPLS and OAM support. Emulator import compatibility has not been tested.

## 1. Establish OSPF and IP reachability

Prove the path independently of MPLS.

- Apply stages/01-ospf on all four nodes.
- Verify expected FULL adjacency counts2/3/3/2. Test direct links, then all four loopbacks using a loopback source.
- Record PE1’s next hop, output interface, administrative distance and metric for10.10.0.4/32. Explain why link sum30 yields route metric 31.
- Explain why a successful ping at this stage is possible without LDP.

### Student checks

IOS XR 7.11.x — ASR 9000 reference

Run destination checks on PE1 and reverse-direction checks on PE2.

~~~text
show ospf neighbor
show route ipv4 10.10.0.4/32
ping 10.10.0.4 source 10.10.0.1
~~~

Pass when all link adjacencies and sourced loopback probes work and the metric is explained.

## 2. Establish discovery, TCP and bindings

Prove LDP control-plane layers without conflating them.

- Apply stages/02-ldp to all four nodes.
- Record each LDP identifier, Hello discovery source, advertised transport address and actual TCP endpoints.
- Count operational sessions per router. Correlate UDP discovery with TCP transport and label mapping exchange.
- For PE2’s loopback, record local and remote bindings on PE1/P1/P2. Identify which remote label belongs to the IGP next hop.

### Control-plane checks

IOS XR 7.11.x — ASR 9000 reference

Use observed dynamic label values in your worksheet.

~~~text
show mpls ldp discovery detail
show mpls ldp neighbor detail
show mpls ldp bindings 10.10.0.4/32 detail
~~~

Pass requires operational sessions and a selected downstream binding for the FEC, plus an explanation of label ownership.

## 3. Trace push, swap and PHP

Join the selected route to each data-plane rewrite.

- Read CEF and MPLS forwarding at PE1/P1/P2 for10.10.0.4/32.
- Draw the packet on all three links of the primary path; record label owner, label value, bottom-of-stack and final payload type.
- Run MPLS ping and traceroute from PE1. Compare with ordinary IP ping/traceroute.
- If supported, capture the three primary links to validate your diagram. A supplied expectation is not a packet capture.

### Forwarding checks

IOS XR 7.11.x — ASR 9000 reference

MPLS OAM is enabled by stage02.

~~~text
show route ipv4 10.10.0.4/32
show mpls ldp bindings 10.10.0.4/32 detail
show mpls ldp forwarding 10.10.0.4/32 detail
show cef ipv4 10.10.0.4/32 detail
show mpls forwarding
ping mpls ipv4 10.10.0.4/32
traceroute mpls ipv4 10.10.0.4/32
~~~

Pass requires a consistent push/swap/pop chain and correct handling of implicit-null3.

## 4. Move disposition to PE2 with explicit-null

Change one egress advertisement and observe where processing changes.

- Save the healthy PHP checkpoint. Apply stages/03-explicit-null/PE2-apply.cfg on PE2.
- Observe PE2’s local advertisement, P2’s received label and P2’s LFIB rewrite. Compare the upstream P1 rewrite.
- Capture or explain the P2→PE2 packet: label0, not label3. State how this differs with an inner service label.
- Explain which other PE2 local FECs may be affected. Restore PHP using the supplied restore file and verify the original state.

### Compare the same FEC

IOS XR 7.11.x — ASR 9000 reference

Inspect PE2 advertisement and P2 forwarding; run the probe on PE1.

~~~text
show mpls ldp bindings 10.10.0.4/32 detail
show mpls ldp forwarding 10.10.0.4/32 detail
show mpls forwarding
ping mpls ipv4 10.10.0.4/32
~~~

Pass requires evidence of outgoing0 during the experiment and Pop after restoration.

## 5. Observe failure and synchronization

Distinguish an IP link failure from missing LDP readiness.

- From the healthy stage02 PHP checkpoint, ask the instructor to inject a P1–P2 LDP session fault while preserving the IP adjacency. Collect OSPF, discovery, session, binding and CEF evidence; explain any successful IP fallback.
- Restore the session and apply stages/04-sync on every node. Confirm healthy synchronization state. Repeat the isolated session fault and compare advertised metrics and selected paths.
- Restore LDP. Then take P1–P2 physically down, predict PE1’s next hops, and verify ECMP metric 51.
- Restore the link and prove OSPF, LDP, synchronization, LFIB and MPLS OAM have returned to the primary checkpoint.

### Failure evidence

IOS XR 7.11.x — ASR 9000 reference

Use timestamps. A physical failure and session-only failure have different control-plane evidence.

~~~text
show mpls ldp discovery detail
show mpls ldp neighbor detail
show mpls ldp ipv4 igp sync
show ospf interface GigabitEthernet0/0/0/1
show route ipv4 10.10.0.4/32
show cef ipv4 10.10.0.4/32 detail
~~~

Pass requires a causal explanation of each transition. Record measured times only from your own run.

## 6. Measure TTL and MTU boundaries

Test one controlled variable at a time and restore both ends.

- Start from the healthy final checkpoint and record ordinary traceroute plus IP/MPLS TTL observations.
- Apply optional/ttl disable-local files to PE1 and PE2. Repeat router-originated probes, explain the local versus forwarded scope, and restore both.
- Record interface, IP and labeled forwarding MTUs. Apply optional/mtu reduce files to both P1 and P2; wait for adjacency recovery.
- Use extended ping with DF and source 10.10.0.1 to test PE2 with IP datagram sizes around1496 and1500. Capture the packet or inspect counters/ICMP if possible. Compare direct unlabelled link traffic.
- Restore both MTUs to 1600. Retest the same sizes, OSPF/LDP sync and MPLS OAM. Explain the 4-byte single-label and8-byte two-label overhead without claiming the latter was configured.

### Read the effective limits

IOS XR 7.11.x — ASR 9000 reference

Use the interactive ping DF prompt or parser-supported option on your exact image.

~~~text
show interfaces GigabitEthernet0/0/0/1
show ipv4 interface GigabitEthernet0/0/0/1
show cef ipv4 10.10.0.4/32 detail
show mpls forwarding
~~~

Pass requires a size/DF/result table, correct MTU accounting and successful restoration, rather than an assumed universal cutoff.

## 7. Diagnose blind faults and defend the result

Submit evidence that distinguishes protocol layers.

- The instructor selects a discovery, transport, authentication, null-label, TTL or MTU fault from the separate controls.
- Before changing configuration, state the symptom, two plausible causes and the next discriminating check.
- Identify the first broken layer and make the smallest correction. Prove both directions and the selected labeled path.
- Deliver a one-page run sheet: release/image, topology, actual labels, push/swap/pop diagram, failure comparison, MTU/TTL measurements, restore evidence and known emulator limitations.
- Optional: rebuild using the separate IOS XE files and compare the configuration hierarchy. Do not mix configuration families in one candidate.

## Evidence worksheet

Record the image and release, FEC and source, each IGP next hop, receiving-router label, outgoing action, packet size, expected and observed results, and restore check. Distinguish a paper trace, simulation and verified device observation.

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
