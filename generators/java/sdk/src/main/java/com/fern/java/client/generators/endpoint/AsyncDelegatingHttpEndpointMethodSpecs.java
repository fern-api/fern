package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.Objects;
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
                        .addModifiers(methodSpec.modifiers)
                        .addParameters(methodSpec.parameters)
                        .addStatement(
                                "return this.$L.$L" + paramString(methodSpec) + ".thenApply(response -> response.$L())",
                                rawClientName,
                                methodSpec.name,
                                bodyGetterName)
                        .build());
    }

    private static String paramString(MethodSpec spec) {
        StringBuilder argString = new StringBuilder("(");
        for (int i = 0; i < spec.parameters.size(); i++) {
            if (i > 0) {
                argString.append(", ");
            }
            ParameterSpec param = Objects.requireNonNull(spec.parameters.get(i));
            argString.append(param.name);
        }
        argString.append(")");
        return argString.toString();
    }
}
