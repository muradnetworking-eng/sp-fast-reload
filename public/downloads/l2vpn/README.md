# L2VPN: VPWS and three-PE LDP VPLS

Build a point-to-point Ethernet service on VLAN 100 and a multipoint VPLS LAN on VLAN 200. The primary syntax reference is Cisco ASR 9000 IOS XR 7.11.x; customer endpoints use IOS XE 17.x C8000V candidates. Public documentation was reviewed on 2026-11-27. Router/emulator execution, imported topology compatibility and packet capture validation remain pending. Expected observations below are models, not device output.

## Manual CML / EVE-NG setup

Create five MPLS-capable IOS XR nodes: PE1, P1, P2, PE2 and PE3. Create three IOS XE nodes: CE1, CE2 and CE3. Use available licensed XRv 9000/C8000V images in CML or supported templates for licensed images in EVE-NG. Allocate vendor-recommended resources and verify interface names, L2transport, CW, VPLS, LDP and OAM support on the actual image.

No tested CML YAML or EVE UNL import is supplied. Wire the seven physical links manually. Keep console access, management/bootstrap settings and image-specific prerequisites outside these configuration examples.

The [CML XRv 9000 reference](https://developer.cisco.com/docs/modeling-labs/ios-xrv-9000/) establishes a candidate for point-to-point VPWS testing; its L2 MPLS test does not establish VPLS/bridge-domain data-plane support. Verify VPLS capability on the exact image and platform separately. If bridge-domain/VFI configuration or forwarding is unsupported, stop that phase and use a qualified physical or supported platform. Legacy XRv is a different image with separate L2 pseudowire data-plane limitations. EVE hosting does not itself add platform features.

~~~text
CE1 --- PE1 --- P1 --- P2 --- PE2 --- CE2
                        |
                       PE3 --- CE3
~~~

| Node | Role | Loopback0 |
| --- | --- | --- |
| PE1 | VPWS + VPLS PE | 10.20.0.1/32 |
| P1 | MPLS transit | 10.20.0.2/32 |
| P2 | MPLS transit | 10.20.0.3/32 |
| PE2 | VPWS + VPLS PE | 10.20.0.4/32 |
| PE3 | VPLS PE | 10.20.0.5/32 |

OSPF process CORE uses area 0, transit cost 10 in both directions and Loopback0 cost 1. PE1 to PE2/PE3 has installed /32 metric 31. PE2 to PE3 has metric 21. LDP runs on all four provider links. Each LDP router ID and explicit transport address equals its Loopback0. No BGP, route reflector, VRF or customer IP address is configured on provider service interfaces.

| Physical link | Endpoint A | Endpoint B |
| --- | --- | --- |
| PE1–P1 | PE1 Gi0/0/0/0 10.20.12.0/31 | P1 Gi0/0/0/0 10.20.12.1/31 |
| P1–P2 | P1 Gi0/0/0/1 10.20.23.0/31 | P2 Gi0/0/0/0 10.20.23.1/31 |
| P2–PE2 | P2 Gi0/0/0/1 10.20.34.0/31 | PE2 Gi0/0/0/0 10.20.34.1/31 |
| P2–PE3 | P2 Gi0/0/0/2 10.20.35.0/31 | PE3 Gi0/0/0/0 10.20.35.1/31 |
| PE1–CE1 | PE1 Gi0/0/0/1 | CE1 Gi1 |
| PE2–CE2 | PE2 Gi0/0/0/1 | CE2 Gi1 |
| PE3–CE3 | PE3 Gi0/0/0/1 | CE3 Gi1 |

| Service | PE attachments | CE IPv4 endpoints | CE IPv6 endpoints |
| --- | --- | --- | --- |
| VPWS PW-ID 100 | PE1/PE2 Gi0/0/0/1.100 | CE1 Gi1.100 192.0.2.1/24; CE2 192.0.2.2/24 | 2001:db8:100::1/64 and ::2/64 |
| VPLS PW-ID 200 | PE1/PE2/PE3 Gi0/0/0/1.200 | CE1/CE2/CE3 Gi1.200 198.51.100.1/.2/.3/24 | 2001:db8:200::1/::2/::3/64 |

The local tag is 100 or 200 at the corresponding attachment. Each XR L2transport subinterface classifies dot1q and uses rewrite ingress tag pop 1 symmetric. The tag is removed before raw Ethernet PW transport and restored according to the receiving PE's local classifier.

CE1 and CE2 are routers with both subnets connected. They can route between those subnets. Cross-subnet pings therefore cannot prove provider L2 separation or end-to-end security isolation. Prove provider separation with AC/PW/BD membership, VLAN classification, MAC tables and packet captures. The CE baseline uses routed subinterfaces, not a bridge or switch loop.

## Files and application order

Extract l2vpn-configs.zip. Apply matching node files from EXEC. XR files enter configuration, commit and end; XE configuration applies as entered. Verify each commit and inspect show configuration failed after rejection.

1. Apply initial/ on all eight nodes.
2. Apply stages/01-underlay/ on all five XR nodes.
3. Apply stages/02-acs/ on PE1, PE2, PE3 and CE1, CE2, CE3.
4. Apply stages/03-vpws/ on PE1 and PE2.
5. Apply stages/04-vpls/ on PE1, PE2 and PE3.

Save a known checkpoint after each healthy stage and before every fault. The final/ directory contains eight complete clean configurations, with consolidated hierarchies. Full final files are desired state, not configuration replacement commands: additive pasting does not delete an incorrect PW neighbor, changed classifier, subinterface MTU or arbitrary injected state. Use paired restore files or a known snapshot.

The faults/ directory is not a stage. Optional translation and split-horizon controls are separate experiments; restore each before continuing.

## 1. Prove the transport

Before services are configured, expected OSPF and link-LDP neighbor counts on PE1/P1/P2/PE2/PE3 are 1/2/3/1/1.

From PE1:

~~~text
show ospf neighbor
show route ipv4 10.20.0.4/32
show route ipv4 10.20.0.5/32
ping 10.20.0.4 source 10.20.0.1
ping 10.20.0.5 source 10.20.0.1
show mpls ldp discovery detail
show mpls ldp neighbor detail
show mpls ldp bindings 10.20.0.4/32 detail
show cef ipv4 10.20.0.4/32 detail
ping mpls ipv4 10.20.0.4/32
traceroute mpls ipv4 10.20.0.4/32
~~~

Check all remote PE loopbacks in both directions. IP reachability is needed by targeted LDP, while MPLS transport is needed by customer label stacks. The same ordinary IP ping can succeed in a state where the PW transport is not usable.

After service configuration, remote PE-to-PE targeted sessions supplement the core link sessions. Do not continue comparing total neighbor counts to the pre-service counts without inspecting discovery sources.

## 2. Verify attachments and control-word intent

At PE1:

~~~text
show running-config interface GigabitEthernet0/0/0/1
show running-config interface GigabitEthernet0/0/0/1.100
show running-config interface GigabitEthernet0/0/0/1.200
show interfaces GigabitEthernet0/0/0/1.100
~~~

Inspect every endpoint. Provider attachments are L2transport and have no customer IP address. The physical link and subinterface can be administratively up even if the CE sends the wrong service tag; classification must be checked separately.

The shared PW class is:

~~~text
l2vpn
 pw-class L2-CW
  encapsulation mpls
   protocol ldp
   control-word
   transport-mode ethernet
~~~

Every PW neighbor attaches L2-CW. The baseline explicitly enables the control word at both ends and uses raw Ethernet transport. Verify the actual local/remote PW type and negotiated CW enabled in service detail.

The four-byte CW appears after the MPLS labels and before the Ethernet frame. It is not another MPLS label. It helps avoid payload-type misinterpretation by some core hashing heuristics. This class does not promise sequencing merely because CW is enabled.

## 3. Verify VPWS

The service is xconnect group VPWS / p2p CE1-CE2. PE1 points to PE2 10.20.0.4 with PW-ID 100; PE2 reciprocates toward 10.20.0.1 with ID 100. The local .100 attachment and remote PW form the two endpoints.

~~~text
show l2vpn xconnect group VPWS xc-name CE1-CE2 detail
show mpls ldp discovery detail
show mpls ldp neighbor detail
show mpls forwarding
ping mpls pseudowire 10.20.0.4 100
~~~

Run the reverse OAM command on PE2 using peer 10.20.0.1. The PW OAM ID is positional; do not insert the configuration keyword pw-id into this ping command. Read actual OAM return codes and image support.

In xconnect detail record AC state, PW state, peer, ID, PW type, local and remote MTU, CW status, directional labels and received status TLVs. A targeted TCP session can be operational while one PW is mismatched. Several services to the same peer can share the session.

From CE1:

~~~text
show arp
show ipv6 neighbors
ping 192.0.2.2 source GigabitEthernet1.100
ping ipv6 2001:db8:100::2 source GigabitEthernet1.100
~~~

Run reverse probes from CE2. Successful PW OAM alone does not prove CE tag classification or ARP/ND delivery. Conversely, one ping cannot explain every layer of the service.

## 4. Verify three-PE VPLS

Each PE has bridge group VPLS / bridge-domain LAN200 / VFI MESH200. The BD contains one local .200 AC and a VFI with two PW-ID 200 neighbors. The three pairs PE1–PE2, PE1–PE3 and PE2–PE3 form the full mesh.

~~~text
show l2vpn bridge-domain bd-name LAN200 detail
show platform
show l2vpn forwarding bridge-domain VPLS:LAN200 mac-address detail location <actual-node>
ping mpls pseudowire 10.20.0.4 200
ping mpls pseudowire 10.20.0.5 200
~~~

Replace <actual-node> using the real forwarding location from show platform. Do not type the placeholder literally. Some virtual images have limited hardware/location views; record that limitation instead of inventing output. Use each PE's actual remote peers for OAM.

Test every CE pair in both IP families and both directions on a platform that passed the VPLS capability check. CE1 examples:

~~~text
ping 198.51.100.2 source GigabitEthernet1.200
ping 198.51.100.3 source GigabitEthernet1.200
ping ipv6 2001:db8:200::2 source GigabitEthernet1.200
ping ipv6 2001:db8:200::3 source GigabitEthernet1.200
~~~

Also test CE2↔CE3. Record local versus remote source-MAC learning in LAN200. On PE1, a CE1 source frame is learned on the local AC; received CE2/CE3 source frames can populate their respective remote PWs. Entries depend on actual received source traffic and aging. Do not require a fixed all-CE MAC count after one ping. VPWS does not require bridge MAC learning. A BD summary can be up while an individual PW or attachment is unusable.

## 5. Observe known unicast, BUM and split horizon

MAC learning is based on source addresses. A learned destination sends known unicast to its selected port. Broadcast, appropriate multicast and unknown unicast replicate to eligible ports. Core VFI PWs are in a split-horizon relationship: a frame received from one core PW is not forwarded to another core PW in that group.

Generate ARP/ND traffic and observe captures or per-port counters before and after. ARP requests are broadcast; IPv6 ND includes multicast. Neither is proof that an unknown destination MAC was tested.

For a controlled unknown-unicast example, first confirm that 198.51.100.254 is unused and MAC 0200.0000.0254 is absent from LAN200. On CE1, use a supported static ARP entry:

~~~text
configure terminal
arp 198.51.100.254 0200.0000.0254 arpa
end
ping 198.51.100.254 source GigabitEthernet1.200 repeat 3
~~~

This generates Ethernet unicast toward a deliberately unknown, locally administered unicast MAC. No reply is expected. Capture the frame at the ingress and remote eligible attachments/PWs; do not interpret timeout as failure of the flooding experiment. Check actual parser support on your image.

Remove the exact temporary entry afterward:

~~~text
configure terminal
no arp 198.51.100.254 0200.0000.0254 arpa
end
~~~

Do not create a real destination using that MAC during the test. Distinguish expected replication from loops or duplicate delivery.

For a missing-mesh demonstration, apply optional/split-horizon/PE1-apply.cfg. It removes only PE1's direct VFI neighbor to PE3. PE2 must not act as a transit bridge from its PE1 PW to its PE3 PW. Test CE1↔CE3 failure and use CE1↔CE2 plus CE2↔CE3 as healthy controls. Verify PW state and captures before concluding why a frame was absent. Restore the direct neighbor with the matching file and prove the full mesh again.

## 6. Trace labels, CW and local tags

For CE1 to CE2 over VPWS, use symbolic labels until you observe actual values:

| Segment | Modeled contents or operation |
| --- | --- |
| CE1→PE1 | Customer Ethernet with local service tag 100 and IP payload |
| PE1 ingress | Classify .100; remove one service tag; select PW |
| PE1→P1 | Transport label advertised by P1; PW label advertised by PE2; CW; normalized Ethernet/IP |
| P1→P2 | Swap outer transport label to P2's label; preserve PW label and CW |
| P2→PE2 | Transport PHP leaves PW label, CW and customer Ethernet/IP |
| PE2 egress | Service disposition; remove PW/CW; restore local tag 100; send CE2 |

Return traffic uses its own directional PW label. P1 and P2 do not learn customer MACs or route customer IP for this service. VPLS uses the same transport layering, then performs bridge-domain forwarding at the service PE.

Transport PHP does not expose plain customer IP to PE2. A PW label and negotiated CW remain. Record the allocating router for each label; equal numeric values at different routers do not imply global ownership.

## 7. Verify the two distinct MTU budgets

All access parents use XR frame MTU 1514. Under Cisco's EVC model a one-tag subinterface inherits 1518; subtract Ethernet header 14 and the popped tag 4 to model signaled service MTU 1500. Read actual local/remote service values on the selected image. Do not infer negotiated state solely from the running configuration.

For a 1500-byte IP packet after the local service tag is removed:

| Component | Bytes |
| --- | --- |
| Customer Ethernet header | 14 |
| Customer IP datagram | 1500 |
| Control word | 4 |
| Two MPLS labels | 8 |
| Required MPLS payload | 1526 |
| Provider untagged Ethernet header | 14 |
| Provider frame excluding FCS | 1540 |

Core XR frame MTU 1600 includes the provider Ethernet header, leaving 1586 bytes of payload. Core IPv4 MTU is 1500. The model excludes customer/provider FCS, preamble and interpacket gap. Additional labels or retained VLANs need a new calculation.

Matching signaled PW MTUs do not prove core headroom, and larger core MTU does not repair a service-attribute mismatch. Use CE extended ping to set the source, size and IPv4 DF prompt when testing 1500-byte IP. Record real success/error and capture evidence. Small probes do not establish maximum-size service.

## 8. Reversible local tag translation

From a healthy baseline, apply optional/translation/PE2-apply.cfg and CE2-apply.cfg. Both logical .100 interfaces now use local tag 110, while PE1 uses tag 100 and PW-ID stays 100.

Symmetric pop/push normalization permits different local attachment tags without making the PW-ID a VLAN number. Verify PE2 classifier, CE2 transmitted tag, negotiated PW attributes and both IP families. VPLS VLAN 200 should remain a healthy control.

Apply both matching restore files and prove tag 100 baseline. Changing only the PE classifier while the CE still sends the old tag is the separate tag-mismatch fault, not successful translation.

## Blind fault tasks and acceptance

The instructor selects one control from faults/: wrong PW-ID, local AC tag mismatch, local AC shutdown, service MTU mismatch or core-LDP removal. Do not open instructor.md before collecting evidence.

State service, affected pair/direction and expected blast radius. Follow physical/link state → attachment classification → targeted session → PW-ID/type/CW/MTU/status → transport label rewrite → CE resolution/probe. A PW summary alone is incomplete.

The first four controls target PE2 .100 VPWS and should leave VPLS 200 available. The P1–P2 LDP fault affects PE1-to-remote labeled service; PE2↔PE3 remains on the P2 side. Targeted sessions and ordinary IP pings can survive a missing labeled transport, so verify actual customer delivery.

After recovery, prove VPWS IPv4/IPv6 in both directions, all VPLS CE pairs/families/directions, full mesh, negotiated CW/MTUs and removal of optional state. Submit actual release/image, mapping, outputs/captures, label/tag diagram, MAC/BUM observations, fault reasoning, restore evidence and emulator limitations.

The archive includes the instructor key intentionally; distribute it separately for blind tasks.

## Primary references

Source metadata is in sources.json. Important sources:

- [XR 7.11 point-to-point L2 services](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/l2vpn/configuration/guide/b-l2vpn-cg-asr9000-711x/m-implement-point-to-point-layer-2-services.html).
- [XR 7.11 multipoint L2 services](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/711x/l2vpn/configuration/guide/b-l2vpn-cg-asr9000-711x/implementing-multipoint-layer-2-services.html).
- [Cisco IOS XR L2VPN technical note](https://www.cisco.com/c/en/us/support/docs/routers/asr-9000-series-aggregation-services-routers/116453-technote-ios-xr-l2vpn-00.html), including explicit CW configuration and operational fields.
- [Cisco XR/IOS MTU model](https://www.cisco.com/c/en/us/support/docs/ios-nx-os-software/ios-xr-software/116350-trouble-ios-xr-mtu-00.html).
- [ASR 9000 MPLS OAM reference](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/mpls/command/reference/b-mpls-cr-asr9000/mpls-oam-commands.html).
- [ASR 9000 multipoint command reference](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/lxvpn/command/reference/b-lxvpn-cr-asr9000/multipoint-layer-2-services-commands.html).
- [RFC 8077 PW setup](https://www.rfc-editor.org/rfc/rfc8077.html) (obsoletes RFC 4447 and RFC 6723), [RFC 4448 Ethernet PW](https://www.rfc-editor.org/rfc/rfc4448.html), [RFC 4762 LDP VPLS](https://www.rfc-editor.org/rfc/rfc4762.html) and [RFC 4385 control word](https://www.rfc-editor.org/rfc/rfc4385.html).

No private fieldbook material or invented device captures were used.
