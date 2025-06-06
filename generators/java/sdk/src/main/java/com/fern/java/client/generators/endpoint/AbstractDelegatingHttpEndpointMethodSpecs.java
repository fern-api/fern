package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpMethod;
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

    public abstract HttpEndpoint getHttpEndpoint();

    public abstract MethodSpec getNonRequestOptionsMethodSpec();

    public abstract MethodSpec getRequestOptionsMethodSpec();

    public abstract Optional<MethodSpec> getNoRequestBodyMethodSpec();

    public abstract Optional<MethodSpec> getByteArrayMethodSpec();

    public abstract Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec();

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

    protected boolean isHeadMethod() {
        return getHttpEndpoint().getMethod().equals(HttpMethod.HEAD);
    }
}
