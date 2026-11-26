import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { isIP } from 'node:net'
import { test } from 'node:test'
import { technology } from '../src/data/technologies/mpls-l3vpn'
import { checkContent } from '../src/lib/checkContent'

type Endpoint = { node: string; interface: string; ipv4: string; ipv6?: string }
type LabNode = { name: string; role: string; os: string; asn: number; loopback4: string; routerId: string }
type Link = { role: string; ldp: boolean; cost?: number; subnet4: string; subnet6?: string; tenant?: string; a: Endpoint; b: Endpoint }
type Site = { ce: string; pe: string; asn: number; site: number; vrf: string; ipv4: string; ipv6: string; prefix4: string; prefix6: string }
type Tenant = { name: string; rt: string; rdByNode: Record<string, string>; sites: Site[] }
const root = 'public/downloads/mpls-l3vpn/'
const topology = JSON.parse(readFileSync(root + 'topology.json', 'utf8')) as {
  nodes: LabNode[]; links: Link[]; tenants: Tenant[]
  addressing: { coreMtu: number; ipv4Mtu: number; loopbackCost: number; providerAs: number }
}
const config = (name: string) => readFileSync(root + 'final/' + name + '.cfg', 'utf8').replaceAll('\r\n', '\n')
const address = (prefix: string) => prefix.split('/')[0]

function section(text: string, header: string): string {
  const lines = text.split('\n')
  const indices = lines.flatMap((line, index) => line.trim() === header ? [index] : [])
  assert.ok(indices.length, 'Missing configuration section: ' + header)
  const indent = Math.min(...indices.map(index => lines[index].search(/\S/)))
  return indices.filter(index => lines[index].search(/\S/) === indent).map(index => {
    let end = index + 1
    while (end < lines.length && (!lines[end].trim() || lines[end].trim() === '!' || lines[end].search(/\S/) > indent)) end++
    return lines.slice(index + 1, end).join('\n')
  }).join('\n')
}

function ipValue(prefix: string): bigint {
  const ip = address(prefix)
  if (isIP(ip) === 4) return ip.split('.').reduce((value, byte) => value * 256n + BigInt(byte), 0n)
  assert.equal(isIP(ip), 6, prefix)
  const parts = ip.split('::')
  const left = parts[0] ? parts[0].split(':') : []
  const right = parts[1] ? parts[1].split(':') : []
  const words = parts.length === 2 ? [...left, ...Array<string>(8 - left.length - right.length).fill('0'), ...right] : left
  return words.reduce((value, word) => value * 65536n + BigInt('0x' + word), 0n)
}

test('L3VPN content, primary references, and download files fulfill the module contract', () => {
  assert.deepEqual(checkContent(technology), [])
  assert.ok(existsSync('public/' + technology.ankiPackage))
  for (const file of technology.lab.downloads) assert.ok(existsSync('public/' + file.path), file.path)
  assert.equal(readFileSync('public/' + technology.ankiPackage).subarray(0, 2).toString(), 'PK')
  const sources = JSON.parse(readFileSync(root + 'sources.json', 'utf8')) as { reviewed: string; sources: typeof technology.sources }
  assert.equal(sources.reviewed, technology.reviewed)
  assert.deepEqual(sources.sources, technology.sources)
})

