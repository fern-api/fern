package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

public final class RawHttpEndpointMethodSpecs implements HttpEndpointMethodSpecs {

    private final HttpEndpointMethodSpecs httpEndpointMethodSpecs;
    private final ClassName rawHttpResponseClassName;

    public RawHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs, ClassName rawHttpResponseClassName) {
        this.httpEndpointMethodSpecs = httpEndpointMethodSpecs;
        this.rawHttpResponseClassName = rawHttpResponseClassName;
    }

    @Override
    public MethodSpec getNonRequestOptionsMethodSpec() {
        MethodSpec methodSpec = httpEndpointMethodSpecs.getNonRequestOptionsMethodSpec();
        return methodSpec.toBuilder()
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .build();
    }

    @Override
    public MethodSpec getRequestOptionsMethodSpec() {
        MethodSpec methodSpec = httpEndpointMethodSpecs.getRequestOptionsMethodSpec();
        return methodSpec.toBuilder()
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .build();
    }

    @Override
    public Optional<MethodSpec> getNoRequestBodyMethodSpec() {
        return httpEndpointMethodSpecs.getNoRequestBodyMethodSpec().map(methodSpec -> methodSpec.toBuilder()
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .build());
    }

    @Override
    public Optional<MethodSpec> getByteArrayMethodSpec() {
        return httpEndpointMethodSpecs.getByteArrayMethodSpec().map(methodSpec -> methodSpec.toBuilder()
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .build());
    }

    @Override
    public Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec() {
        return httpEndpointMethodSpecs
                .getNonRequestOptionsByteArrayMethodSpec()
                .map(methodSpec -> methodSpec.toBuilder()
                        .returns(wrapInRawHttpResponse(methodSpec.returnType))
                        .build());
    }

    @Override
    public Optional<MethodSpec> getInputStreamMethodSpec() {
        return httpEndpointMethodSpecs.getInputStreamMethodSpec().map(methodSpec -> methodSpec.toBuilder()
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .build());
    }

    @Override
    public Optional<MethodSpec> getInputStreamWithMediaTypeMethodSpec() {
        return httpEndpointMethodSpecs
                .getInputStreamWithMediaTypeMethodSpec()
                .map(methodSpec -> methodSpec.toBuilder()
                        .returns(wrapInRawHttpResponse(methodSpec.returnType))
                        .build());
    }

    @Override
    public Optional<MethodSpec> getInputStreamWithRequestOptionsMethodSpec() {
        return httpEndpointMethodSpecs
                .getInputStreamWithRequestOptionsMethodSpec()
                .map(methodSpec -> methodSpec.toBuilder()
                        .returns(wrapInRawHttpResponse(methodSpec.returnType))
                        .build());
    }

    @Override
    public Optional<MethodSpec> getInputStreamWithMediaTypeAndRequestOptionsMethodSpec() {
        return httpEndpointMethodSpecs
                .getInputStreamWithMediaTypeAndRequestOptionsMethodSpec()
                .map(methodSpec -> methodSpec.toBuilder()
                        .returns(wrapInRawHttpResponse(methodSpec.returnType))
                        .build());
    }

    private TypeName wrapInRawHttpResponse(TypeName rawTypeName) {
        if (rawTypeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) rawTypeName).rawType.equals(ClassName.get(CompletableFuture.class))) {
            TypeName typeArgument = Objects.requireNonNull(((ParameterizedTypeName) rawTypeName).typeArguments.get(0));
            return ParameterizedTypeName.get(
                    ClassName.get(CompletableFuture.class),
                    ParameterizedTypeName.get(rawHttpResponseClassName, typeArgument));
        }

        return ParameterizedTypeName.get(
                rawHttpResponseClassName,
                rawTypeName.isPrimitive() || rawTypeName.equals(TypeName.VOID) ? rawTypeName.box() : rawTypeName);
    }
}
