package com.fern.java.client.generators.endpoint;

import com.fern.java.utils.CompletableFutureUtils;
import com.squareup.javapoet.MethodSpec;

public class AsyncHttpEndpointMethodSpecsFactory implements HttpEndpointMethodSpecsFactory {
    @Override
    public HttpEndpointMethodSpecs create(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec,
            MethodSpec inputStreamMethodSpec,
            MethodSpec inputStreamWithMediaTypeMethodSpec,
            MethodSpec inputStreamWithRequestOptionsMethodSpec,
            MethodSpec inputStreamWithMediaTypeAndRequestOptionsMethodSpec) {
        return new DefaultHttpEndpointMethodSpecs(
                wrapReturnTypeInCompletableFuture(requestOptionsMethodSpec),
                wrapReturnTypeInCompletableFuture(nonRequestOptionsMethodSpec),
                wrapReturnTypeInCompletableFuture(noRequestBodyMethodSpec),
                wrapReturnTypeInCompletableFuture(byteArrayMethodSpec),
                wrapReturnTypeInCompletableFuture(nonRequestOptionsByteArrayMethodSpec),
                wrapReturnTypeInCompletableFuture(inputStreamMethodSpec),
                wrapReturnTypeInCompletableFuture(inputStreamWithMediaTypeMethodSpec),
                wrapReturnTypeInCompletableFuture(inputStreamWithRequestOptionsMethodSpec),
                wrapReturnTypeInCompletableFuture(inputStreamWithMediaTypeAndRequestOptionsMethodSpec));
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
