# SR-MPLS instructor solutions

The expected observations below are modeled from the topology and Cisco command references. Record the actual XR image, platform, command output and capture at delivery time.

## Baseline checkpoints

1. PE1 and PE2 have two Level 2 neighbors each. P1 and P2 have three each. The baseline path is PE1→P1→PE2 at link cost 20. PE1’s next hop is 10.0.12.1 via Gi0/0/0/0. The return path through P1 has the same link cost.
2. The range contains 8,000 labels, so valid indexes are 0–7999. PE2’s LSP advertises base 16000 and range 8000 in Router Capability, and index 4 for 10.0.0.4/32 in extended IP reachability. The active algorithm is 0, ordinary SPF. The node flag is expected on this unique loopback SID.
3. PE1 imposes 16004 toward P1. P1’s label 16004 entry is Pop toward 10.0.24.1 on Gi0/0/0/2. P1 is the penultimate hop and removes the transport label. The one-label IP test therefore has no MPLS shim on P1–PE2. A stack with an inner service label would still be MPLS there.
4. With P2→PE2 metric 5, P1 sees two equal-cost next hops at link cost 10. Direct PE2 uses Pop and P2 uses 16004. P2 then pops toward PE2. PE1 still has a single first hop P1. If only one active rewrite appears at P1, inspect the image’s multipath settings before treating the exercise as confirmed.

For the optional stack probe, PE1 sends [16003, 16004] with 16003 on top to P1. P1 pops 16003 toward P2. P2 processes 16004 and sends it back via P1, which pops the final label toward PE2. Returning through P1 is expected because the active segment changed from P2 to PE2.

## Protection exercise

- PE1–P1 failure. The point of local repair is PE1. Link protection may send traffic to P2 and then through P1 over the unaffected P2–P1 link. The converged path has link cost 35. A P1 node failure removes P1 from the topology and forces the cost-45 path PE1→P2→PE2. Link and node protection model different failures.
- P1–PE2 failure. The point of local repair is P1. The next hop is P2 via 10.0.23.1. Before failure, P2 reaches PE2 via P1 at link cost 15, beating its direct cost 25. Handing P2 a bare destination Node-SID during the immediate repair can send traffic back toward P1. A valid repair can force P2’s outgoing adjacency to PE2 with P2’s local Adj-SID. Record the actual programmed stack and resolve its labels on their receiving routers.
- After the P1–PE2 failure has converged, PE1 still uses P1 and the full path is PE1→P1→P2→PE2 at link cost 40. P1’s portion has link cost 30. P2’s normal LFIB now sends directly toward PE2.
- Check for a computed FRR route and an installed rewrite. During the event, inspect capture and probes. If the image has no working backup or the capture interval cannot resolve the immediate repair, record the measured converged route and keep the repair prediction as separate evidence.

## Ticket 1 · Missing Prefix-SID

Apply on PE2 from XR EXEC after recording the baseline. Use the lab console.

```text
configure
router isis CORE
 interface Loopback0
  address-family ipv4 unicast
   no prefix-sid index 4
   exit
  exit
 exit
commit
end
```

Expected chain. PE2’s IP reachability entry remains, but its Prefix-SID sub-TLV is absent. Compare `show isis database verbose` from PE1 with the baseline, then read the active CEF entry. Restore `prefix-sid index 4` in the same context and commit. Confirm the sub-TLV, PE1 push, P1 Pop, and SR OAM where supported. Ordinary IP ping alone can still succeed during this fault.

## Ticket 2 · Missing protection

Apply on P1 from XR EXEC after proving the backup. Use the lab console.

```text
configure
router isis CORE
 interface GigabitEthernet0/0/0/2
  address-family ipv4 unicast
   no fast-reroute per-prefix ti-lfa
   no fast-reroute per-prefix
   exit
  exit
 exit
commit
end
```

Expected chain. The interface still participates in SR-MPLS and steady-state forwarding. P1’s primary via 10.0.24.1 lacks a preinstalled repair. Locate the protected primary interface from `show isis fast-reroute 10.0.0.4/32 detail` and `show cef ipv4 10.0.0.4/32 detail`. Restore both FRR statements from stage 04. Verify the backup via P2 and test the outage again.

## Grading

- Ask the student to explain a route, an advertised index, a local label, and an outgoing rewrite using one coherent packet walk.
- Require the actual command and the field that supports each diagnosis.
- Have the student predict both the immediate repair and the converged SPF path before failing a link. Use actual observed timing and packet loss when grading the repair.
- Treat reasoning and emulator captures as their own forms of evidence. Keep hardware conclusions tied to verified hardware data.
