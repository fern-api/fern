package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;

public class SyncHttpEndpointMethodSpecsFactory implements HttpEndpointMethodSpecsFactory {
    @Override
    public HttpEndpointMethodSpecs create(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec noRequestBodyWithRequestOptionsMethodSpec,
            MethodSpec bodyOnlyMethodSpec,
            MethodSpec bodyOnlyWithRequestOptionsMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec,
            MethodSpec inputStreamMethodSpec,
            MethodSpec inputStreamWithMediaTypeMethodSpec,
            MethodSpec inputStreamWithRequestOptionsMethodSpec,
            MethodSpec inputStreamWithMediaTypeAndRequestOptionsMethodSpec) {
        return new DefaultHttpEndpointMethodSpecs(
                requestOptionsMethodSpec,
                nonRequestOptionsMethodSpec,
                noRequestBodyMethodSpec,
                noRequestBodyWithRequestOptionsMethodSpec,
                bodyOnlyMethodSpec,
                bodyOnlyWithRequestOptionsMethodSpec,
                byteArrayMethodSpec,
                nonRequestOptionsByteArrayMethodSpec,
                inputStreamMethodSpec,
                inputStreamWithMediaTypeMethodSpec,
                inputStreamWithRequestOptionsMethodSpec,
                inputStreamWithMediaTypeAndRequestOptionsMethodSpec);
    }
}
