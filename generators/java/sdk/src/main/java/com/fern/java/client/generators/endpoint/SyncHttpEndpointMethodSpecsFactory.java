package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;

public class SyncHttpEndpointMethodSpecsFactory implements HttpEndpointMethodSpecsFactory {
    @Override
    public DefaultHttpEndpointMethodSpecs create(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec) {
        return new DefaultHttpEndpointMethodSpecs(
                requestOptionsMethodSpec,
                nonRequestOptionsMethodSpec,
                noRequestBodyMethodSpec,
                byteArrayMethodSpec,
                nonRequestOptionsByteArrayMethodSpec);
    }
}