test('L3VPN addressing is valid and unique within each routing context', () => {
  assert.equal(new Set(topology.nodes.map(node => node.name)).size, 9)
  const ports = new Set<string>()
  const addresses = new Set<string>()
  const record = (realm: string, prefix: string) => {
    const key = realm + ':' + ipValue(prefix).toString()
    assert.ok(!addresses.has(key), 'Duplicate in routing context: ' + realm + ' ' + prefix)
    addresses.add(key)
  }
  for (const node of topology.nodes) {
    const text = config(node.name)
    const loopback = section(text, 'interface Loopback0').match(/(?:ip|ipv4) address (\S+)/)?.[1]
    assert.ok(loopback, node.name + ' loopback')
    assert.equal(ipValue(loopback), ipValue(node.loopback4))
    assert.ok(text.includes('router-id ' + node.routerId), node.name + ' router ID')
    if (!node.name.startsWith('CE-')) record('global4', node.loopback4)
  }
  for (const tenant of topology.tenants) for (const site of tenant.sites) {
    record(tenant.name + '4', site.prefix4)
    record(tenant.name + '6', site.prefix6)
    const ce = config(site.ce)
    assert.match(ce, new RegExp('router bgp ' + site.asn + '\\b'))
    assert.ok(ce.includes('network ' + address(site.prefix4) + ' mask 255.255.255.255'))
    assert.ok(ce.includes('network ' + site.prefix6))
  }
  for (const link of topology.links) for (const endpoint of [link.a, link.b]) {
    const port = endpoint.node + ':' + endpoint.interface
    assert.ok(!ports.has(port), port)
    ports.add(port)
    assert.ok(topology.nodes.some(node => node.name === endpoint.node))
    const text = section(config(endpoint.node), 'interface ' + endpoint.interface)
    assert.ok(text.includes('address ' + address(endpoint.ipv4)), port + ' IPv4')
    for (const [prefix, subnet, family, bits] of [[endpoint.ipv4, link.subnet4, 4, 32], [endpoint.ipv6, link.subnet6, 6, 128]] as const) {
      if (!prefix) { assert.equal(subnet, undefined); continue }
      assert.ok(subnet)
      assert.equal(isIP(address(prefix)), family)
      assert.equal(prefix.split('/')[1], subnet.split('/')[1])
      const shift = BigInt(bits - Number(subnet.split('/')[1]))
      assert.equal(ipValue(prefix) >> shift, ipValue(subnet) >> shift, port + ' subnet')
      record((link.tenant ?? 'global') + family, prefix)
    }
    if (endpoint.ipv6) {
      const actual = text.match(/ipv6 address (\S+)/)?.[1]
      assert.ok(actual, port + ' IPv6')
      assert.equal(ipValue(actual), ipValue(endpoint.ipv6))
    }
    if (link.tenant && endpoint.node.startsWith('PE')) assert.match(text, new RegExp('^ +vrf ' + link.tenant + '$', 'm'))
  }
})

test('VRF RDs remain unique while route-target import isolates both customer families', () => {
  const rds = topology.tenants.flatMap(tenant => Object.values(tenant.rdByNode))
  assert.equal(new Set(rds).size, 4)
  assert.equal(new Set(topology.tenants.map(tenant => tenant.rt)).size, 2)
  for (const tenant of topology.tenants) for (const [pe, rd] of Object.entries(tenant.rdByNode)) {
    const text = config(pe)
    const vrf = section(text, 'vrf ' + tenant.name)
    for (const family of ['ipv4', 'ipv6']) {
      const af = section(vrf, 'address-family ' + family + ' unicast')
      const imports = [...af.matchAll(/import route-target (\S+)/g)].map(match => match[1])
      const exports = [...af.matchAll(/export route-target (\S+)/g)].map(match => match[1])
      assert.deepEqual(imports, [tenant.rt], pe + ' ' + tenant.name + ' ' + family)
      assert.deepEqual(exports, [tenant.rt])
      for (const other of topology.tenants) assert.equal(imports.includes(other.rt), other.name === tenant.name)
    }
    const bgp = section(text, 'router bgp ' + topology.addressing.providerAs)
    assert.ok(section(bgp, 'vrf ' + tenant.name).includes('rd ' + rd))
  }
  const [first, second] = topology.tenants
  assert.deepEqual(first.sites.map(site => site.prefix4), second.sites.map(site => site.prefix4), 'The lab deliberately demonstrates overlap')
  assert.deepEqual(first.sites.map(site => site.prefix6), second.sites.map(site => site.prefix6))
})

