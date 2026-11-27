import type { Technology } from '../../../schemas/content'
import { implement, lab } from './lab'
import { prerequisites, reload, sources, stages } from './lessons'
import { cards, decisions, exercises, faults, instructor, interviews } from './practice'

export const technology = {
  id: 'l2vpn',
  title: 'L2VPN',
  category: 'Services',
  description: 'Build Ethernet VPWS and a three-site VPLS LAN. Trace attachment-circuit classification, pseudowire signaling, label forwarding, MAC learning, and flooding across an MPLS core.',
  dashboardDiagram: 'CE1 -- PE1 -- P1 -- P2 -- PE2 -- CE2\n                    |\n                   PE3 -- CE3',
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
  ankiPackage: 'downloads/l2vpn/l2vpn.apkg',
  readinessCriteria: {
    'Conceptual Knowledge': 'Separate attachment circuits, local VLAN tags, PW identity, directional service labels, transport labels, and VPLS MAC forwarding.',
    'Configuration Knowledge': 'Build normalized Ethernet ACs, matching PW parameters, VPWS endpoints, and a complete VPLS mesh with a sufficient transport MTU.',
    'Lab Experience': 'Record actual images, AC/PW state, negotiated parameters, MAC locations, Ethernet packet walks, and customer IPv4/IPv6 observations.',
    'Troubleshooting Readiness': 'Locate the first failure in AC classification, PW signaling, transport recursion, Ethernet forwarding, MTU, or customer return traffic.',
    'Architecture Readiness': 'Defend service topology, signaling, loop controls, scale, resiliency, and migration choices against the customer Ethernet contract.',
    'Interview Readiness': 'Interpret PW and bridge evidence, explain flooding and split horizon, and predict frame and label changes in each direction.',
    'Instructor Readiness': 'Teach the Ethernet and MPLS packet walks, demonstrate MAC learning and a controlled fault, and assess restored service evidence.',
  },
} satisfies Technology
