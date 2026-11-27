import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { isIP } from 'node:net'
import { test } from 'node:test'
import { technology } from '../src/data/technologies/l2vpn'
import { checkContent } from '../src/lib/checkContent'

type LabNode = { name: string; role: string; loopback4?: string; routerId?: string }
type Endpoint = { node: string; interface: string; ipv4?: string }
type Link = { role: string; ldp: boolean; cost?: number; subnet4?: string; a: Endpoint; b: Endpoint }
type AC = { pe: string; interface: string; localTag: number; ce: string; ceInterface: string; ipv4: string; ipv6: string }
type Service = {
  id: string; type: string; pwId: number; pwClass: string; controlWord: boolean; transportMode: string
  xconnectGroup?: string; p2p?: string; bridgeGroup?: string; bridgeDomain?: string; vfi?: string
  pseudowires: { a: string; b: string; pwId: number }[]; acs: AC[]
}
const root = 'public/downloads/l2vpn/'
const topology = JSON.parse(readFileSync(root + 'topology.json', 'utf8')) as {
  nodes: LabNode[]; links: Link[]; services: Service[]
  addressing: {
    loopbackCost: number; pe1ToPe2Metric: number; pe1ToPe3Metric: number; pe2ToPe3Metric: number
    coreFrameMtu: number; coreIpv4Mtu: number; corePayloadBudget: number; accessParentFrameMtu: number
    accessTaggedSubinterfaceMtuModel: number; signaledPwMtuModel: number; customerIpMtu: number
    customerEthernetHeader: number; controlWordBytes: number; labelBytes: number
    requiredMplsPayload: number; requiredProviderFrameExcludingFcs: number
  }
}
const config = (name: string) => readFileSync(root + 'final/' + name + '.cfg', 'utf8').replaceAll('\r\n', '\n')
const address = (prefix: string) => prefix.split('/')[0]
const node = (name: string) => topology.nodes.find(node => node.name === name)!

function section(text: string, header: string): string {
  const lines = text.split('\n')
  const matches = lines.flatMap((line, index) => line.trim() === header ? [index] : [])
  assert.ok(matches.length, 'Missing section: ' + header)
  const indent = Math.min(...matches.map(index => lines[index].search(/\S/)))
  return matches.filter(index => lines[index].search(/\S/) === indent).map(index => {
    let end = index + 1
    while (end < lines.length && (!lines[end].trim() || lines[end].trim() === '!' || lines[end].search(/\S/) > indent)) end++
    return lines.slice(index + 1, end).join('\n')
  }).join('\n')
}

function ipValue(prefix: string): bigint {
  const ip = address(prefix)
  if (isIP(ip) === 4) return ip.split('.').reduce((value, byte) => value * 256n + BigInt(byte), 0n)
  assert.equal(isIP(ip), 6, prefix)
  const halves = ip.split('::')
  const left = halves[0] ? halves[0].split(':') : []
  const right = halves[1] ? halves[1].split(':') : []
  const words = halves.length === 2 ? [...left, ...Array<string>(8 - left.length - right.length).fill('0'), ...right] : left
  return words.reduce((value, word) => value * 65536n + BigInt('0x' + word), 0n)
}

function serviceView(text: string, service: Service): string {
  const l2vpn = section(text, 'l2vpn')
  return service.type === 'VPWS'
    ? section(section(l2vpn, 'xconnect group ' + service.xconnectGroup), 'p2p ' + service.p2p)
    : section(section(l2vpn, 'bridge group ' + service.bridgeGroup), 'bridge-domain ' + service.bridgeDomain)
}

test('L2VPN content and exact source metadata satisfy the module and download contract', () => {
  assert.deepEqual(checkContent(technology), [])
  for (const file of technology.lab.downloads) assert.ok(existsSync('public/' + file.path), file.path)
  assert.equal(readFileSync('public/' + technology.ankiPackage).subarray(0, 2).toString(), 'PK')
  const sources = JSON.parse(readFileSync(root + 'sources.json', 'utf8')) as { reviewed: string; sources: typeof technology.sources }
  assert.equal(sources.reviewed, technology.reviewed)
  assert.deepEqual(sources.sources, technology.sources)
})

