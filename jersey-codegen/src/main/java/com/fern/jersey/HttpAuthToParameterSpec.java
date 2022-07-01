package com.fern.jersey;

import com.fern.java.auth.AuthHeader;
import com.fern.types.services.http.HttpAuth;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterSpec;
import java.util.Optional;
import javax.ws.rs.HeaderParam;

public final class HttpAuthToParameterSpec implements HttpAuth.Visitor<Optional<ParameterSpec>> {

    public static final HttpAuthToParameterSpec INSTANCE = new HttpAuthToParameterSpec();

    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";

    @Override
    public Optional<ParameterSpec> visitBEARER() {
        return Optional.of(ParameterSpec.builder(ClassName.get(AuthHeader.class), "authHeader")
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
