package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.HttpEndpoint;
import com.squareup.javapoet.MethodSpec;

public class SyncHttpEndpointMethodSpecsFactory implements HttpEndpointMethodSpecsFactory {

    private final HttpEndpoint httpEndpoint;

    public SyncHttpEndpointMethodSpecsFactory(HttpEndpoint httpEndpoint) {
        this.httpEndpoint = httpEndpoint;
    }

    @Override
    public HttpEndpointMethodSpecs create(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec) {
        return new DefaultHttpEndpointMethodSpecs(
                httpEndpoint,
                requestOptionsMethodSpec,
                nonRequestOptionsMethodSpec,
                noRequestBodyMethodSpec,
                byteArrayMethodSpec,
                nonRequestOptionsByteArrayMethodSpec);
    }
}
