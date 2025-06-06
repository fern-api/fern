package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.HttpEndpoint;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import java.util.HashMap;
import java.util.Optional;

public final class SyncDelegatingHttpEndpointMethodSpecs extends AbstractDelegatingHttpEndpointMethodSpecs {
    public SyncDelegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs, String rawClientName, String bodyGetterName) {
        super(httpEndpointMethodSpecs, rawClientName, bodyGetterName);
    }

    @Override
    public HttpEndpoint getHttpEndpoint() {
        return httpEndpointMethodSpecs.getHttpEndpoint();
    }

    @Override
    public MethodSpec getNonRequestOptionsMethodSpec() {
        return createSyncMethodSpec(httpEndpointMethodSpecs.getNonRequestOptionsMethodSpec());
    }

    @Override
    public MethodSpec getRequestOptionsMethodSpec() {
        return createSyncMethodSpec(httpEndpointMethodSpecs.getRequestOptionsMethodSpec());
    }

    @Override
    public Optional<MethodSpec> getNoRequestBodyMethodSpec() {
        return httpEndpointMethodSpecs.getNoRequestBodyMethodSpec().map(this::createSyncMethodSpec);
    }

    @Override
    public Optional<MethodSpec> getByteArrayMethodSpec() {
        return httpEndpointMethodSpecs.getByteArrayMethodSpec().map(this::createSyncMethodSpec);
    }

    @Override
    public Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec() {
        return httpEndpointMethodSpecs.getNonRequestOptionsByteArrayMethodSpec().map(this::createSyncMethodSpec);
    }

    private MethodSpec createSyncMethodSpec(MethodSpec methodSpec) {
        return MethodSpec.methodBuilder(methodSpec.name)
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addCode(returnCodeBlock(methodSpec.returnType, methodSpec))
                .build();
    }

    private CodeBlock returnCodeBlock(TypeName returnType, MethodSpec methodSpec) {
        CodeBlock responseCall = CodeBlock.of("this.$L.$L" + paramString(methodSpec), rawClientName, methodSpec.name);
        CodeBlock fullExpression = CodeBlock.builder()
                .add(getResponseMapper(methodSpec, responseCall))
                .build();

        return returnType.equals(TypeName.VOID)
                ? CodeBlock.of("$L;", fullExpression)
                : CodeBlock.of("return $L;", fullExpression);
    }

    private CodeBlock getResponseMapper(MethodSpec methodSpec, CodeBlock responseCall) {
        return isHeadMethod()
                ? CodeBlock.of("new $T<>($L.headers())", HashMap.class, responseCall)
                : CodeBlock.of("$L.$L()", responseCall, bodyGetterName);
    }
}
