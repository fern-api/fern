package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import java.util.Optional;

public final class AsyncDelegatingHttpEndpointMethodSpecs extends AbstractDelegatingHttpEndpointMethodSpecs {
    public AsyncDelegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs,
            String rawClientName,
            String bodyGetterName,
            ClassName rawHttpResponseClassName) {
        super(httpEndpointMethodSpecs, rawClientName, bodyGetterName, rawHttpResponseClassName);
    }

    @Override
    public MethodSpec getNonRequestOptionsMethodSpec() {
        MethodSpec methodSpec = httpEndpointMethodSpecs.getNonRequestOptionsMethodSpec();
        return MethodSpec.methodBuilder(methodSpec.name)
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".thenApply(response -> response.$L())",
                        rawClientName,
                        methodSpec.name,
                        bodyGetterName)
                .build();
    }

    @Override
    public MethodSpec getRequestOptionsMethodSpec() {
        MethodSpec methodSpec = httpEndpointMethodSpecs.getRequestOptionsMethodSpec();
        return MethodSpec.methodBuilder(methodSpec.name)
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".thenApply(response -> response.$L())",
                        rawClientName,
                        methodSpec.name,
                        bodyGetterName)
                .build();
    }

    @Override
    public Optional<MethodSpec> getNoRequestBodyMethodSpec() {
        return httpEndpointMethodSpecs.getNoRequestBodyMethodSpec().map(methodSpec -> MethodSpec.methodBuilder(
                        methodSpec.name)
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".thenApply(response -> response.$L())",
                        rawClientName,
                        methodSpec.name,
                        bodyGetterName)
                .build());
    }

    @Override
    public Optional<MethodSpec> getByteArrayMethodSpec() {
        return httpEndpointMethodSpecs.getByteArrayMethodSpec().map(methodSpec -> MethodSpec.methodBuilder(
                        methodSpec.name)
                .returns(wrapInRawHttpResponse(methodSpec.returnType))
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".thenApply(response -> response.$L())",
                        rawClientName,
                        methodSpec.name,
                        bodyGetterName)
                .build());
    }

    @Override
    public Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec() {
        return httpEndpointMethodSpecs
                .getNonRequestOptionsByteArrayMethodSpec()
                .map(methodSpec -> MethodSpec.methodBuilder(methodSpec.name)
                        .returns(wrapInRawHttpResponse(methodSpec.returnType))
                        .addModifiers(methodSpec.modifiers)
                        .addParameters(methodSpec.parameters)
                        .addStatement(
                                "return this.$L.$L" + paramString(methodSpec) + ".thenApply(response -> response.$L())",
                                rawClientName,
                                methodSpec.name,
                                bodyGetterName)
                        .build());
    }
}
