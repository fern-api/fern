import chalk from "chalk";

import { visitRawEnvironmentDeclaration } from "@fern-api/fern-definition-schema";

import { Rule, RuleViolation } from "../../Rule";
import { getAllEnvironmentUrlIds } from "../../utils/getAllEnvironmentUriIds";

export const MatchingEnvironmentUrlsRule: Rule = {
    name: "matching-environment-urls",
    create: ({ workspace }) => {
        const urlIds = getAllEnvironmentUrlIds(workspace);
        if (urlIds.length === 0) {
            return {};
        }

        return {
            rootApiFile: {
                environment: ({ environmentId, environment }) => {
                    const violations: RuleViolation[] = [];

                    const addViolationForUrlId = (urlId: string) => {
                        violations.push({
                            severity: "error",
                            message: `Environment ${environmentId} is missing URL for ${chalk.bold(urlId)}`
                        });
                    };

                    visitRawEnvironmentDeclaration(environment, {
                        singleBaseUrl: () => {
                            for (const urlId of urlIds) {
                                addViolationForUrlId(urlId);
                            }
                        },
                        multipleBaseUrls: (multipleBaseUrlsEnvironment) => {
                            for (const urlId of urlIds) {
                                if (multipleBaseUrlsEnvironment.urls[urlId] == null) {
                                    addViolationForUrlId(urlId);
                                }
                            }
                        }
                    });

                    return violations;
                }
            }
        };
    }
};
