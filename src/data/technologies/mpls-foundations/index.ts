import type { Technology } from '../../../schemas/content'
import { implement, lab } from './lab'
import { prerequisites, reload, sources, stages } from './lessons'
import { cards, decisions, exercises, faults, instructor, interviews } from './practice'

export const technology = {
  id: 'mpls-foundations',
  title: 'MPLS Foundations',
  category: 'Transport',
  description: 'Trace a forwarding equivalence class from IP routing and LDP bindings to push, swap, and pop. Build a labeled core and isolate discovery, session, forwarding, and MTU faults.',
  dashboardDiagram: 'PE1 -- P1 -- P2 -- PE2\nExtra links\nPE1 -- P2  /  P1 -- PE2',
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
  ankiPackage: 'downloads/mpls-foundations/mpls-foundations.apkg',
  readinessCriteria: {
    'Conceptual Knowledge': 'Explain a FEC, local label significance, downstream binding selection, and each push, swap, and pop action.',
    'Configuration Knowledge': 'Build the IGP and LDP with reachable transport IDs, then explain explicit-null and IGP/LDP synchronization settings.',
    'Lab Experience': 'Record the image, per-hop label bindings, programmed rewrites, LSP probes, and observed traffic or captures.',
    'Troubleshooting Readiness': 'Separate link discovery, TCP session, binding exchange, IGP next-hop selection, label programming, and packet-size failures.',
    'Architecture Readiness': 'Defend the chosen transport, null-label behavior, synchronization, and MTU budget against service and failure requirements.',
    'Interview Readiness': 'Interpret a binding and forwarding table and predict the next receiving router’s lookup, including label-stack and TTL behavior.',
    'Instructor Readiness': 'Teach the three-hop packet walk, demonstrate a forwarding checkpoint, and guide students through evidence-based isolation.',
  },
} satisfies Technology
