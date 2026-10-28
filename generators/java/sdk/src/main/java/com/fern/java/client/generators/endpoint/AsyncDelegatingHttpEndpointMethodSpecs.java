package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

public final class AsyncDelegatingHttpEndpointMethodSpecs extends AbstractDelegatingHttpEndpointMethodSpecs {
    private static final String RAW_FUTURE = "rawFuture";
    private static final String FUTURE = "future";

    private final ClassName rawHttpResponseClassName;

    public AsyncDelegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs,
            String rawClientName,
            String bodyGetterName,
            ClassName rawHttpResponseClassName) {
        super(httpEndpointMethodSpecs, rawClientName, bodyGetterName);
        this.rawHttpResponseClassName = rawHttpResponseClassName;
    }

    private CodeBlock delegatingBody(MethodSpec methodSpec) {
        TypeName bodyType = ((ParameterizedTypeName) methodSpec.returnType).typeArguments.get(0);
        TypeName rawFutureType = ParameterizedTypeName.get(
                ClassName.get(CompletableFuture.class), ParameterizedTypeName.get(rawHttpResponseClassName, bodyType));
        return CodeBlock.builder()
                .addStatement(
                        "$T $L = this.$L.$L" + paramString(methodSpec),
                        rawFutureType,
                        RAW_FUTURE,
                        rawClientName,
                        methodSpec.name)
                .addStatement(
                        "$T $L = $L.thenApply(response -> response.$L())",
                        methodSpec.returnType,
                        FUTURE,
                        RAW_FUTURE,
                        bodyGetterName)
                .add("$L.whenComplete((result_, throwable_) -> {\n", FUTURE)
                .indent()
                .beginControlFlow("if ($L.isCancelled())", FUTURE)
                .addStatement("$L.cancel(true)", RAW_FUTURE)
                .endControlFlow()
                .unindent()
                .addStatement("})")
                .addStatement("return $L", FUTURE)
                .build();
    }

    @Override
    public MethodSpec getNonRequestOptionsMethodSpec() {
        MethodSpec methodSpec = httpEndpointMethodSpecs.getNonRequestOptionsMethodSpec();
        return MethodSpec.methodBuilder(methodSpec.name)
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addCode(delegatingBody(methodSpec))
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
                .addCode(delegatingBody(methodSpec))
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
                .addCode(delegatingBody(methodSpec))
                .build());
    }

    @Override
    public Optional<MethodSpec> getNoRequestBodyWithRequestOptionsMethodSpec() {
        return httpEndpointMethodSpecs
                .getNoRequestBodyWithRequestOptionsMethodSpec()
                .map(methodSpec -> MethodSpec.methodBuilder(methodSpec.name)
                        .addJavadoc(methodSpec.javadoc)
                        .returns(methodSpec.returnType)
                        .addModifiers(methodSpec.modifiers)
                        .addParameters(methodSpec.parameters)
                        .addCode(delegatingBody(methodSpec))
                        .build());
    }

    @Override
    public Optional<MethodSpec> getBodyOnlyMethodSpec() {
        return httpEndpointMethodSpecs.getBodyOnlyMethodSpec().map(methodSpec -> MethodSpec.methodBuilder(
                        methodSpec.name)
                .addJavadoc(methodSpec.javadoc)
                .returns(methodSpec.returnType)
                .addModifiers(methodSpec.modifiers)
                .addParameters(methodSpec.parameters)
                .addCode(delegatingBody(methodSpec))
                .build());
    }

    @Override
    public Optional<MethodSpec> getBodyOnlyWithRequestOptionsMethodSpec() {
        return httpEndpointMethodSpecs
                .getBodyOnlyWithRequestOptionsMethodSpec()
                .map(methodSpec -> MethodSpec.methodBuilder(methodSpec.name)
                        .addJavadoc(methodSpec.javadoc)
                        .returns(methodSpec.returnType)
                        .addModifiers(methodSpec.modifiers)
                        .addParameters(methodSpec.parameters)
                        .addCode(delegatingBody(methodSpec))
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
                .addCode(delegatingBody(methodSpec))
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
                        .addCode(delegatingBody(methodSpec))
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
                .addCode(delegatingBody(methodSpec))
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
                        .addCode(delegatingBody(methodSpec))
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
                        .addCode(delegatingBody(methodSpec))
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
                        .addCode(delegatingBody(methodSpec))
                        .build());
    }
}
