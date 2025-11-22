package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;
import java.util.Optional;

public final class AsyncDelegatingHttpEndpointMethodSpecs extends AbstractDelegatingHttpEndpointMethodSpecs {
    public AsyncDelegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs, String rawClientName, String bodyGetterName) {
        super(httpEndpointMethodSpecs, rawClientName, bodyGetterName);
    }

    @Override
    public MethodSpec getNonRequestOptionsMethodSpec() {
        MethodSpec methodSpec = httpEndpointMethodSpecs.getNonRequestOptionsMethodSpec();
        return MethodSpec.methodBuilder(methodSpec.name)
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
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
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
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
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
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
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
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
                        .addJavadoc(methodSpec.javadoc)
                        .returns(methodSpec.returnType)
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
    public Optional<MethodSpec> getInputStreamMethodSpec() {
        return httpEndpointMethodSpecs.getInputStreamMethodSpec().map(methodSpec -> MethodSpec.methodBuilder(
                        methodSpec.name)
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
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
    public Optional<MethodSpec> getInputStreamWithMediaTypeMethodSpec() {
        return httpEndpointMethodSpecs
                .getInputStreamWithMediaTypeMethodSpec()
                .map(methodSpec -> MethodSpec.methodBuilder(methodSpec.name)
                        .addJavadoc(methodSpec.javadoc)
                        .returns(methodSpec.returnType)
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
    public Optional<MethodSpec> getInputStreamWithRequestOptionsMethodSpec() {
        return httpEndpointMethodSpecs
                .getInputStreamWithRequestOptionsMethodSpec()
                .map(methodSpec -> MethodSpec.methodBuilder(methodSpec.name)
                        .addJavadoc(methodSpec.javadoc)
                        .returns(methodSpec.returnType)
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
    public Optional<MethodSpec> getInputStreamWithMediaTypeAndRequestOptionsMethodSpec() {
        return httpEndpointMethodSpecs
                .getInputStreamWithMediaTypeAndRequestOptionsMethodSpec()
                .map(methodSpec -> MethodSpec.methodBuilder(methodSpec.name)
                        .addJavadoc(methodSpec.javadoc)
                        .returns(methodSpec.returnType)
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
