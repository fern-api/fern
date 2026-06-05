import { ClientRegistry, getLogLevel, setLogLevel } from "@boundaryml/baml";
import { generatorsYml } from "@fern-api/configuration";

/**
 * Creates and configures a BAML ClientRegistry based on the provided AI service configuration.
 * This allows dynamic runtime configuration of LLM providers without modifying BAML files.
 *
 * The `provider` value from generators.yml is passed directly to BAML as the client provider.
 * Supported values match BAML's provider identifiers (e.g., "openai", "anthropic", "aws-bedrock").
 *
 * @param config - The AI service configuration from generators.yml
 * @returns A configured ClientRegistry instance
 */
export function configureBamlClient(config: generatorsYml.AiServicesSchema): ClientRegistry {
    const registry = new ClientRegistry();

    const clientOptions = {
        model: config.model
    };

    registry.addLlmClient("ConfiguredClient", config.provider, clientOptions);
    registry.setPrimary("ConfiguredClient");

    // BAML logs are too verbose by default (includes prompt and request/response bodies)
    // We only do this once to avoid polluting the logs with messages about the log level change
    if (getLogLevel() !== "ERROR") {
        setLogLevel("ERROR");
    }

    return registry;
}
