import { ROOT_API_FILENAME } from "@fern-api/project-configuration";
import chalk from "chalk";
import { Rule } from "../../Rule";
import { getAllEnvironmentUrlIds } from "../../utils/getAllEnvironmentUriIds";

export const ValidServiceUrlsRule: Rule = {
    name: "valid-service-urls",
    create: ({ workspace }) => {
        const urlIds = getAllEnvironmentUrlIds(workspace);

        return {
            definitionFile: {
                httpService: (service) => {
                    if (service.url == null) {
                        if (urlIds.length === 0) {
                            return [];
                        }
                        return [
                            {
                                severity: "error",
                                message: [
                                    '"url" is missing. Please specify one of the configured environment URLs:',
                                    ...urlIds.map((urlId) => `  - ${urlId}`),
                                ].join("\n"),
                            },
                        ];
                    }

                    if (urlIds.includes(service.url)) {
                        return [];
                    }

                    if (urlIds.length === 0) {
                        return [
                            {
                                severity: "error",
                                message: `"url" cannot be configured unless you specify multiple URLs for each environment in ${ROOT_API_FILENAME}`,
                            },
                        ];
                    }

                    return [
                        {
                            severity: "error",
                            message: [
                                `URL ${chalk.bold(
                                    service.url
                                )} is not recognized. Please add it to your environments in ${ROOT_API_FILENAME} or specify one of the configured environment URLs:`,
                                ...urlIds.map((urlId) => `  - ${urlId}`),
                            ].join("\n"),
                        },
                    ];
                },
            },
        };
    },
};
