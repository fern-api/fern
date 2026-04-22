import type { generatorsYml } from "@fern-api/configuration-loader";

import { describeSkipReason } from "./describeSkipReason.js";
import { shouldSkipGenerator } from "./shouldSkipGenerator.js";

/**
 * How the caller targeted generators, and any metadata needed to surface a useful error:
 *   - "index": `--generator <N>` — strict; opt-out of the targeted generator rejects.
 *     The index is carried through so the rejection message names it.
 *   - "name": `--generator <name>` — lenient filter; opt-outs are silently removed.
 *   - "none": no `--generator` flag (fan-out) — lenient filter.
 */
export type AutomationTargeting = { type: "index"; index: number } | { type: "name"; name: string } | { type: "none" };

/**
 * Builds an {@link AutomationTargeting} from the parsed `--generator` flag components. Index
 * wins over name, matching `parseGeneratorArg`'s contract that at most one is set.
 */
export function buildAutomationTargeting({
    generatorIndex,
    generatorName
}: {
    generatorIndex: number | undefined;
    generatorName: string | undefined;
}): AutomationTargeting {
    if (generatorIndex != null) {
        return { type: "index", index: generatorIndex };
    }
    if (generatorName != null) {
        return { type: "name", name: generatorName };
    }
    return { type: "none" };
}

export type SelectGeneratorsResult =
    | {
          type: "run";
          /** Generators that should actually execute. */
          generators: generatorsYml.GeneratorInvocation[];
      }
    | {
          type: "reject-opted-out";
          /** The offending generator's name. */
          generatorName: string;
          /** The index the caller targeted. */
          index: number;
          /** Human-readable reason, e.g. "automations.generate is false". */
          reason: string;
      }
    | {
          /** Every generator was filtered out by the opt-out check; the caller should silently skip. */
          type: "empty-after-skip";
      };

/**
 * Applies the automation opt-out policy to a list of generators that has already been filtered
 * by `--generator` targeting.
 *
 * Policy:
 * - `--generator <index>`: index-based targeting is deterministic, so if that exact generator
 *   opts out it is a user error — reject loudly via `"reject-opted-out"` so they see why nothing
 *   would have run.
 * - `--generator <name>` or no `--generator` flag: silently drop opted-out generators. A name
 *   can match multiple generators in the group, and some of them may legitimately opt out
 *   (e.g. an internal variant disabled from automation) — filtering is the expected behavior.
 *   If the group has nothing left, signal `"empty-after-skip"` so the caller can return from
 *   the group without noise in the summary.
 */
export function selectGeneratorsForAutomation({
    generators,
    rootAutorelease,
    targeting
}: {
    generators: generatorsYml.GeneratorInvocation[];
    rootAutorelease: boolean | undefined;
    targeting: AutomationTargeting;
}): SelectGeneratorsResult {
    if (targeting.type === "index") {
        // Index-based targeting resolves to exactly one generator; filterGenerators has already
        // narrowed the list to that single entry. Reject if it's opted out.
        for (const g of generators) {
            const reason = describeSkipReason(g, rootAutorelease);
            if (reason != null) {
                return { type: "reject-opted-out", generatorName: g.name, index: targeting.index, reason };
            }
        }
        return { type: "run", generators };
    }

    const eligible = generators.filter((g) => !shouldSkipGenerator({ generator: g, rootAutorelease }));
    if (eligible.length === 0) {
        return { type: "empty-after-skip" };
    }
    return { type: "run", generators: eligible };
}
