import { ClientRegistry, getLogLevel, setLogLevel } from "@boundaryml/baml";
import { generatorsYml } from "@fern-api/configuration";

/**
 * Creates and configures a BAML ClientRegistry based on the provided AI service configuration.
 * This allows dynamic runtime configuration of LLM providers without modifying BAML files.
 *
 * API keys are automatically read from environment variables:
 * - OpenAI: OPENAI_API_KEY
 * - Anthropic: ANTHROPIC_API_KEY
 * - Bedrock: Uses AWS SDK credentials from environment
 *
 * @param config - The AI service configuration from generators.yml
 * @returns A configured ClientRegistry instance
 */
export function configureBamlClient(config: generatorsYml.AiServicesSchema): ClientRegistry {
    const registry = new ClientRegistry();

    // Configure the client - BAML will automatically read API keys from environment variables
    const clientOptions = {
        model: config.model
    };

    // Add the LLM client to the registry
    registry.addLlmClient("ConfiguredClient", config.provider, clientOptions);

    // Set it as the primary client
    registry.setPrimary("ConfiguredClient");

    // BAML logs are too verbose by default (includes prompt and request/response bodies)
    // We only do this once to avoid polluting the logs with messages about the log level change
    if (getLogLevel() !== "ERROR") {
        setLogLevel("ERROR");
    }

    return registry;
}
