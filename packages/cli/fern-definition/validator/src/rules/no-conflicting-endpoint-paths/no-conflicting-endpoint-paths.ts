import { visitAllDefinitionFiles } from "@fern-api/api-workspace-commons";
import chalk from "chalk";
import { visitDefinitionFileYamlAst } from "../../ast/index.js";
import { Rule } from "../../Rule.js";
import { EndpointPathRegistry } from "./EndpointPathRegistry.js";
import { getFullEndpointPath } from "./getFullEndpointPath.js";

export const NoConflictingEndpointPathsRule: Rule = {
    name: "no-conflicting-endpoint-paths",
    create: ({ workspace }) => {
        const endpointPathRegistry = new EndpointPathRegistry();

        visitAllDefinitionFiles(workspace, (relativeFilepath, file) => {
            visitDefinitionFileYamlAst(file, {
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
