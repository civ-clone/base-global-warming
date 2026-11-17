import Rule from '@civ-clone/core-rule/Rule';

/**
 * Whether to warn of warming this turn, given the level after this turn's move and the pollution that counts. Any rule
 *  saying yes warns, so a second rule can only add a case, never take one away: change a rule with
 *  `RuleRegistry.replace` (by its id) instead.
 */
export class WarmingWarning extends Rule<[number, number], boolean> {}

export default WarmingWarning;
