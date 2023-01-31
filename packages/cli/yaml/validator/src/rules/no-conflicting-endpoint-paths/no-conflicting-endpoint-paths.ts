import { visitAllServiceFiles } from "@fern-api/workspace-loader";
import { visitFernServiceFileYamlAst } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { Rule } from "../../Rule";
import { EndpointPathRegistry } from "./EndpointPathRegistry";
import { getFullEndpointPath } from "./getFullEndpointPath";

export const NoConflictingEndpointPathsRule: Rule = {
    name: "no-conflicting-endpoint-paths",
    create: async ({ workspace }) => {
        const endpointPathRegistry = new EndpointPathRegistry();

        await visitAllServiceFiles(workspace, async (relativeFilepath, file) => {
            await visitFernServiceFileYamlAst(file, {
                httpEndpoint: ({ service, endpointId, endpoint }) => {
                    endpointPathRegistry.registerEndpoint({
                        service,
                        endpointId,
                        endpoint,
                        relativeFilepath,
                    });
                },
            });
        });

        return {
            serviceFile: {
                httpEndpoint: ({ service, endpoint, endpointId }, { relativeFilepath }) => {
                    const conflictingEndpoints = endpointPathRegistry.getConflictingEndpoints({
                        service,
                        endpointId,
                        endpoint,
                        relativeFilepath,
                    });

                    if (conflictingEndpoints.length === 0) {
                        return [];
                    }

                    return [
                        {
                            severity: "error",
                            message: [
                                `Endpoint path ${getFullEndpointPath({
                                    service,
                                    endpoint,
                                })} conflicts with other endpoints:`,
                                ...conflictingEndpoints.map(
                                    (conflictingEndpoint) =>
                                        `  - ${conflictingEndpoint.relativeFilepath} -> ${
                                            conflictingEndpoint.endpointId
                                        } ${chalk.dim(
                                            getFullEndpointPath({
                                                service: conflictingEndpoint.service,
                                                endpoint: conflictingEndpoint.endpoint,
                                            })
                                        )})`
                                ),
                            ].join("\n"),
                        },
                    ];
                },
            },
        };
    },
};