test('labeled transport and the IP-only reflector have separate forwarding responsibilities', () => {
  const core = topology.links.filter(link => link.ldp)
  assert.equal(core.length, 3)
  const path = ['PE1']
  let cost = 0
  while (path.at(-1) !== 'PE2') {
    const edges = core.flatMap(link => {
      const next = link.a.node === path.at(-1) ? link.b.node : link.b.node === path.at(-1) ? link.a.node : undefined
      return next && !path.includes(next) ? [{ next, cost: link.cost! }] : []
    })
    assert.equal(edges.length, 1, 'The baseline has one continuous labeled path')
    path.push(edges[0].next)
    cost += edges[0].cost
  }
  assert.deepEqual(path, ['PE1', 'P1', 'P2', 'PE2'])
  assert.equal(cost, 30)
  assert.equal(topology.addressing.loopbackCost, 1)
  assert.ok(topology.addressing.coreMtu - 14 >= topology.addressing.ipv4Mtu + 2 * 4, 'Two MPLS labels must fit the XR untagged MTU budget')
  for (const name of ['PE1', 'P1', 'P2', 'PE2']) {
    const text = config(name)
    const ldp = section(text, 'mpls ldp')
    assert.ok(text.includes('router ospf CORE'))
    for (const link of core) for (const endpoint of [link.a, link.b].filter(endpoint => endpoint.node === name)) {
      assert.ok(ldp.includes('interface ' + endpoint.interface))
      assert.ok(section(text, 'interface ' + endpoint.interface).includes('mtu ' + topology.addressing.coreMtu))
    }
    if (name.startsWith('P') && !name.startsWith('PE')) {
      assert.ok(!text.includes('router bgp'))
      assert.ok(!text.includes('10.60.'))
      assert.ok(!text.includes('vrf ACME') && !text.includes('vrf BETA'))
    }
  }
  const rr = config('RR1')
  assert.equal((rr.match(/route-reflector-client/g) ?? []).length, 4)
  assert.equal((rr.match(/retain route-target all/g) ?? []).length, 2)
  assert.ok(!rr.includes('next-hop-self'))
  assert.ok(!rr.includes('mpls ldp') && !rr.includes('vrf ACME') && !rr.includes('vrf BETA'))
  for (const pe of ['PE1', 'PE2']) {
    const bgp = section(config(pe), 'router bgp ' + topology.addressing.providerAs)
    const peer = section(bgp, 'neighbor 10.0.0.5')
    assert.ok(peer.includes('address-family vpnv4 unicast') && peer.includes('address-family vpnv6 unicast'))
  }
})

test('PE–CE prefix policies and optional isolation controls preserve the tenant boundary', () => {
  for (const tenant of topology.tenants) for (const site of tenant.sites) {
    const pe = config(site.pe)
    const bgpVrf = section(section(pe, 'router bgp ' + topology.addressing.providerAs), 'vrf ' + tenant.name)
    const link = topology.links.find(link => link.tenant === tenant.name && [link.a.node, link.b.node].includes(site.ce))!
    const customer = [link.a, link.b].find(endpoint => endpoint.node === site.ce)!
    for (const [family, peer] of [['ipv4', customer.ipv4], ['ipv6', customer.ipv6!]]) {
      const neighbor = section(bgpVrf, 'neighbor ' + address(peer))
      assert.ok(neighbor.includes('remote-as ' + site.asn))
      const af = section(neighbor, 'address-family ' + family + ' unicast')
      for (const direction of ['in', 'out']) {
        const policyName = af.match(new RegExp('route-policy (\\S+) ' + direction + '\\b'))?.[1]
        assert.ok(policyName, site.pe + ' ' + tenant.name + ' ' + family + ' ' + direction)
        const policy = section(pe, 'route-policy ' + policyName)
        assert.ok(policy.includes('pass') && policy.includes('drop'))
        const set = policy.match(/destination in (\S+)/)?.[1]
        assert.ok(set)
        const prefix = direction === 'in' ? site : tenant.sites.find(other => other.ce !== site.ce)!
        assert.ok(section(pe, 'prefix-set ' + set).includes(family === 'ipv4' ? prefix.prefix4 : prefix.prefix6))
      }
    }
    const ce = config(site.ce)
    assert.ok(ce.includes('route-map CE-IN4 in') && ce.includes('route-map CE-OUT4 out'))
    assert.ok(ce.includes('route-map CE-IN6 in') && ce.includes('route-map CE-OUT6 out'))
    assert.ok(ce.includes('ip prefix-list SITE-LOCAL4 seq 10 permit ' + site.prefix4))
    assert.ok(ce.includes('ipv6 prefix-list SITE-LOCAL6 seq 10 permit ' + site.prefix6))
  }
  for (const name of ['CE-A1', 'CE-A2', 'PE1', 'PE2']) {
    for (const action of ['apply', 'restore']) assert.ok(existsSync(root + 'optional/isolation/' + name + '-' + action + '.cfg'))
  }
  const injection = readFileSync(root + 'optional/isolation/CE-A2-apply.cfg', 'utf8')
  assert.ok(injection.includes('198.51.100.222') && injection.includes('2001:db8:ac:2::222'))
  for (const name of ['PE1', 'PE2']) {
    const optional = readFileSync(root + 'optional/isolation/' + name + '-apply.cfg', 'utf8')
    assert.ok(optional.includes('vrf ACME'))
    assert.ok(!optional.includes('vrf BETA'), 'The negative isolation probe must not alter BETA')
  }
})
