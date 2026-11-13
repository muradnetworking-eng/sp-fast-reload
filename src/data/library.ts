import type { Entry, Technology } from '../schemas/content'

const modules = import.meta.glob<{ technology: Technology }>('./technologies/*/index.ts', { eager: true })
const developed = new Map(Object.values(modules).map(({ technology }) => [technology.id, technology]))

const taxonomy = [
  ['routing-fundamentals', 'Routing Fundamentals', 'Underlay', 'IPv4/IPv6 forwarding, RIB and FIB, recursion, ECMP'],
  ['ospf', 'OSPF', 'Underlay', 'Areas, LSAs, SPF, summarization, convergence'],
  ['is-is', 'IS-IS', 'Underlay', 'Levels, LSPs, TLVs, metrics, authentication'],
  ['bgp', 'BGP / MP-BGP', 'Services', 'Best path, policy, route reflection, address families'],
  ['mpls-foundations', 'MPLS Foundations', 'Transport', 'Labels, LDP, LIB and LFIB, PHP and UHP'],
  ['mpls-l3vpn', 'MPLS L3VPN', 'Services', 'VRFs, RD and RT, VPNv4/v6, PE–CE, Inter-AS'],
  ['l2vpn', 'L2VPN', 'Services', 'VPWS, VPLS, pseudowires, Ethernet services'],
  ['evpn', 'EVPN', 'Services', 'EVPN-MPLS, EVPN-VXLAN, route types, ESI and multihoming'],
  ['rsvp-te', 'RSVP-TE', 'Transport', 'CSPF, tunnels, bandwidth admission, fast reroute'],
  ['sr-mpls', 'Segment Routing over MPLS', 'Transport', 'Prefix-SIDs, adjacency SIDs, label forwarding, TI-LFA and migration'],
  ['sr-te', 'SR-TE', 'Transport', 'Segment lists, candidate paths, steering and policies'],
  ['srv6', 'SRv6', 'Transport', 'Locators, SIDs, endpoint behaviors and forwarding'],
  ['multicast', 'Multicast', 'Services', 'IGMP, PIM, RP, ASM and SSM, RPF, MVPN'],
  ['sp-qos', 'SP QoS', 'Operations', 'Classification, marking, policing, shaping, HQoS, MPLS TC'],
  ['ha', 'HA / Resiliency', 'Operations', 'BFD, FRR, ECMP, GR, NSR, convergence'],
  ['sp-security', 'SP Security', 'Operations', 'CoPP/LPTS, route filtering, BGP protection, RPKI'],
  ['cisco-platforms', 'Cisco Platforms', 'Operations', 'IOS, IOS XE, IOS XR, NX-OS and hardware architecture'],
  ['solution-architecture', 'Solution Architecture', 'Operations', 'PE/P/RR design, scaling, capacity, redundancy, migrations'],
  ['automation', 'Automation', 'Operations', 'Python, Ansible, YANG, NETCONF, RESTCONF, gNMI, NSO'],
  ['sp-operations', 'SP Operations', 'Operations', 'Monitoring, troubleshooting, change management and RCA'],
]

export const library: Entry[] = taxonomy.map(([id, title, category, description]) => ({
  id, title, category, description, module: developed.get(id),
}))
export const technologies = library.flatMap(entry => entry.module ? [entry.module] : [])
export const topicUrl = (id: string, tab = 'reload', section?: string) =>
  '/technology/' + id + '/' + tab + (section ? '/' + section : '')
