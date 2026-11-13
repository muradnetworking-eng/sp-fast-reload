import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
import { technology } from '../src/data/technologies/sr-mpls'
import { checkContent } from '../src/lib/checkContent'

test('SR-MPLS module fulfills the data contract', () => {
  assert.deepEqual(checkContent(technology), [])
  assert.equal(technology.exercises.length, 10)
  assert.ok(existsSync('public/' + technology.ankiPackage))
  for (const file of technology.lab.downloads) assert.ok(existsSync('public/' + file.path), file.path)
})

type Link = { metricEachDirection: number; subnet: string; endpoints: { node: string; interface: string; address: string }[] }
const topology = JSON.parse(readFileSync('public/downloads/sr-mpls/topology.json', 'utf8')) as {
  srgb: { first: number; last: number }
  nodes: { name: string; loopback: string; prefixSidIndex: number }[]
  links: Link[]
}
function shortestPaths(source: string, destination: string, failed?: string) {
  function walk(path: string[], cost: number): { path: string[]; cost: number }[] {
    const tail = path.at(-1)
    if (tail === destination) return [{ path, cost }]
    return topology.links.filter(link => link.subnet !== failed && link.endpoints.some(end => end.node === tail)).flatMap(link => {
      const next = link.endpoints.find(end => end.node !== tail)!.node
      return path.includes(next) ? [] : walk([...path, next], cost + link.metricEachDirection)
    })
  }
  return walk([source], 0).sort((a, b) => a.cost - b.cost)
}

test('topology addressing and final configuration agree', () => {
  const configs = new Map(topology.nodes.map(node => [node.name, readFileSync('public/downloads/sr-mpls/final/' + node.name + '.cfg', 'utf8')]))
  assert.equal(configs.size, 4)
  const addresses = new Set(topology.nodes.map(node => node.loopback.split('/')[0]))
  for (const link of topology.links) {
    const [a, b] = link.endpoints
    assert.equal(link.subnet, a.address + '/31')
    assert.equal(b.address, a.address.slice(0, -1) + '1')
    for (const endpoint of [a, b]) {
      assert.ok(!addresses.has(endpoint.address))
      addresses.add(endpoint.address)
      const config = configs.get(endpoint.node)!
      assert.ok(config.includes('interface ' + endpoint.interface))
      assert.ok(config.includes(endpoint.address + ' 255.255.255.254'))
      assert.ok(config.includes('metric ' + link.metricEachDirection))
    }
  }
  for (const node of topology.nodes) {
    assert.ok(configs.get(node.name)!.includes('prefix-sid index ' + node.prefixSidIndex))
    assert.ok(topology.srgb.first + node.prefixSidIndex <= topology.srgb.last)
  }
})

test('primary and post-failure paths match the lab model', () => {
  assert.deepEqual(shortestPaths('PE1', 'PE2')[0], { path: ['PE1', 'P1', 'PE2'], cost: 20 })
  assert.deepEqual(shortestPaths('PE1', 'PE2', '10.0.12.0/31')[0], { path: ['PE1', 'P2', 'P1', 'PE2'], cost: 35 })
  assert.deepEqual(shortestPaths('P2', 'PE2')[0], { path: ['P2', 'P1', 'PE2'], cost: 15 })
  assert.deepEqual(shortestPaths('P1', 'PE2', '10.0.24.0/31')[0], { path: ['P1', 'P2', 'PE2'], cost: 30 })
})
