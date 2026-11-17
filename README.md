# base-global-warming

Global warming for a rule set to number: the polluted squares across the world, a saved warming level that moves
toward a target each turn, a warning and a strike as rules, and the squares a strike changes through core-world's
`TerrainChanged`.

This is a library: it registers nothing, and nothing happens until a rule set calls `updateGlobalWarming` from a rule of
its own and registers the rules below. With none of them registered, the level stays at 0 and nothing is saved.

## `lib/globalWarming`

`updateGlobalWarming({ Pollution, engine?, pendingEffectRegistry?, ruleRegistry?, tileImprovementRegistry?, world? })`
is one turn of warming, for a rule set to call once a turn:

1. the polluted squares are counted (`pollutedSquares`) and weighed (`WarmingPollution`);
2. the saved level moves toward the turn's target (`WarmingTarget`, then `WarmingLevel`);
3. `world:global-warming-warning` (`GLOBAL_WARMING_WARNING`) is emitted, with the level and the pollution, when a
   `WarmingWarning` rule says so;
4. when a `WarmingStrike` rule says so, the world warms: the warmings go up by one, the level goes back to 0, every
   square of the world is warmed (`warm`, with the warmings before this one) and `world:global-warming`
   (`GLOBAL_WARMING`) is emitted, with the warmings so far and the squares that changed.

The state is saved before anything is emitted. `Pollution` is the rule set's pollution improvement. `world()` gives the
world a strike changes; by default it's the world the first polluted square is in. It returns what it saw and did:
the squares, the pollution, the target, the level, the warmings, whether it warned and struck, and the squares changed.

## `lib/pollution`

- `pollutedSquares(Pollution, tileImprovementRegistry?)`: every square holding a `Pollution`, each once, in the order
  the pollution was registered. It's read from the tile improvements whenever it's asked, so it's right after a load
  and needs nothing saved; it walks the improvements, not the map. (Keeping a count as pollution comes and goes would
  need every way an improvement leaves the registry to say so, and some ways unregister it directly.)
- `warmingPollution(squares, ruleRegistry?)`: how much the squares count, the highest `WarmingPollution` answer, or one
  each with no rule.
- `discounted(timesCounted, divisor = 2)`: a `WarmingPollution` effect. Each square counts 1, less the times it falls
  in a discounted area, plus all those times over `divisor`, rounded down once. For example, half for a square near a
  computer player's city, counted once for each such city.

## `lib/level`

- `warmingTarget(pollution, warmings, ruleRegistry?, fallback = 0)`: the highest `WarmingTarget` answer.
- `warmingLevel(level, target, ruleRegistry?)`: the highest `WarmingLevel` answer, or `stepToward()` with no rule.
- `stepToward(step = 1, minimum = 0, maximum = Infinity)`: a `WarmingLevel` effect. The level moves `step` toward the
  target, stopping at it, then stays within the bounds.
- `warns(level, pollution, ruleRegistry?)` and `strikes(level, pollution, ruleRegistry?)`: whether any `WarmingWarning`
  or `WarmingStrike` rule says yes. With none registered, the answer is no.
- `atLevel(level, pollutionAbove)`: a `WarmingWarning` effect, true when the level is exactly `level` and the pollution
  is above `pollutionAbove`. It's asked every turn, so it warns on each turn the level sits there.
- `aboveLevel(level)`: a `WarmingStrike` effect, true when the level is above `level`.

## `lib/warm`

- `warm(tiles, warmings, ruleRegistry?)`: decides every square first, then changes them, so no answer depends on a
  square this warming has already changed. Each change is a new terrain given through `Tile.setTerrain`, which
  processes core-world's `TerrainChanged`. What a square keeps, such as its features and improvements, is up to the
  rule set's `TerrainChanged` rules. A square whose answer is its own terrain's class is left alone. Returns the
  squares that changed.
- `warmedTerrain(tile, warmings, ruleRegistry?)`: the first `WarmedTerrain` answer that names a terrain class, or
  `null`.

## `lib/state`

`globalWarmingState(pendingEffectRegistry?)` returns `{ level, warmings }`, which is `{ 0, 0 }` in a game that has none
yet. `setGlobalWarmingState(state, pendingEffectRegistry?)` writes it, and only `updateGlobalWarming` calls it.

The state is one `PendingEffect` record under `GLOBAL_WARMING_STATE` (`base-global-warming:state`), with no target and
its numbers kept as strings. Nothing discharges it. Pending effects are already saved, so warming needs no saved class
or registry of its own. A game in which the level and the warmings are both still 0 has no record.

## Rules

- `WarmingPollution(squares) → number`: how much the polluted squares count.
- `WarmingTarget(pollution, warmings) → number`: the level warming moves toward this turn.
- `WarmingLevel(level, target) → number`: the level after this turn's move.
- `WarmingWarning(level, pollution) → boolean`: whether to warn this turn.
- `WarmingStrike(level, pollution) → boolean`: whether the world warms this turn.
- `WarmedTerrain(tile, warmings) → typeof Terrain | null`: what a square becomes, given the warmings before this one.
