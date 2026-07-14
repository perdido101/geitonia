import { describe, expect, it } from 'vitest';
import type { Customer, GameState } from './types';
import { tick } from './tick';
import { apply } from './actions';
import { createInitialState } from './state';
import { customerPayout, tipMultiplierForRep } from './economy';
import { getRecipe } from '../data/recipes';
import { ARCHETYPES } from '../data/customers';
import { monthSpawnModifier } from './calendar';

// §4.8 — prove the core engine contract.

function freshWithShift(): GameState {
  let s = createInitialState({ seed: 42 });
  s = apply(s, { type: 'START_SHIFT', shopKey: 'kafeneio' });
  return s;
}

function makeCustomer(over: Partial<Customer> = {}): Customer {
  return {
    id: 'c1',
    archetypeKey: 'ypallilos',
    regularKey: null,
    order: [{ itemKey: 'ellinikos', fulfilled: false }],
    patience: 1.0,
    patienceDrainRate: 0.1,
    basePayout: 2.0,
    tipMultiplier: 1.0,
    state: 'waiting',
    spawnedAt: 0,
    ...over,
  };
}

describe('patience & failure', () => {
  it('patience hits 0 → customer leaves, failed++, rep −2.0', () => {
    const s = freshWithShift();
    const shop = s.shops.kafeneio;
    const rep0 = shop.reputation;
    s.activeShift!.queue = [makeCustomer({ patience: 0.001, patienceDrainRate: 1 })];
    const out = tick(s, 1.0); // drains well past 0
    expect(out.activeShift!.failed).toBe(1);
    expect(out.activeShift!.queue.length).toBe(0);
    expect(out.shops.kafeneio.reputation).toBeCloseTo(rep0 - 2.0, 5);
  });

  it('Regular leaves → rep −4.0 (double)', () => {
    const s = freshWithShift();
    s.regulars.thanasis.unlocked = true;
    const rep0 = s.shops.kafeneio.reputation;
    s.activeShift!.queue = [
      makeCustomer({ regularKey: 'thanasis', archetypeKey: 'regular', patience: 0.001, patienceDrainRate: 1 }),
    ];
    s.activeShift!.regularInQueue = true;
    const out = tick(s, 1.0);
    expect(out.shops.kafeneio.reputation).toBeCloseTo(rep0 - 4.0, 5);
    expect(out.regulars.thanasis.timesFailed).toBe(1);
    expect(out.regulars.thanasis.standing).toBe(-2);
    expect(out.activeShift!.regularInQueue).toBe(false);
  });
});

describe('serving & payout', () => {
  it('correct serve → payout = basePrice × tipMultiplier × archetype.tipMult (quality 0, non-regular)', () => {
    const s = freshWithShift();
    const tip = tipMultiplierForRep(s.shops.kafeneio.reputation);
    const cust = makeCustomer({ tipMultiplier: tip, archetypeKey: 'giagia', order: [{ itemKey: 'frape', fulfilled: false }] });
    s.activeShift!.queue = [cust];
    s.activeShift!.heldItem = 'frape';
    s.activeShift!.heldItemStep = 0;
    const out = apply(s, { type: 'TAP_CUSTOMER', customerId: 'c1' });
    const expected = getRecipe('frape').basePrice * tip * ARCHETYPES.giagia.tipMult;
    expect(out.activeShift!.grossEarned).toBeCloseTo(expected, 5);
    expect(out.activeShift!.served).toBe(1);
  });

  it('Regular served → payout is exactly 3× base × multipliers', () => {
    const s = freshWithShift();
    s.regulars.thanasis.unlocked = true;
    const tip = tipMultiplierForRep(s.shops.kafeneio.reputation);
    const cust = makeCustomer({
      regularKey: 'thanasis', archetypeKey: 'regular', tipMultiplier: tip,
      order: [{ itemKey: 'ellinikos', fulfilled: false }],
    });
    s.activeShift!.queue = [cust];
    s.activeShift!.regularInQueue = true;
    s.activeShift!.heldItem = 'ellinikos';
    const out = apply(s, { type: 'TAP_CUSTOMER', customerId: 'c1' });
    const expected = getRecipe('ellinikos').basePrice * tip * 3.0; // archetype tip 1.0 for regulars
    expect(out.activeShift!.grossEarned).toBeCloseTo(expected, 5);
    // payout helper agrees
    expect(customerPayout(cust, out.shops.kafeneio)).toBeCloseTo(expected, 5);
  });

  it('wrong serve → item destroyed, rep −0.3, customer unchanged', () => {
    const s = freshWithShift();
    const rep0 = s.shops.kafeneio.reputation;
    s.activeShift!.queue = [makeCustomer({ order: [{ itemKey: 'ellinikos', fulfilled: false }] })];
    s.activeShift!.heldItem = 'frape'; // not what they ordered
    const out = apply(s, { type: 'TAP_CUSTOMER', customerId: 'c1' });
    expect(out.activeShift!.heldItem).toBe(null);
    expect(out.shops.kafeneio.reputation).toBeCloseTo(rep0 - 0.3, 5);
    expect(out.activeShift!.queue[0].order[0].fulfilled).toBe(false);
    expect(out.activeShift!.served).toBe(0);
  });
});

