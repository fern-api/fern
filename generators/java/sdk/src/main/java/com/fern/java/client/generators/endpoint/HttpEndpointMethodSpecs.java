package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;
import java.util.Optional;

public interface HttpEndpointMethodSpecs {
    MethodSpec getNonRequestOptionsMethodSpec();

    MethodSpec getRequestOptionsMethodSpec();

    Optional<MethodSpec> getNoRequestBodyMethodSpec();

    Optional<MethodSpec> getByteArrayMethodSpec();

    Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec();

    Optional<MethodSpec> getInputStreamMethodSpec();

    Optional<MethodSpec> getInputStreamWithMediaTypeMethodSpec();

    Optional<MethodSpec> getInputStreamWithRequestOptionsMethodSpec();

    Optional<MethodSpec> getInputStreamWithMediaTypeAndRequestOptionsMethodSpec();
}
