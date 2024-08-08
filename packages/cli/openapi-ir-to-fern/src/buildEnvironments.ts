import { isRawMultipleBaseUrlsEnvironment, RawSchemas } from "@fern-api/yaml-schema";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

const PRODUCTION_ENVNIRONMENT_NAME = "Production";
const DEFAULT_ENVIRONMENT_NAME = "Default";

function extractUrlsFromEnvironmentSchema(
    record: Record<string, RawSchemas.EnvironmentSchema>
): Record<string, string> {
    return Object.entries(record).reduce<Record<string, string>>((acc, [name, schemaOrUrl]) => {
        if (isRawMultipleBaseUrlsEnvironment(schemaOrUrl)) {
            Object.entries(schemaOrUrl.urls).forEach(([urlsName, urlsValue]) => {
                acc[urlsName] = urlsValue;
            });
        } else {
            acc[name] = typeof schemaOrUrl === "string" ? schemaOrUrl : schemaOrUrl.url;
        }

        return acc;
    }, {});
}

export function buildEnvironments(context: OpenApiIrConverterContext): void {
    const fullEnvironments: Record<string, Record<string, string>> = {};
    for (const server of context.ir.servers) {
        if (server.name != null && server.environment != null) {
            const environment = fullEnvironments[server.environment] ?? {};
            environment[server.name] = server.url;
            fullEnvironments[server.environment] = environment;
        }
    }

    // If the environments are valid (e.g. the keys across environments are the same), add them to the builder
    // and return, otherwise then you want to go down the original path of adding the environments to the builder.
    if (Object.keys(fullEnvironments).length > 0) {
        const firstEnvironmentName = Object.keys(fullEnvironments)[0];
        const firstEnvironment = Object.values(fullEnvironments)[0];

        if (firstEnvironment != null) {
            const maybeEnvironmentUrls = firstEnvironment != null ? Object.values(firstEnvironment) : [];
            // If any of the environments aren't valid, don't respect the lists
            const environmentsAreValid = Object.values(fullEnvironments).every((environment) => {
                const theseEnvUrls = Object.keys(environment);
                const firstEnvUrls = Object.keys(firstEnvironment);
                if (theseEnvUrls.length !== firstEnvUrls.length) {
                    return false;
                }

                return theseEnvUrls.every((value, index) => value === firstEnvUrls[index]);
            });

            if (maybeEnvironmentUrls.length > 0 && environmentsAreValid) {
                for (const [environmentName, urls] of Object.entries(fullEnvironments)) {
                    context.builder.addEnvironment({
                        name: environmentName,
                        schema: { urls }
                    });
                }
                // Set the first environment as the default environment this should
                // be a safe check since we've already validated the length of the Record.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                context.builder.setDefaultEnvironment(firstEnvironmentName!);
                return;
            }
        }
    }

    const topLevelServersWithName: Record<string, RawSchemas.EnvironmentSchema> = {};
    const topLevelSkippedServers = [];
    for (const server of context.ir.servers) {
        const environmentSchema = server.audiences
            ? {
                  url: server.url,
                  audiences: server.audiences
              }
            : server.url;
        if (server.name == null) {
            topLevelSkippedServers.push(environmentSchema);
            continue;
        }
        topLevelServersWithName[server.name] = environmentSchema;
    }

    const endpointLevelServersWithName: Record<string, RawSchemas.EnvironmentSchema> = {};
    const endpointLevelSkippedServers = [];
    for (const endpoint of context.ir.endpoints) {
        for (const server of endpoint.server) {
            const environmentSchema = server.audiences
                ? {
                      url: server.url,
                      audiences: server.audiences
                  }
                : server.url;
            if (server.name == null) {
                endpointLevelSkippedServers.push(environmentSchema);
                continue;
            }
            endpointLevelServersWithName[server.name] = environmentSchema;
        }
    }

    const numTopLevelServers = Object.keys(topLevelServersWithName).length;
    const numEndpointLevelServers = Object.keys(endpointLevelServersWithName).length;

    if (numTopLevelServers === 0 && numEndpointLevelServers === 0) {
        const singleURL = context.ir.servers[0]?.url;
        const singleURLAudiences = context.ir.servers[0]?.audiences;
        if (singleURL != null) {
            context.builder.addEnvironment({
                name: DEFAULT_ENVIRONMENT_NAME,
                schema: singleURLAudiences
                    ? {
                          url: singleURL,
                          audiences: singleURLAudiences
                      }
                    : singleURL
            });
            context.builder.setDefaultEnvironment(DEFAULT_ENVIRONMENT_NAME);
        }
    } else if (numTopLevelServers > 0 && numEndpointLevelServers === 0) {
        let count = 0;
        if (topLevelSkippedServers.length > 0) {
            context.logger.error(
                `Skipping servers ${topLevelSkippedServers
                    .map((server) => (typeof server === "string" ? server : server.url))
                    .join(", ")} because x-fern-server-name was not provided.`
            );
        }
        for (const [name, schema] of Object.entries(topLevelServersWithName)) {
            if (count === 0) {
                context.builder.setDefaultEnvironment(name);
            }
            context.builder.addEnvironment({
                name,
                schema
            });
            count += 1;
        }
    } else if (numEndpointLevelServers > 0) {
        if (topLevelSkippedServers.length > 0 || endpointLevelSkippedServers.length > 0) {
            context.logger.error(
                `Skipping servers ${[...topLevelSkippedServers, ...endpointLevelSkippedServers]
                    .map((server) => (typeof server === "string" ? server : server.url))
                    .join(", ")} because x-fern-server-name was not provided.`
            );
        }
        const toplevelServerEntries = Object.entries(topLevelServersWithName)[0];
        if (toplevelServerEntries != null) {
            const [name, _] = toplevelServerEntries;
            context.setDefaultServerName(name);
        }
        context.builder.addEnvironment({
            name: PRODUCTION_ENVNIRONMENT_NAME,
            schema: {
                urls: {
                    ...extractUrlsFromEnvironmentSchema(topLevelServersWithName),
                    ...extractUrlsFromEnvironmentSchema(endpointLevelServersWithName)
                }
            }
        });
        context.builder.setDefaultEnvironment(PRODUCTION_ENVNIRONMENT_NAME);
    }
}