test('L2VPN core addresses, OSPF links and LDP transport agree with complete configurations', () => {
  assert.equal(new Set(topology.nodes.map(node => node.name)).size, 8)
  const addresses = new Set<string>()
  const ports = new Set<string>()
  const add = (prefix: string) => {
    const ip = address(prefix)
    assert.equal(isIP(ip), 4)
    assert.ok(!addresses.has(ip), ip)
    addresses.add(ip)
  }
  for (const device of topology.nodes.filter(node => node.role !== 'CE')) {
    add(device.loopback4!)
    const text = config(device.name)
    assert.ok(section(text, 'interface Loopback0').includes('ipv4 address ' + device.loopback4))
    assert.ok(section(text, 'router ospf CORE').includes('router-id ' + device.routerId))
    assert.ok(section(text, 'mpls ldp').includes('router-id ' + device.routerId))
    assert.ok(!text.includes('router bgp') && !text.includes('vrf '))
    assert.ok(!text.includes('192.0.2.') && !text.includes('198.51.100.'))
    if (device.role === 'P') assert.ok(!text.includes('\nl2vpn\n'))
  }
  for (const link of topology.links) for (const endpoint of [link.a, link.b]) {
    const port = endpoint.node + ':' + endpoint.interface
    assert.ok(!ports.has(port), port)
    ports.add(port)
    assert.ok(node(endpoint.node), port)
    const text = config(endpoint.node)
    const iface = section(text, 'interface ' + endpoint.interface)
    if (link.role === 'core') {
      assert.equal(link.ldp, true)
      add(endpoint.ipv4!)
      const shift = BigInt(32 - Number(link.subnet4!.split('/')[1]))
      assert.equal(ipValue(endpoint.ipv4!) >> shift, ipValue(link.subnet4!) >> shift)
      assert.ok(iface.includes('ipv4 address ' + endpoint.ipv4))
      assert.ok(iface.includes('mtu ' + topology.addressing.coreFrameMtu))
      assert.ok(iface.includes('ipv4 mtu ' + topology.addressing.coreIpv4Mtu))
      assert.ok(section(text, 'mpls ldp').includes('interface ' + endpoint.interface))
      const ospf = section(section(text, 'router ospf CORE'), 'area 0')
      assert.ok(section(ospf, 'interface ' + endpoint.interface).includes('cost ' + link.cost))
    } else {
      assert.equal(link.ldp, false)
      assert.ok(!/\n\s+(?:ipv4|ip) address /.test(iface), 'Access trunks have no provider or CE routed parent address')
    }
  }
})

test('provider paths separate ingress push, transit swap and penultimate pop', () => {
  const links = topology.links.filter(link => link.role === 'core')
  function paths(source: string, destination: string, visited: string[] = [], cost = 0): { path: string[]; cost: number }[] {
    const path = [...visited, source]
    if (source === destination) return [{ path, cost }]
    return links.flatMap(link => {
      const next = link.a.node === source ? link.b.node : link.b.node === source ? link.a.node : undefined
      return next && !path.includes(next) ? paths(next, destination, path, cost + link.cost!) : []
    })
  }
  assert.deepEqual(paths('PE1', 'PE2'), [{ path: ['PE1', 'P1', 'P2', 'PE2'], cost: 30 }])
  for (const [source, destination, expected] of [
    ['PE1', 'PE2', topology.addressing.pe1ToPe2Metric],
    ['PE1', 'PE3', topology.addressing.pe1ToPe3Metric],
    ['PE2', 'PE3', topology.addressing.pe2ToPe3Metric],
  ] as const) {
    const route = paths(source, destination)
    assert.equal(route.length, 1, 'The teaching underlay has one path, without transport redundancy')
    assert.equal(route[0].cost + topology.addressing.loopbackCost, expected)
  }
})

test('customer tags and IP endpoints map to exactly one normalized Ethernet service', () => {
  const ports = new Set<string>()
  for (const service of topology.services) {
    const addresses = new Set<string>()
    for (const ac of service.acs) {
      const key = ac.pe + ':' + ac.interface
      assert.ok(!ports.has(key), 'An AC cannot belong to both services')
      ports.add(key)
      const pe = config(ac.pe)
      const attachment = section(pe, 'interface ' + ac.interface + ' l2transport')
      assert.ok(attachment.includes('encapsulation dot1q ' + ac.localTag))
      assert.ok(attachment.includes('rewrite ingress tag pop 1 symmetric'))
      assert.ok(!attachment.includes('ipv4 address') && !attachment.includes('ipv6 address'))
      const ce = section(config(ac.ce), 'interface ' + ac.ceInterface)
      assert.ok(ce.includes('encapsulation dot1Q ' + ac.localTag))
      assert.ok(ce.includes('ip address ' + address(ac.ipv4) + ' 255.255.255.0'))
      assert.ok(ce.includes('ipv6 address ' + ac.ipv6))
      for (const [prefix, family, bits, prefixLength] of [[ac.ipv4, 4, 32, 24], [ac.ipv6, 6, 128, 64]] as const) {
        assert.equal(isIP(address(prefix)), family)
        assert.equal(Number(prefix.split('/')[1]), prefixLength)
        const key = family + ':' + ipValue(prefix)
        assert.ok(!addresses.has(key), key)
        addresses.add(key)
        const first = family === 4 ? service.acs[0].ipv4 : service.acs[0].ipv6
        assert.equal(ipValue(prefix) >> BigInt(bits - prefixLength), ipValue(first) >> BigInt(bits - prefixLength))
      }
    }
    for (const pe of new Set(service.acs.map(ac => ac.pe))) {
      const view = serviceView(config(pe), service)
      const actual = [...view.matchAll(/^\s*interface (\S+)$/gm)].map(match => match[1]).sort()
      assert.deepEqual(actual, service.acs.filter(ac => ac.pe === pe).map(ac => ac.interface).sort())
    }
  }
  assert.equal(ports.size, 5)
  assert.ok(!config('CE3').includes('GigabitEthernet1.100'), 'CE3 participates only in VPLS')
})

