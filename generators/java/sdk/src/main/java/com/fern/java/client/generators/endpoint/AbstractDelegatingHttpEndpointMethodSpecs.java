package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.Objects;
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

    public abstract Optional<MethodSpec> getInputStreamMethodSpec();

    public abstract Optional<MethodSpec> getInputStreamWithMediaTypeMethodSpec();

    public abstract Optional<MethodSpec> getInputStreamWithRequestOptionsMethodSpec();

    public abstract Optional<MethodSpec> getInputStreamWithMediaTypeAndRequestOptionsMethodSpec();

    protected static String paramString(MethodSpec spec) {
        StringBuilder argString = new StringBuilder("(");
        for (int i = 0; i < spec.parameters.size(); i++) {
            if (i > 0) {
                argString.append(", ");
            }
            ParameterSpec param = Objects.requireNonNull(spec.parameters.get(i));
            argString.append(param.name);
        }
        argString.append(")");
        return argString.toString();
    }
}
