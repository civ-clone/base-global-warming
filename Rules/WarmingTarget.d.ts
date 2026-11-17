import Rule from '@civ-clone/core-rule/Rule';
/**
 * The level warming moves toward this turn, given the pollution that counts (`WarmingPollution`) and the warmings so far.
 * Register one: the reader takes the highest answer, so a second rule can't adjust the first; change it with
 *  `RuleRegistry.replace` (by the rule's id) instead.
 */
export declare class WarmingTarget extends Rule<[number, number], number> {}
export default WarmingTarget;
