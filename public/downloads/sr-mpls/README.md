# SR-MPLS with IS-IS and TI-LFA

Build a four-router IPv4 MPLS transport in stages, read the forwarding state, and prove what changes during a link failure. CLI syntax uses the Cisco ASR 9000 IOS XR 7.11.x guides. The configuration and evidence model were reviewed against public documentation. Router and emulator execution are pending.

## Build the topology

- In CML, create a lab with four IOS XRv 9000 nodes and attach links using the Workbench. Choose the image from the reference platform available on your CML installation. Open one console per node.
- In EVE-NG, create a lab with four Cisco XRv 9000 nodes from the appropriate QEMU template for your licensed image. Connect the same five data links and open each console.
- Match actual port numbering using `show ipv4 interface brief` and the emulator link inventory. Substitute corresponding port names in every configuration and fault-control step when the image uses different numbering. Use the control-plane image documentation to check IS-IS SR-MPLS, TI-LFA, MPLS forwarding and SR OAM individually. Allocate VM resources per the selected image and host.
- On hardware, dedicate four MPLS-capable routers and use console or out-of-band access. Match interface type and line card support, and allow sufficient MTU for label overhead on primary and repair paths. Keep the practice network isolated.

```text
       10              10
 PE1 -------- P1 ------------- PE2
   \          |               /
 20 \         | 5            / 25
     -------- P2 ------------
```

Use IPv4 Level 2 IS-IS instance `CORE`, area `49.0001`, and SRGB 16000–23999. Every link metric below applies in both directions at baseline. `Gi` denotes `GigabitEthernet`.

| Subnet | Endpoint A | Endpoint B | IS-IS metric each way |
| --- | --- | --- | ---: |
| 10.0.12.0/31 | PE1 Gi0/0/0/0 10.0.12.0 | P1 Gi0/0/0/0 10.0.12.1 | 10 |
| 10.0.13.0/31 | PE1 Gi0/0/0/1 10.0.13.0 | P2 Gi0/0/0/0 10.0.13.1 | 20 |
| 10.0.23.0/31 | P1 Gi0/0/0/1 10.0.23.0 | P2 Gi0/0/0/1 10.0.23.1 | 5 |
| 10.0.24.0/31 | P1 Gi0/0/0/2 10.0.24.0 | PE2 Gi0/0/0/0 10.0.24.1 | 10 |
| 10.0.34.0/31 | P2 Gi0/0/0/2 10.0.34.0 | PE2 Gi0/0/0/1 10.0.34.1 | 25 |

| Router | Loopback0 | NET | SID index |
| --- | --- | --- | ---: |
| PE1 | 10.0.0.1/32 | 49.0001.0000.0000.0001.00 | 1 |
| P1 | 10.0.0.2/32 | 49.0001.0000.0000.0002.00 | 2 |
| P2 | 10.0.0.3/32 | 49.0001.0000.0000.0003.00 | 3 |
| PE2 | 10.0.0.4/32 | 49.0001.0000.0000.0004.00 | 4 |

## Apply the configurations

Extract `xr-configs.zip`. The four stage directories contain one IOS XR console script per router. Paste the matching file in XR EXEC mode after reviewing the port mapping. If a paste shows a syntax or commit error, stop there, inspect the failed candidate, and resolve it before continuing. Use the full files in `final/` as the post-exercise instructor reference. They assume clean configurations on the four lab routers. Preserve platform bootstrap and management configuration.

### 1. Address the links and bring up IS-IS

Apply `01-addressing/` to all four nodes. Verify both endpoints of each link can ping each other. Apply `02-isis/`. Check all Level 2 adjacencies and calculate the baseline path from PE1 to PE2 before reading the RIB.

```text
show ipv4 interface brief
show isis adjacency
show route ipv4 10.0.0.4/32
ping 10.0.0.4 source 10.0.0.1
```

The route’s cost can include the metric PE2 advertises for its loopback. Record that metric separately from the sum of inter-router costs. Take an IP-only capture on PE1–P1 if capture is available.

### 2. Add SR capability and Node-SIDs

Apply `03-sr-mpls/` to all four nodes. Determine the highest usable index and predict PE1’s on-wire label for PE2. Find PE2’s advertised SRGB and Prefix-SID in its LSP from PE1. Check the IPv4 topology and algorithm.

