package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.concurrent.CompletableFuture;

public class AsyncHttpEndpointMethodSpecsFactory implements HttpEndpointMethodSpecsFactory {
    @Override
    public HttpEndpointMethodSpecs create(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec) {
        return new HttpEndpointMethodSpecs(
                wrapReturnTypeInCompletableFuture(requestOptionsMethodSpec),
                wrapReturnTypeInCompletableFuture(nonRequestOptionsMethodSpec),
                wrapReturnTypeInCompletableFuture(noRequestBodyMethodSpec),
                wrapReturnTypeInCompletableFuture(byteArrayMethodSpec),
                wrapReturnTypeInCompletableFuture(nonRequestOptionsByteArrayMethodSpec));
    }

    private MethodSpec wrapReturnTypeInCompletableFuture(MethodSpec rawSpec) {
        if (rawSpec == null) {
            return null;
        }

        TypeName returnType = rawSpec.returnType;

        if (returnType.equals(TypeName.VOID) || returnType.isPrimitive()) {
            returnType = returnType.box();
        }

        return rawSpec.toBuilder()
                .returns(ParameterizedTypeName.get(ClassName.get(CompletableFuture.class), returnType))
                .build();
    }
}
