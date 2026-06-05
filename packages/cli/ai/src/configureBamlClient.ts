import { ClientRegistry, getLogLevel, setLogLevel } from "@boundaryml/baml";
import { generatorsYml } from "@fern-api/configuration";

/**
 * Maps the Fern provider name (from generators.yml) to the BAML provider string.
 * BAML uses "aws-bedrock" while the Fern config uses "bedrock".
 */
function toBamlProvider(provider: generatorsYml.ModelProvider): string {
    switch (provider) {
        case "bedrock":
            return "aws-bedrock";
        case "anthropic":
        case "openai":
            return provider;
    }
}

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

    // Add the LLM client to the registry with the BAML-expected provider name
    registry.addLlmClient("ConfiguredClient", toBamlProvider(config.provider), clientOptions);

    // Set it as the primary client
    registry.setPrimary("ConfiguredClient");

    // BAML logs are too verbose by default (includes prompt and request/response bodies)
    // We only do this once to avoid polluting the logs with messages about the log level change
    if (getLogLevel() !== "ERROR") {
        setLogLevel("ERROR");
    }

    return registry;
}
