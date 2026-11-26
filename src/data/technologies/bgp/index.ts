import type { Technology } from '../../../schemas/content'
import { implement, lab } from './lab'
import { prerequisites, reload, sources, stages } from './lessons'
import { cards, decisions, exercises, faults, instructor, interviews } from './practice'

export const technology = {
  id: 'bgp',
  title: 'BGP / MP-BGP',
  category: 'Services',
  dashboardDiagram: 'CE1 -- PE1 -- P1 -- PE2 -- CE2\n             |\n            RR1',
  description: 'Follow a route from the BGP session through policy and best-path selection to forwarding. Build dual-stack peering, route reflection, and a VPNv4/VPNv6 service.',
  reviewed: '2026-11-26',
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
  ankiPackage: 'downloads/bgp/bgp.apkg',
  readinessCriteria: {
    'Conceptual Knowledge': 'Trace NLRI through family negotiation, inbound policy, best-path selection, next-hop resolution, and outbound policy.',
    'Configuration Knowledge': 'Configure explicit peer policies, activate each address family, and explain the next-hop and route-reflector settings.',
    'Lab Experience': 'Record the software image, peer capabilities, accepted paths, installed routes, and bidirectional customer traffic observations.',
    'Troubleshooting Readiness': 'Locate the first missing state between session, negotiated family, accepted route, selected path, RIB, and forwarding.',
    'Architecture Readiness': 'Defend a route-reflector, multihoming, or VPN distribution design with scale, failure, policy, and migration evidence.',
    'Interview Readiness': 'Explain an attribute comparison and an MP-BGP forwarding failure using specific evidence and a defensible next check.',
    'Instructor Readiness': 'Demonstrate the route pipeline, explain a packet walk, and assess a student investigation before showing the solution.',
  },
} satisfies Technology
