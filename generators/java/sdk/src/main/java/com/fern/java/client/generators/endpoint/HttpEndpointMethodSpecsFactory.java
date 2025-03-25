package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;

public interface HttpEndpointMethodSpecsFactory {
    DefaultHttpEndpointMethodSpecs create(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec);
}
