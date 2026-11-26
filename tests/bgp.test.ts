import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { isIP } from 'node:net'
import { test } from 'node:test'
import { technology } from '../src/data/technologies/bgp'
import { checkContent } from '../src/lib/checkContent'
import { initialProgress, parseProgress, schedule } from '../src/state/progress'

type Endpoint = { node: string; interface: string; ipv4: string; ipv6: string }
type LabNode = { name: string; os: string; asn: number; loopback4: string; loopback6: string }
type LabLink = { a: Endpoint; b: Endpoint; subnet4: string; subnet6: string; role: string }
const topology = JSON.parse(readFileSync('public/downloads/bgp/topology.json', 'utf8')) as {
  coreAS: number
  nodes: LabNode[]
  links: LabLink[]
  vpn: { vrf: string; rt: string; rdByNode: Record<string, string> }
}
const config = (directory: string, name: string) => readFileSync('public/downloads/bgp/' + directory + '/' + name + '.cfg', 'utf8')
const address = (prefix: string) => prefix.split('/')[0]
const ipv4Value = (prefix: string) => address(prefix).split('.').reduce((value, byte) => value * 256 + Number(byte), 0)

test('BGP content and downloads fulfill the module contract', () => {
  assert.deepEqual(checkContent(technology), [])
  assert.ok(existsSync('public/' + technology.ankiPackage))
  for (const file of technology.lab.downloads) assert.ok(existsSync('public/' + file.path), file.path)
})

test('BGP lab addressing is unique and matches both final configuration sets', () => {
  const names = new Set(topology.nodes.map(node => node.name))
  assert.equal(names.size, 6)
  const addresses = new Set<string>()
  const interfaces = new Set<string>()
  for (const node of topology.nodes) {
    for (const [prefix, family] of [[node.loopback4, 4], [node.loopback6, 6]] as const) {
      assert.equal(isIP(address(prefix)), family)
      assert.ok(!addresses.has(address(prefix)), prefix)
      addresses.add(address(prefix))
      for (const phase of ['final-global', 'final-vpn']) assert.ok(config(phase, node.name).includes(address(prefix)), node.name + ' ' + prefix)
    }
  }
  for (const link of topology.links) {
    const prefixLength = Number(link.subnet4.split('/')[1])
    const blockSize = 2 ** (32 - prefixLength)
    const network = ipv4Value(link.subnet4)
    for (const endpoint of [link.a, link.b]) {
      assert.ok(names.has(endpoint.node))
      const port = endpoint.node + ':' + endpoint.interface
      assert.ok(!interfaces.has(port), port)
      interfaces.add(port)
      for (const [prefix, family] of [[endpoint.ipv4, 4], [endpoint.ipv6, 6]] as const) {
        assert.equal(isIP(address(prefix)), family)
        assert.ok(!addresses.has(address(prefix)), prefix)
        addresses.add(address(prefix))
      }
      assert.equal(endpoint.ipv4.split('/')[1], String(prefixLength))
      assert.ok(ipv4Value(endpoint.ipv4) >= network && ipv4Value(endpoint.ipv4) < network + blockSize)
      const phases = link.role === 'optional' ? ['optional-global', 'optional-vpn'] : ['final-global', 'final-vpn']
      for (const phase of phases) {
        const text = config(phase, endpoint.node)
        assert.ok(text.includes('interface ' + endpoint.interface), port)
        assert.ok(text.includes(address(endpoint.ipv4)), port + ' IPv4')
        assert.ok(text.includes(endpoint.ipv6), port + ' IPv6')
      }
    }
  }
})

test('global unicast and VPN phases have the required transit and reflector state', () => {
  const pGlobal = config('final-global', 'P1')
  const pVpn = config('final-vpn', 'P1')
  assert.ok(pGlobal.includes('router bgp ' + topology.coreAS), 'Native unicast transit needs customer route reachability')
  assert.ok(pGlobal.includes('address-family ipv6 unicast'))
  assert.ok(!pVpn.includes('router bgp'), 'VPN transit is handled by labels')
  assert.ok(pVpn.includes('mpls ldp'))
  const rrGlobal = config('final-global', 'RR1')
  const rrVpn = config('final-vpn', 'RR1')
  for (const node of topology.nodes.filter(node => ['PE1', 'P1', 'PE2'].includes(node.name))) {
    assert.ok(rrGlobal.includes('neighbor ' + address(node.loopback4)))
    assert.ok(rrGlobal.includes('neighbor ' + address(node.loopback6)))
  }
  assert.equal((rrGlobal.match(/route-reflector-client/g) ?? []).length, 6)
  assert.equal((rrVpn.match(/route-reflector-client/g) ?? []).length, 4)
  assert.equal((rrVpn.match(/retain route-target all/g) ?? []).length, 2)
  assert.ok(!rrVpn.includes('next-hop-self'), 'The control-plane reflector must preserve PE service next hops')
  for (const name of ['PE1', 'PE2']) {
    const pe = config('final-vpn', name)
    assert.ok(pe.includes('vrf ' + topology.vpn.vrf))
    assert.ok(pe.includes('rd ' + topology.vpn.rdByNode[name]))
    assert.equal((pe.match(new RegExp('import route-target ' + topology.vpn.rt, 'g')) ?? []).length, 2)
    assert.equal((pe.match(new RegExp('export route-target ' + topology.vpn.rt, 'g')) ?? []).length, 2)
    assert.ok(pe.includes('address-family vpnv4 unicast'))
    assert.ok(pe.includes('address-family vpnv6 unicast'))
    assert.ok(pe.includes('route-policy CE'), 'Both customer families need explicit XR peering policy')
    assert.ok(pe.includes('mpls ldp'))
  }
})

test('older SR-MPLS progress remains portable alongside a new BGP history', () => {
  const progress = initialProgress()
  const date = '2026-11-26T12:00:00.000Z'
  progress.completed['sr-mpls:understand'] = date
  progress.completed['bgp:understand'] = date
  progress.preferences['sr-mpls'] = { level: 2, goal: 0, path: 'emergency' }
  progress.preferences.bgp = { level: 0, goal: 1, path: 'zero' }
  progress.reviews['sr-mpls:card-receiver-srgb'] = [schedule('Hard', undefined, new Date(date))]
  progress.reviews['bgp:card-test'] = [schedule('Mastered', undefined, new Date(date))]
  const restored = parseProgress(JSON.stringify(progress))
  assert.deepEqual(restored, progress)
  assert.notEqual(restored.reviews['bgp:card-test'][0].due, restored.reviews['sr-mpls:card-receiver-srgb'][0].due)
})
