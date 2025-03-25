package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;
import java.util.Optional;

public final class SyncDelegatingHttpEndpointMethodSpecs extends AbstractDelegatingHttpEndpointMethodSpecs {
    public SyncDelegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs, String rawClientName, String bodyGetterName) {
        super(httpEndpointMethodSpecs, rawClientName, bodyGetterName);
    }

    @Override
    public MethodSpec getNonRequestOptionsMethodSpec() {
        MethodSpec methodSpec = httpEndpointMethodSpecs.getNonRequestOptionsMethodSpec();
        return MethodSpec.methodBuilder(methodSpec.name)
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".$L()",
                        rawClientName,
                        methodSpec.name,
                        bodyGetterName)
                .build();
    }

    @Override
    public MethodSpec getRequestOptionsMethodSpec() {
        MethodSpec methodSpec = httpEndpointMethodSpecs.getRequestOptionsMethodSpec();
        return MethodSpec.methodBuilder(methodSpec.name)
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".$L()",
                        rawClientName,
                        methodSpec.name,
                        bodyGetterName)
                .build();
    }

    @Override
    public Optional<MethodSpec> getNoRequestBodyMethodSpec() {
        return httpEndpointMethodSpecs.getNoRequestBodyMethodSpec().map(methodSpec -> MethodSpec.methodBuilder(
                        methodSpec.name)
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".$L()",
                        rawClientName,
                        methodSpec.name,
                        bodyGetterName)
                .build());
    }

    @Override
    public Optional<MethodSpec> getByteArrayMethodSpec() {
        return httpEndpointMethodSpecs.getByteArrayMethodSpec().map(methodSpec -> MethodSpec.methodBuilder(
                        methodSpec.name)
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".$L()",
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
                        .addModifiers(methodSpec.modifiers)
                        .addParameters(methodSpec.parameters)
                        .addStatement(
                                "return this.$L.$L" + paramString(methodSpec) + ".$L()",
                                rawClientName,
                                methodSpec.name,
                                bodyGetterName)
                        .build());
    }
}
