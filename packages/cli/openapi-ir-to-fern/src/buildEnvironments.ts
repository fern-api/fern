import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

const PRODUCTION_ENVNIRONMENT_NAME = "Production";
const DEFAULT_ENVIRONMENT_NAME = "Default";

function isMultiServerSchema(
    schema: RawSchemas.EnvironmentSchema
): schema is RawSchemas.MultipleBaseUrlsEnvironmentSchema {
    return typeof schema === "object" && Object.hasOwn(schema, "urls");
}

function extractUrlsFromEnvironmentSchema(
    record: Record<string, RawSchemas.EnvironmentSchema>
): Record<string, string> {
    return Object.entries(record).reduce<Record<string, string>>((acc, [name, schemaOrUrl]) => {
        if (isMultiServerSchema(schemaOrUrl)) {
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
    const topLevelServersWithName: Record<string, RawSchemas.EnvironmentSchema> = {};
    const topLevelSkippedServers = [];
    for (const server of context.ir.servers) {
        if (server.name == null) {
            topLevelSkippedServers.push({
                url: server.url,
                audiences: server.audiences
            });
            continue;
        }
        topLevelServersWithName[server.name] = {
            url: server.url,
            audiences: server.audiences
        };
    }

    const endpointLevelServersWithName: Record<string, RawSchemas.EnvironmentSchema> = {};
    const endpointLevelSkippedServers = [];
    for (const endpoint of context.ir.endpoints) {
        for (const server of endpoint.server) {
            if (server.name == null) {
                endpointLevelSkippedServers.push({
                    url: server.url,
                    audiences: server.audiences
                });
                continue;
            }
            endpointLevelServersWithName[server.name] = {
                url: server.url,
                audiences: server.audiences
            };
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
                    .map((server) => server.url)
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
                    .map((server) => server.url)
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
