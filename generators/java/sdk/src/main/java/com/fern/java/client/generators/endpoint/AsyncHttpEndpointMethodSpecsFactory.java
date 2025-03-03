package com.fern.java.client.generators.endpoint;

import com.fern.java.utils.CompletableFutureUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
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

        return rawSpec.toBuilder()
                .returns(ParameterizedTypeName.get(
                        ClassName.get(CompletableFuture.class),
                        CompletableFutureUtils.wrapInCompletableFuture(rawSpec.returnType)))
                .build();
    }
}
