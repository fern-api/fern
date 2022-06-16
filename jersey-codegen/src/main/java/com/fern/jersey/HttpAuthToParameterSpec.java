package com.fern.jersey;

import com.fern.codegen.GeneratorContext;
import com.fern.types.services.http.HttpAuth;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.Optional;
import javax.ws.rs.HeaderParam;

public final class HttpAuthToParameterSpec implements HttpAuth.Visitor<Optional<ParameterSpec>> {

    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";

    private final GeneratorContext generatorContext;

    public HttpAuthToParameterSpec(GeneratorContext generatorContext) {
        this.generatorContext = generatorContext;
    }

    @Override
    public Optional<ParameterSpec> visitBEARER() {
        return Optional.of(
                ParameterSpec.builder(generatorContext.getAuthHeaderFile().className(), "authHeader")
                        .addAnnotation(AnnotationSpec.builder(HeaderParam.class)
                                .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                                .build())
                        .build());
    }

    @Override
    public Optional<ParameterSpec> visitNONE() {
        return Optional.empty();
    }

    @Override
    public Optional<ParameterSpec> visitUnknown(String _unknownType) {
        return Optional.empty();
    }
}
