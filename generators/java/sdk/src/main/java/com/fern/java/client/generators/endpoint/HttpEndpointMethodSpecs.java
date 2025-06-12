package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.HttpEndpoint;
import com.squareup.javapoet.MethodSpec;
import java.util.Optional;

public interface HttpEndpointMethodSpecs {
    HttpEndpoint getHttpEndpoint();

    MethodSpec getNonRequestOptionsMethodSpec();

    MethodSpec getRequestOptionsMethodSpec();

    Optional<MethodSpec> getNoRequestBodyMethodSpec();

    Optional<MethodSpec> getByteArrayMethodSpec();

    Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec();
}
