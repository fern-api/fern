package com.fern.java.generators;

import com.fern.irV42.model.auth.ApiAuth;
import com.fern.irV42.model.auth.AuthScheme;
import com.fern.irV42.model.auth.AuthSchemesRequirement;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.auth.AuthSchemeGenerator;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import java.util.Optional;

public final class AuthGenerator {

    private final ApiAuth apiAuth;
    private final AbstractGeneratorContext<?, ?> generatorContext;

    public AuthGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        this.apiAuth = generatorContext.getIr().getAuth();
        this.generatorContext = generatorContext;
    }

    public Optional<GeneratedAuthFiles> generate() {
        if (apiAuth.getSchemes().size() == 0) {
            return Optional.empty();
        } else if (apiAuth.getSchemes().size() == 1) {
            AuthScheme authScheme = apiAuth.getSchemes().get(0);
            GeneratedJavaFile generatedFile = authScheme.visit(new AuthSchemeGenerator(generatorContext));
            return Optional.of(GeneratedAuthFiles.builder()
                    .className(generatedFile.getClassName())
                    .javaFile(generatedFile.javaFile())
                    .authScheme(authScheme)
                    .build());
        } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ANY)) {
            throw new RuntimeException("Any auth is unsupported!");
        } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ALL)) {
            throw new RuntimeException("All auth is unsupported!");
        }
        throw new RuntimeException("Encountered unknown apiAuth: " + apiAuth);
    }
}