```text
show mpls label table label 16000 detail
show isis database verbose
show isis route sr-only
```

Find a dynamic Adj-SID for P2→PE2 in P2’s advertisement when the image exposes it. Record the originating router and the adjacent neighbor so that you can distinguish this directed local instruction from a global index.

### 3. Prove label forwarding

Compare the ingress and transit entries. From PE1, inspect CEF for the imposed label. On P1, inspect that incoming label and identify the outgoing action. Record what you expect to see on each of the two wires. Compare captures for one Loopback0-sourced IPv4 probe if available.

```text
show cef ipv4 10.0.0.4/32 detail
show mpls forwarding labels 16004 detail
```

On supporting images, enable `mpls oam` in IOS XR global configuration mode on all four routers and commit before using MPLS OAM. From PE1, compare an ordinary IP probe with these FEC-specific probes.

```text
ping 10.0.0.4 source 10.0.0.1
ping sr-mpls 10.0.0.4/32 fec-type igp isis
traceroute sr-mpls 10.0.0.4/32 fec-type igp isis
```

Optional stack exercise. With baseline metrics, the shortest path to P2 starts at P1. From PE1, send a diagnostic label stack via P1 with P2 as the first segment and PE2 as the second. Inspect each link before comparing the trace.

```text
traceroute sr-mpls multipath labels 16003,16004 output interface GigabitEthernet 0/0/0/0 nexthop 10.0.12.1
```

This is a diagnostic Nil-FEC probe. It sends labels on the named interface without installing an SR policy for ordinary IP traffic.

Optional ECMP experiment. Under P2’s `router isis CORE` → `interface GigabitEthernet0/0/0/2` → `address-family ipv4 unicast`, set `metric 5` and commit. Predict how many next hops appear on P1 and PE1. Inspect CEF and LFIB, record the per-next-hop label actions, and restore the P2 outbound metric to 25.

### 4. Observe link protection and convergence

Save a steady-state snapshot before applying `04-ti-lfa/`. Apply the stage if the platform supports TI-LFA. From PE1 and P1, capture the results of the following commands before introducing any outage.

```text
show isis fast-reroute 10.0.0.4/32 detail
show cef ipv4 10.0.0.4/32 detail
show mpls forwarding labels 16004 detail
```

Run probes from PE1 and record the start time. At PE1, isolate the Gi0/0/0/0 link to P1 and observe the repair and convergence. Restore that interface and confirm the original route. At P1, repeat against Gi0/0/0/2 to PE2. Apply `shutdown` in IOS XR global interface configuration mode, commit, and use `no shutdown` plus commit to restore the link. Use one fault at a time. A virtual link change may be signaled differently from a physical fiber failure.

Record the repair point, backup egress, actions on the label stack, and converged route. If the image cannot program TI-LFA, use the diagram and your forwarding evidence to model the immediate repair, and observe ordinary IS-IS reconvergence separately. Periodic pings and virtual timestamps are evidence at their observed granularity.

### 5. Troubleshoot two tickets

Have an instructor apply one fault at a time and restore the original baseline between tickets. Record the symptom, hypotheses, decisive command, exact evidence, fix, and post-fix verification.

1. PE1 still has an IP route to PE2’s loopback, but an SR-specific probe no longer verifies that Prefix-SID.
2. The PE1-to-PE2 steady-state path works. There is no preinstalled repair for the P1–PE2 primary link at the affected router.

## References

- [Cisco IOS XRv 9000 in CML](https://developer.cisco.com/docs/modeling-labs/ios-xrv-9000/)
- [EVE-NG XRv 9000 node guidance](https://www.eve-ng.net/index.php/documentation/howtos/howto-add-cisco-xrv-9000/)
- [ASR 9000 IOS XR 7.11.x IS-IS SR](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-711x/configure-sr-for-is-is-protocol.html)
- [ASR 9000 IOS XR 7.11.x SRGB and SRLB](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-711x/configure-srgb-srlb.html)
- [ASR 9000 IOS XR 7.11.x TI-LFA](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-711x/configure-ti-lfa.html)
- [ASR 9000 IOS XR 7.11.x SR OAM](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-711x/using-sr-oam.html)
