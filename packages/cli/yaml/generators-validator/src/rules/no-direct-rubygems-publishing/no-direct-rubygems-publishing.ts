import { generatorsYml } from "@fern-api/configuration-loader";

import { Rule } from "../../Rule.js";

/**
 * Flags `output.location: rubygems` without a `github` block. Remote generation would try to push the
 * gem to RubyGems directly, which the Ruby generator does not support, so the run would only fail at
 * publish time. Check-only: `fern generate --local`, `--preview`, and `--lfs-override` never publish
 * and keep working with this configuration; remote `fern generate` rejects it for the selected
 * generators before any work starts.
 */
export const NoDirectRubyGemsPublishingRule: Rule = {
    name: "no-direct-rubygems-publishing",
    checkOnly: true,
    create: async () => {
        return {
            generatorsYml: {
                generatorInvocation: async ({ invocation }) => {
                    if (!generatorsYml.isDirectRubyGemsPublishing(invocation)) {
                        return [];
                    }
                    return [
                        {
                            severity: "error",
                            message: generatorsYml.DIRECT_RUBYGEMS_PUBLISHING_UNSUPPORTED_MESSAGE
                        }
                    ];
                }
            }
        };
    }
};
