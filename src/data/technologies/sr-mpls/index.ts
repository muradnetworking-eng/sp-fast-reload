import type { Technology } from '../../../schemas/content'
import { lab, implement } from './lab'
import { reload, stages, sources, prerequisites } from './lessons'
import { faults, decisions, exercises, interviews, instructor, cards } from './practice'

export const technology = {
  id: 'sr-mpls',
  title: 'Segment Routing over MPLS',
  category: 'Transport',
  description: 'Trace how IGP advertisements become MPLS forwarding state. Build an IOS XR core, test local repair, and work through a staged LDP migration.',
  reviewed: '2026-11-14',
  ankiPackage: 'downloads/sr-mpls/sr-mpls.apkg',
  readinessCriteria: {
    'Conceptual Knowledge': 'Trace an indexed Prefix-SID through a mixed-SRGB hop, including the receiver’s label context and PHP.',
    'Configuration Knowledge': 'Build the IS-IS underlay and assign unique Prefix-SID indexes. Explain the range, prefix, algorithm, and adjacency prerequisites.',
    'Lab Experience': 'Record the image and observed SID advertisement, ingress CEF, transit LFIB, and a traffic or capture result.',
    'Troubleshooting Readiness': 'Isolate the first divergence between the advertisement, imposed stack, receiving LFIB, and observed traffic.',
    'Architecture Readiness': 'Defend an LDP migration or repair design with service acceptance checks, platform constraints, and a rollback trigger.',
    'Interview Readiness': 'Explain the chosen next hop and label action, cite verification evidence, and handle a follow-up change to the topology.',
    'Instructor Readiness': 'Teach the packet walk, demonstrate advertisement and forwarding checks, and assess a student’s fault investigation.',
  },
  prerequisites, sources, reload, stages, implement, lab, faults, exercises, interviews, instructor, decisions, cards,
} satisfies Technology
