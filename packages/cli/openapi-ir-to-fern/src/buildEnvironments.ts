import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

const PRODUCTION_ENVNIRONMENT_NAME = "Production";
const DEFAULT_ENVIRONMENT_NAME = "Default";

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
                context.builder.setDefaultEnvironment(firstEnvironmentName!);
                return;
            }
        }
    }

    const topLevelServerURLsWithName: Record<string, string> = {};
    const topLevelSkippedServerURLs = [];
    for (const server of context.ir.servers) {
        if (server.name == null) {
            topLevelSkippedServerURLs.push(server.url);
            continue;
        }
        topLevelServerURLsWithName[server.name] = server.url;
    }

    const endpointLevelServerURLsWithName: Record<string, string> = {};
    const endpointLevelSkippedServerURLs = [];
    for (const endpoint of context.ir.endpoints) {
        for (const server of endpoint.server) {
            if (server.name == null) {
                endpointLevelSkippedServerURLs.push(server.url);
                continue;
            }
            endpointLevelServerURLsWithName[server.name] = server.url;
        }
    }

    const numTopLevelURLs = Object.keys(topLevelServerURLsWithName).length;
    const numEndpointLevelURLs = Object.keys(endpointLevelServerURLsWithName).length;

    if (numTopLevelURLs === 0 && numEndpointLevelURLs === 0) {
        const singleURL = context.ir.servers[0]?.url;
        if (singleURL != null) {
            context.builder.addEnvironment({
                name: DEFAULT_ENVIRONMENT_NAME,
                schema: singleURL
            });
            context.builder.setDefaultEnvironment(DEFAULT_ENVIRONMENT_NAME);
        }
    } else if (numTopLevelURLs > 0 && numEndpointLevelURLs === 0) {
        let count = 0;
        if (topLevelSkippedServerURLs.length > 0) {
            context.logger.error(
                `Skipping servers ${topLevelSkippedServerURLs.join(", ")} because x-fern-server-name was not provided.`
            );
        }
        for (const [name, url] of Object.entries(topLevelServerURLsWithName)) {
            if (count === 0) {
                context.builder.setDefaultEnvironment(name);
            }
            context.builder.addEnvironment({
                name,
                schema: url
            });
            count += 1;
        }
    } else if (numEndpointLevelURLs > 0) {
        if (topLevelSkippedServerURLs.length > 0 || endpointLevelSkippedServerURLs.length > 0) {
            context.logger.error(
                `Skipping servers ${[...topLevelSkippedServerURLs, ...endpointLevelSkippedServerURLs].join(
                    ", "
                )} because x-fern-server-name was not provided.`
            );
        }
        const toplevelServerURLEntries = Object.entries(topLevelServerURLsWithName)[0];
        if (toplevelServerURLEntries != null) {
            const [name, _] = toplevelServerURLEntries;
            context.setDefaultServerName(name);
        }
        context.builder.addEnvironment({
            name: PRODUCTION_ENVNIRONMENT_NAME,
            schema: {
                urls: {
                    ...topLevelServerURLsWithName,
                    ...endpointLevelServerURLsWithName
                }
            }
        });
        context.builder.setDefaultEnvironment(PRODUCTION_ENVNIRONMENT_NAME);
    }
}
