package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;
import java.util.Optional;

public abstract class AbstractDelegatingHttpEndpointMethodSpecs implements HttpEndpointMethodSpecs {

    protected final HttpEndpointMethodSpecs httpEndpointMethodSpecs;
    protected final String rawClientName;
    protected final String bodyGetterName;

    public AbstractDelegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs, String rawClientName, String bodyGetterName) {
        this.httpEndpointMethodSpecs = httpEndpointMethodSpecs;
        this.rawClientName = rawClientName;
        this.bodyGetterName = bodyGetterName;
    }

    public abstract MethodSpec getNonRequestOptionsMethodSpec();

    public abstract MethodSpec getRequestOptionsMethodSpec();

    public abstract Optional<MethodSpec> getNoRequestBodyMethodSpec();

    public abstract Optional<MethodSpec> getByteArrayMethodSpec();

    public abstract Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec();
}