describe('stations', () => {
  it('station burns exactly 8.0s after becoming ready', () => {
    const s = freshWithShift();
    const station = s.shops.kafeneio.stations.find((st) => st.typeKey === 'briki')!;
    station.state = 'ready';
    station.producing = 'ellinikos';
    station.timer = 0;
    // 7.9s → still ready; +0.2s → burnt (crosses 8.0)
    let out = tick(s, 7.9);
    let st = out.shops.kafeneio.stations.find((x) => x.id === station.id)!;
    expect(st.state).toBe('ready');
    out = tick(out, 0.2);
    st = out.shops.kafeneio.stations.find((x) => x.id === station.id)!;
    expect(st.state).toBe('burnt');
    expect(st.producing).toBe(null);
  });

  it('burnt station cannot be used until clearing completes (2.0s)', () => {
    const s = freshWithShift();
    const station = s.shops.kafeneio.stations.find((st) => st.typeKey === 'briki')!;
    station.state = 'burnt';
    // Tapping a burnt station starts clearing.
    let out = apply(s, { type: 'TAP_STATION', stationId: station.id });
    let st = out.shops.kafeneio.stations.find((x) => x.id === station.id)!;
    expect(st.state).toBe('clearing');
    // Cannot start cooking while clearing.
    out = apply(out, { type: 'START_COOKING', stationId: station.id, itemKey: 'ellinikos', stepIndex: 0 });
    st = out.shops.kafeneio.stations.find((x) => x.id === station.id)!;
    expect(st.state).toBe('clearing');
    // 1.9s not enough; +0.2s completes.
    out = tick(out, 1.9);
    st = out.shops.kafeneio.stations.find((x) => x.id === station.id)!;
    expect(st.state).toBe('clearing');
    out = tick(out, 0.2);
    st = out.shops.kafeneio.stations.find((x) => x.id === station.id)!;
    expect(st.state).toBe('idle');
  });

  it('multi-step recipe: espresso → frapiera produces a servable freddo', () => {
    const s = freshWithShift();
    const espresso = s.shops.kafeneio.stations.find((st) => st.typeKey === 'espresso')!;
    const frapiera = s.shops.kafeneio.stations.find((st) => st.typeKey === 'frapiera')!;
    let out = apply(s, { type: 'START_COOKING', stationId: espresso.id, itemKey: 'freddo_espresso', stepIndex: 0 });
    out = tick(out, 5.0); // espresso cook time
    let est = out.shops.kafeneio.stations.find((x) => x.id === espresso.id)!;
    expect(est.state).toBe('ready');
    out = apply(out, { type: 'TAP_STATION', stationId: espresso.id }); // collect step 0
    expect(out.activeShift!.heldItem).toBe('freddo_espresso');
    expect(out.activeShift!.heldItemStep).toBe(0);
    out = apply(out, { type: 'START_COOKING', stationId: frapiera.id, itemKey: 'freddo_espresso', stepIndex: 1 });
    expect(out.activeShift!.heldItem).toBe(null); // consumed into step 1
    out = tick(out, 4.0); // frapiera cook time
    out = apply(out, { type: 'TAP_STATION', stationId: frapiera.id });
    expect(out.activeShift!.heldItem).toBe('freddo_espresso');
    expect(out.activeShift!.heldItemStep).toBe(1); // fully complete
  });
});

describe('calendar & economy', () => {
  it('Αύγουστος spawn modifier resolves to exactly 0.4', () => {
    // Day in August: month 8 → days 29..32. Day 29.
    expect(monthSpawnModifier(29, 'kafeneio')).toBeCloseTo(0.4, 10);
    expect(monthSpawnModifier(30, 'psarotaverna')).toBeCloseTo(0.4, 10);
  });

  it('rent + ΕΦΚΑ deducted on day 4, 8, 12 and NOT on days 1–3', () => {
    // Days 1–3: no charge.
    for (const startDay of [1, 2]) {
      let s = createInitialState();
      s.day = startDay;
      const before = s.money;
      s = apply(s, { type: 'ADVANCE_DAY' }); // → startDay+1 (still <4)
      expect(s.money).toBe(before);
    }
    // Day 3 → 4: charge €40 (1 shop) + €150. Plenty of cash so no forced loan fires.
    let s = createInitialState();
    s.day = 3;
    s.money = 1000;
    s = apply(s, { type: 'ADVANCE_DAY' });
    expect(s.day).toBe(4);
    expect(s.money).toBeCloseTo(1000 - (40 + 150), 5);
  });

  it('debt > 5000 → gameOver', () => {
    let s = createInitialState();
    s.debt = 5001;
    s.day = 7;
    s = apply(s, { type: 'ADVANCE_DAY' }); // day 8, billing; interest pushes it further
    expect(s.flags.gameOver).toBe(true);
  });

  it('forced loan prevents money going negative when there is headroom', () => {
    let s = createInitialState();
    s.money = 10;
    s.day = 3;
    s = apply(s, { type: 'ADVANCE_DAY' }); // day 4: −190, forced loan covers
    expect(s.money).toBe(0);
    expect(s.debt).toBeGreaterThan(0);
  });
});

describe('shift end', () => {
  it('does not end while the queue is non-empty, even past duration', () => {
    const s = freshWithShift();
    s.activeShift!.elapsed = s.activeShift!.duration + 10;
    s.activeShift!.queue = [makeCustomer({ patience: 1, patienceDrainRate: 0 })];
    const out = tick(s, 0.016);
    expect(out.activeShift).not.toBeNull();
  });

  it('ends when past duration and the queue is empty', () => {
    const s = freshWithShift();
    s.activeShift!.elapsed = s.activeShift!.duration + 1;
    s.activeShift!.queue = [];
    s.activeShift!.grossEarned = 100;
    const startMoney = s.money;
    const out = tick(s, 0.016);
    expect(out.activeShift).toBeNull();
    // net = gross − 30% ingredients added to money
    expect(out.money).toBeCloseTo(startMoney + 100 * 0.7, 5);
  });
});
