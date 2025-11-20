package com.fern.java;

import static com.fern.java.GeneratorLogging.logError;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.AuthSchemeKey;
import com.fern.ir.model.auth.BearerAuthScheme;
import com.fern.ir.model.auth.OAuthScheme;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.ir.IntermediateRepresentation;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class FeatureResolver {

    public static final AuthScheme DEFAULT_BEARER_AUTH = AuthScheme.bearer(BearerAuthScheme.builder()
            .key(AuthSchemeKey.of("bearer"))
            .token(Name.builder()
                    .originalName("token")
                    .camelCase(SafeAndUnsafeString.builder()
                            .unsafeName("token")
                            .safeName("token")
                            .build())
                    .pascalCase(SafeAndUnsafeString.builder()
                            .unsafeName("Token")
                            .safeName("Token")
                            .build())
                    .snakeCase(SafeAndUnsafeString.builder()
                            .unsafeName("token")
                            .safeName("token")
                            .build())
                    .screamingSnakeCase(SafeAndUnsafeString.builder()
                            .unsafeName("TOKEN")
                            .safeName("TOKEN")
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

    /** Replace OAuth scheme with a bearer token scheme if the generator config doesn't allow OAuth. */
    public List<AuthScheme> getResolvedAuthSchemes() {
        List<AuthScheme> schemes = ir.getAuth().getSchemes();
        Optional<OAuthScheme> maybeOAuthScheme = schemes.stream()
                .map(AuthScheme::getOauth)
                .flatMap(Optional::stream)
                .findFirst();
        if (maybeOAuthScheme.isEmpty() || generatorConfig.getGenerateOauthClients()) return schemes;
        logError(generatorExecClient, "OAuth is not supported in your current Java SDK plan; falling back to bearer auth. Please"
                        + " reach out to the Fern team!");
        List<AuthScheme> resolvedSchemes = schemes.stream()
                .filter(authScheme -> !authScheme.isOauth() && !authScheme.isBearer())
                .collect(Collectors.toList());
        resolvedSchemes.add(DEFAULT_BEARER_AUTH);
        return resolvedSchemes;
    }
}
