import chalk from "chalk";

import { visitAllDefinitionFiles } from "@fern-api/api-workspace-commons";

import { Rule } from "../../Rule";
import { visitDefinitionFileYamlAst } from "../../ast";
import { EndpointPathRegistry } from "./EndpointPathRegistry";
import { getFullEndpointPath } from "./getFullEndpointPath";

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
