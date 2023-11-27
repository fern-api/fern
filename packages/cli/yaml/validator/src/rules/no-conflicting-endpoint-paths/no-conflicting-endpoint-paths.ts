import { visitAllDefinitionFiles } from "@fern-api/workspace-loader";
import { visitDefinitionFileYamlAst } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { Rule } from "../../Rule";
import { EndpointPathRegistry } from "./EndpointPathRegistry";
import { getFullEndpointPath } from "./getFullEndpointPath";

export const NoConflictingEndpointPathsRule: Rule = {
    name: "no-conflicting-endpoint-paths",
    create: async ({ workspace }) => {
        const endpointPathRegistry = new EndpointPathRegistry();

        await visitAllDefinitionFiles(workspace, async (relativeFilepath, file) => {
            await visitDefinitionFileYamlAst(file, {
                httpEndpoint: ({ service, endpointId, endpoint }) => {
                    endpointPathRegistry.registerEndpoint({
                        service,
                        endpointId,
                        endpoint,
                        relativeFilepath
                    });
                }
            });
        });

        return {
            definitionFile: {
                httpEndpoint: ({ service, endpoint, endpointId }, { relativeFilepath }) => {
                    const conflictingEndpoints = endpointPathRegistry.getConflictingEndpoints({
                        service,
                        endpointId,
                        endpoint,
                        relativeFilepath
                    });

                    if (conflictingEndpoints.length === 0) {
                        return [];
                    }

                    return [
                        {
                            severity: "warning",
                            message: [
                                `Endpoint path ${getFullEndpointPath({
                                    service,
                                    endpoint
                                })} conflicts with other endpoints:`,
                                ...conflictingEndpoints.map(
                                    (conflictingEndpoint) =>
                                        `  - ${conflictingEndpoint.relativeFilepath} -> ${
                                            conflictingEndpoint.endpointId
                                        } ${chalk.dim(
                                            getFullEndpointPath({
                                                service: conflictingEndpoint.service,
                                                endpoint: conflictingEndpoint.endpoint
                                            })
                                        )}`
                                )
                            ].join("\n")
                        }
                    ];
                }
            }
        };
    }
};
