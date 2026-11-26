import type { Technology } from '../../../schemas/content'
import { implement, lab } from './lab'
import { prerequisites, reload, sources, stages } from './lessons'
import { cards, decisions, exercises, faults, instructor, interviews } from './practice'

export const technology = {
  id: 'mpls-l3vpn',
  title: 'MPLS L3VPN',
  category: 'Services',
  description: 'Build isolated IPv4 and IPv6 services for customers with overlapping addresses. Follow a customer route through the VRF, MP-BGP, route-target import, transport labels, and egress forwarding.',
  dashboardDiagram: 'ACME/BETA -- PE1 -- P1 -- P2 -- PE2 -- ACME/BETA\n                    |\n                   RR1',
  reviewed: '2026-11-27',
  prerequisites,
  sources,
  reload,
  stages,
  implement,
  lab,
  faults,
  exercises,
  interviews,
  instructor,
  decisions,
  cards,
  ankiPackage: 'downloads/mpls-l3vpn/mpls-l3vpn.apkg',
  readinessCriteria: {
    'Conceptual Knowledge': 'Separate VRF lookup, RD uniqueness, RT membership, VPN route distribution, and service-label disposition in both directions.',
    'Configuration Knowledge': 'Build VRFs, explicit PE–CE policy, VPNv4/VPNv6 reflection, and reachable labeled transport without leaking tenant routes.',
    'Lab Experience': 'Record the exact images, tenant route and label state, customer probes, and positive and negative isolation checks.',
    'Troubleshooting Readiness': 'Identify the first missing state between PE–CE learning, VPN export, reflection, import, recursive forwarding, and return traffic.',
    'Architecture Readiness': 'Defend a customer service and interconnection design against overlap, policy, availability, scale, and trust requirements.',
    'Interview Readiness': 'Interpret VRF, VPN BGP, and CEF evidence and predict how service and transport labels change at each hop.',
    'Instructor Readiness': 'Teach route distribution and packet forwarding separately, demonstrate tenant isolation, and assess a student investigation.',
  },
} satisfies Technology
