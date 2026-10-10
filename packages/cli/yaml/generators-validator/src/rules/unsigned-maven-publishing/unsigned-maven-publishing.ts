import { generatorsYml } from "@fern-api/configuration-loader";

import { Rule } from "../../Rule.js";

/**
 * Warns on `output.location: maven` (with or without a `github` block) that has neither `signature` nor `url`.
 * Those outputs default to the Central Portal staging URL, but Maven Central only releases signed artifacts, so the
 * upload is staged and never reaches Central. A warning rather than an error so existing configurations keep
 * working; warnings never fail `fern check` or block generation, so this does not need `checkOnly`.
 */
export const UnsignedMavenPublishingRule: Rule = {
    name: "unsigned-maven-publishing",
    create: async () => {
        return {
            generatorsYml: {
                generatorInvocation: async ({ invocation }) => {
                    if (!generatorsYml.isUnsignedMavenPublishingWithoutUrl(invocation)) {
                        return [];
                    }
                    const generatorName = "image" in invocation ? invocation.image.name : invocation.name;
                    return [
                        {
                            severity: "warning",
                            message: generatorsYml.getUnsignedMavenPublishingWithoutUrlMessage(generatorName)
                        }
                    ];
                }
            }
        };
    }
};