test('VPWS endpoints and the complete VPLS mesh have reciprocal PW identities and parameters', () => {
  for (const service of topology.services) {
    const members = [...new Set(service.acs.map(ac => ac.pe))].sort()
    assert.equal(service.pseudowires.length, service.type === 'VPWS' ? 1 : members.length * (members.length - 1) / 2)
    const pairs = new Set(service.pseudowires.map(pw => [pw.a, pw.b].sort().join(':')))
    assert.equal(pairs.size, service.pseudowires.length)
    for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) assert.ok(pairs.has(members[i] + ':' + members[j]))
    for (const pe of members) {
      const text = config(pe)
      const view = serviceView(text, service)
      if (service.type === 'VPLS') section(view, 'vfi ' + service.vfi)
      const actual = [...view.matchAll(/^\s*neighbor (?:ipv4 )?(\S+) pw-id (\d+)$/gm)].map(match => match[1] + ':' + match[2]).sort()
      const peers = service.pseudowires.filter(pw => [pw.a, pw.b].includes(pe)).map(pw => pw.a === pe ? pw.b : pw.a)
      assert.deepEqual(actual, peers.map(peer => address(node(peer).loopback4!) + ':' + service.pwId).sort())
      for (const peer of peers) {
        const header = 'neighbor ' + (service.type === 'VPWS' ? 'ipv4 ' : '') + address(node(peer).loopback4!) + ' pw-id ' + service.pwId
        assert.ok(section(view, header).includes('pw-class ' + service.pwClass))
      }
      const encapsulation = section(section(section(text, 'l2vpn'), 'pw-class ' + service.pwClass), 'encapsulation mpls')
      assert.ok(encapsulation.includes('protocol ldp'))
      assert.equal(service.controlWord, true)
      assert.ok(encapsulation.includes('control-word') && !encapsulation.includes('control-word disable'))
      assert.ok(encapsulation.includes('transport-mode ' + service.transportMode))
    }
  }
})

test('normalized service MTU, Ethernet PW overhead and optional tag translation preserve the contract', () => {
  const mtu = topology.addressing
  assert.equal(mtu.accessTaggedSubinterfaceMtuModel, mtu.accessParentFrameMtu + 4)
  assert.equal(mtu.signaledPwMtuModel, mtu.accessTaggedSubinterfaceMtuModel - 14 - 4)
  assert.equal(mtu.signaledPwMtuModel, mtu.customerIpMtu)
  assert.equal(mtu.requiredMplsPayload, mtu.customerIpMtu + mtu.customerEthernetHeader + mtu.controlWordBytes + mtu.labelBytes)
  assert.equal(mtu.requiredProviderFrameExcludingFcs, mtu.requiredMplsPayload + 14)
  assert.equal(mtu.corePayloadBudget, mtu.coreFrameMtu - 14)
  assert.ok(mtu.corePayloadBudget >= mtu.requiredMplsPayload)
  for (const pe of ['PE1', 'PE2', 'PE3']) assert.ok(section(config(pe), 'interface GigabitEthernet0/0/0/1').includes('mtu ' + mtu.accessParentFrameMtu))
  const translated = readFileSync(root + 'optional/translation/PE2-apply.cfg', 'utf8')
  assert.ok(translated.includes('encapsulation dot1q 110'))
  assert.ok(!translated.includes('pw-id'), 'Changing a local service tag does not change PW identity')
  for (const name of ['PE2', 'CE2']) for (const action of ['apply', 'restore']) assert.ok(existsSync(root + 'optional/translation/' + name + '-' + action + '.cfg'))
})
