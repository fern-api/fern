import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

const PRODUCTION_ENVNIRONMENT_NAME = "production";
const DEFAULT_ENVIRONMENT_NAME = "default";

export function buildEnvironments(context: OpenApiIrConverterContext): void {
    const topLevelServerURLsWithName: Record<string, string> = {};
    for (const server of context.ir.servers) {
        if (server.name == null) {
            context.logger.error(
                `Skipping ${server.url} because it has no name. Use the extension x-fern-server-name.`
            );
            continue;
        }
        topLevelServerURLsWithName[server.name] = server.url;
    }

    const endpointLevelServerURLsWithName: Record<string, string> = {};
    for (const endpoint of context.ir.endpoints) {
        for (const server of endpoint.server) {
            if (server.name == null) {
                context.logger.error(
                    `Skipping ${server.url} because it has no name. Use the extension x-fern-server-name.`
                );
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
