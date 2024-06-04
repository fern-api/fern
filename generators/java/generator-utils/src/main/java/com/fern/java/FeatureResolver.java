package com.fern.java;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.logging.GeneratorUpdate;
import com.fern.generator.exec.model.logging.LogLevel;
import com.fern.generator.exec.model.logging.LogUpdate;
import com.fern.irV42.model.auth.AuthScheme;
import com.fern.irV42.model.auth.BearerAuthScheme;
import com.fern.irV42.model.auth.OAuthScheme;
import com.fern.irV42.model.commons.Name;
import com.fern.irV42.model.commons.SafeAndUnsafeString;
import com.fern.irV42.model.ir.IntermediateRepresentation;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Resolve
 */
public class FeatureResolver {

    public static final AuthScheme DEFAULT_BEARER_AUTH = AuthScheme.bearer(BearerAuthScheme.builder()
            .token(Name.builder()
                    .originalName("apiKey")
                    .camelCase(SafeAndUnsafeString.builder()
                            .unsafeName("apiKey")
                            .safeName("apiKey")
                            .build())
                    .pascalCase(SafeAndUnsafeString.builder()
                            .unsafeName("ApiKey")
                            .safeName("ApiKey")
                            .build())
                    .snakeCase(SafeAndUnsafeString.builder()
                            .unsafeName("api_key")
                            .safeName("api_key")
                            .build())
                    .screamingSnakeCase(SafeAndUnsafeString.builder()
                            .unsafeName("API_KEY")
                            .safeName("API_KEY")
                            .build())
                    .build())
            .build());
    private final IntermediateRepresentation ir;
    private final GeneratorConfig generatorConfig;
    private final DefaultGeneratorExecClient generatorExecClient;

    public FeatureResolver(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            DefaultGeneratorExecClient generatorExecClient) {
        this.ir = ir;
        this.generatorConfig = generatorConfig;
        this.generatorExecClient = generatorExecClient;
    }

    /**
     * Replace OAuth scheme with a bearer token scheme if the generator config doesn't allow OAuth.
     */
    public List<AuthScheme> getResolvedAuthSchemes() {
        List<AuthScheme> schemes = ir.getAuth().getSchemes();
        Optional<OAuthScheme> maybeOAuthScheme = schemes.stream()
                .map(AuthScheme::getOauth)
                .flatMap(Optional::stream)
                .findFirst();
        if (maybeOAuthScheme.isEmpty() || generatorConfig.getGenerateOauthClients()) return schemes;
        generatorExecClient.sendUpdate(GeneratorUpdate.log(LogUpdate.builder()
                .level(LogLevel.ERROR)
                .message("OAuth is not supported in your current Java SDK plan. Please reach out to the Fern team!")
                .build()));
        List<AuthScheme> resolvedSchemes = schemes.stream()
                .filter(authScheme -> !authScheme.isOauth() && !authScheme.isBearer())
                .collect(Collectors.toList());
        resolvedSchemes.add(DEFAULT_BEARER_AUTH);
        return resolvedSchemes;
    }
}
