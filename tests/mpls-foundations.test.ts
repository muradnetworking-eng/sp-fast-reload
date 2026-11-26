import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { isIP } from 'node:net'
import { test } from 'node:test'
import { technology } from '../src/data/technologies/mpls-foundations'
import { checkContent } from '../src/lib/checkContent'

type LabNode = { name: string; os: string; loopback: string; routerId: string }
type Endpoint = { node: string; interface: string; address: string }
type Link = { subnet: string; cost: number; a: Endpoint; b: Endpoint }
const topology = JSON.parse(readFileSync('public/downloads/mpls-foundations/topology.json', 'utf8')) as {
  nodes: LabNode[]
  links: Link[]
}
const config = (directory: string, name: string) => readFileSync('public/downloads/mpls-foundations/' + directory + '/' + name + '.cfg', 'utf8').replaceAll('\r\n', '\n')
const ip = (prefix: string) => prefix.split('/')[0]
const ipNumber = (prefix: string) => ip(prefix).split('.').reduce((value, byte) => value * 256 + Number(byte), 0)

test('MPLS Foundations content and download files fulfill the module contract', () => {
  assert.deepEqual(checkContent(technology), [])
  assert.ok(existsSync('public/' + technology.ankiPackage))
  for (const file of technology.lab.downloads) assert.ok(existsSync('public/' + file.path), file.path)
})

test('MPLS lab addressing and LDP transport identities match final configurations', () => {
  const names = new Set(topology.nodes.map(node => node.name))
  assert.equal(names.size, 4)
  const addresses = new Set<string>()
  const interfaces = new Set<string>()
  for (const node of topology.nodes) {
    assert.equal(isIP(ip(node.loopback)), 4)
    assert.ok(!addresses.has(ip(node.loopback)))
    addresses.add(ip(node.loopback))
    assert.equal(node.routerId, ip(node.loopback))
    const text = config('final', node.name)
    assert.ok(text.includes('ipv4 address ' + node.loopback)
      || text.includes('ipv4 address ' + node.routerId + ' 255.255.255.255'))
    assert.ok(text.includes('router-id ' + node.routerId))
    assert.ok(text.includes('mpls ldp'))
  }
  for (const link of topology.links) {
    assert.ok(Number.isInteger(link.cost) && link.cost > 0)
    const prefixLength = Number(link.subnet.split('/')[1])
    const network = ipNumber(link.subnet)
    for (const endpoint of [link.a, link.b]) {
      const port = endpoint.node + ':' + endpoint.interface
      assert.ok(names.has(endpoint.node))
      assert.ok(!interfaces.has(port), port)
      interfaces.add(port)
      assert.equal(isIP(ip(endpoint.address)), 4)
      assert.ok(!addresses.has(ip(endpoint.address)), endpoint.address)
      addresses.add(ip(endpoint.address))
      assert.ok(ipNumber(endpoint.address) >= network && ipNumber(endpoint.address) < network + 2 ** (32 - prefixLength))
      const text = config('final', endpoint.node)
      assert.ok(text.includes('interface ' + endpoint.interface), port)
      assert.ok(text.includes('ipv4 address ' + endpoint.address)
        || text.includes('ipv4 address ' + ip(endpoint.address) + ' 255.255.255.254'), port)
      assert.ok(text.includes('cost ' + link.cost), port)
    }
  }
})

function paths(source: string, destination: string, failed?: string) {
  function walk(path: string[], cost: number): { path: string[]; cost: number }[] {
    const tail = path.at(-1)
    if (tail === destination) return [{ path, cost }]
    return topology.links.filter(link => link.subnet !== failed && [link.a.node, link.b.node].includes(tail!)).flatMap(link => {
      const next = link.a.node === tail ? link.b.node : link.a.node
      return path.includes(next) ? [] : walk([...path, next], cost + link.cost)
    })
  }
  return walk([source], 0).sort((a, b) => a.cost - b.cost)
}

test('three-hop MPLS baseline and both post-failure ECMP paths match the topology', () => {
  assert.deepEqual(paths('PE1', 'PE2')[0], { path: ['PE1', 'P1', 'P2', 'PE2'], cost: 30 })
  const afterFailure = paths('PE1', 'PE2', '10.10.23.0/31')
  const shortest = afterFailure.filter(path => path.cost === afterFailure[0].cost)
  assert.equal(shortest.length, 2)
  assert.deepEqual(shortest.map(result => result.path.join('-')).sort(), ['PE1-P1-PE2', 'PE1-P2-PE2'])
  assert.ok(shortest.every(result => result.cost === 50))
})

test('MPLS final checkpoint keeps OSPF, LDP, and synchronization on the intended links', () => {
  for (const node of topology.nodes) {
    const text = config('final', node.name)
    assert.ok(text.includes('router ospf CORE'))
    assert.ok(text.includes('mpls ldp sync'))
    assert.match(text, /interface Loopback0[\s\S]*?cost 1\b/)
    const ldp = text.slice(text.indexOf('mpls ldp\n'))
    for (const link of topology.links) {
      const endpoint = [link.a, link.b].find(endpoint => endpoint.node === node.name)
      if (endpoint) assert.ok(ldp.includes('interface ' + endpoint.interface), node.name + ' ' + endpoint.interface)
    }
    assert.ok(!text.includes('segment-routing mpls'), 'The foundation lab uses LDP bindings')
  }
})
