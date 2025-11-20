package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;

public interface HttpEndpointMethodSpecsFactory {
    HttpEndpointMethodSpecs create(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec,
            MethodSpec inputStreamMethodSpec,
            MethodSpec inputStreamWithMediaTypeMethodSpec,
            MethodSpec inputStreamWithRequestOptionsMethodSpec,
            MethodSpec inputStreamWithMediaTypeAndRequestOptionsMethodSpec);
}
