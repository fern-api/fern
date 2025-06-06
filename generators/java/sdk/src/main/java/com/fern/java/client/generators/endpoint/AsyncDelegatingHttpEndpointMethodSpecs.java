package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.HttpEndpoint;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import java.util.HashMap;
import java.util.Optional;

public final class AsyncDelegatingHttpEndpointMethodSpecs extends AbstractDelegatingHttpEndpointMethodSpecs {
    public AsyncDelegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs, String rawClientName, String bodyGetterName) {
        super(httpEndpointMethodSpecs, rawClientName, bodyGetterName);
    }

    @Override
    public HttpEndpoint getHttpEndpoint() {
        return httpEndpointMethodSpecs.getHttpEndpoint();
    }

    @Override
    public MethodSpec getNonRequestOptionsMethodSpec() {
        return createAsyncMethodSpec(httpEndpointMethodSpecs.getNonRequestOptionsMethodSpec());
    }

    @Override
    public MethodSpec getRequestOptionsMethodSpec() {
        return createAsyncMethodSpec(httpEndpointMethodSpecs.getRequestOptionsMethodSpec());
    }

    @Override
    public Optional<MethodSpec> getNoRequestBodyMethodSpec() {
        return httpEndpointMethodSpecs.getNoRequestBodyMethodSpec().map(this::createAsyncMethodSpec);
    }

    @Override
    public Optional<MethodSpec> getByteArrayMethodSpec() {
        return httpEndpointMethodSpecs.getByteArrayMethodSpec().map(this::createAsyncMethodSpec);
    }

    @Override
    public Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec() {
        return httpEndpointMethodSpecs.getNonRequestOptionsByteArrayMethodSpec().map(this::createAsyncMethodSpec);
    }

    private MethodSpec createAsyncMethodSpec(MethodSpec methodSpec) {
        return MethodSpec.methodBuilder(methodSpec.name)
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addStatement(
                        "return this.$L.$L" + paramString(methodSpec) + ".thenApply(response -> $L)",
                        rawClientName,
                        methodSpec.name,
                        getResponseMapper(methodSpec))
                .build();
    }

    private CodeBlock getResponseMapper(MethodSpec methodSpec) {
        return isHeadMethod()
                ? CodeBlock.of("new $T<>(response.headers())", HashMap.class)
                : CodeBlock.of("response.$L()", bodyGetterName);
    }
}
