package com.fern.java.client.generators.endpoint;

import com.fern.java.utils.CompletableFutureUtils;
import com.squareup.javapoet.MethodSpec;

public class AsyncHttpEndpointMethodSpecsFactory implements HttpEndpointMethodSpecsFactory {
    @Override
    public DefaultHttpEndpointMethodSpecs create(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec) {
        return new DefaultHttpEndpointMethodSpecs(
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
                .returns(CompletableFutureUtils.wrapInCompletableFuture(rawSpec.returnType))
                .build();
    }
}
