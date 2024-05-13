package com.fern.java.generators.auth;

import com.fern.irV42.model.auth.AuthScheme;
import com.fern.irV42.model.auth.BasicAuthScheme;
import com.fern.irV42.model.auth.BearerAuthScheme;
import com.fern.irV42.model.auth.HeaderAuthScheme;
import com.fern.irV42.model.auth.OAuthScheme;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;

public final class AuthSchemeGenerator implements AuthScheme.Visitor<GeneratedJavaFile> {

    private final AbstractGeneratorContext<?, ?> generatorContext;

    public AuthSchemeGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        this.generatorContext = generatorContext;
    }

    @Override
    public GeneratedJavaFile visitBearer(BearerAuthScheme bearerAuthScheme) {
        BearerAuthGenerator bearerAuthGenerator = new BearerAuthGenerator(generatorContext);
        return bearerAuthGenerator.generateFile();
    }

    @Override
    public GeneratedJavaFile visitBasic(BasicAuthScheme basicAuthScheme) {
        BasicAuthGenerator basicAuthGenerator = new BasicAuthGenerator(generatorContext);
        return basicAuthGenerator.generateFile();
    }

    @Override
    public GeneratedJavaFile visitHeader(HeaderAuthScheme value) {
        HeaderAuthGenerator headerAuthGenerator = new HeaderAuthGenerator(generatorContext, value);
        return headerAuthGenerator.generateFile();
    }

    @Override
    public GeneratedJavaFile visitOauth(OAuthScheme oauth) {
        return null;
    }

    @Override
    public GeneratedJavaFile _visitUnknown(Object unknown) {
        throw new RuntimeException("Encountered unknown auth scheme: " + unknown);
    }
}
