package com.fern.java.client.generators.endpoint;

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

public abstract class AbstractDelegatingHttpEndpointMethodSpecs implements HttpEndpointMethodSpecs {

    protected final HttpEndpointMethodSpecs httpEndpointMethodSpecs;
    protected final String rawClientName;
    protected final String bodyGetterName;
    protected final ClassName rawHttpResponseClassName;

    public AbstractDelegatingHttpEndpointMethodSpecs(
            HttpEndpointMethodSpecs httpEndpointMethodSpecs,
            String rawClientName,
            String bodyGetterName,
            ClassName rawHttpResponseTypeName) {
        this.httpEndpointMethodSpecs = httpEndpointMethodSpecs;
        this.rawClientName = rawClientName;
        this.bodyGetterName = bodyGetterName;
        this.rawHttpResponseClassName = rawHttpResponseTypeName;
    }

    public abstract MethodSpec getNonRequestOptionsMethodSpec();

    public abstract MethodSpec getRequestOptionsMethodSpec();

    public abstract Optional<MethodSpec> getNoRequestBodyMethodSpec();

    public abstract Optional<MethodSpec> getByteArrayMethodSpec();

    public abstract Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec();

    protected TypeName wrapInRawHttpResponse(TypeName rawTypeName) {
        if (rawTypeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) rawTypeName).rawType.equals(ClassName.get(CompletableFuture.class))) {
            TypeName typeArgument = Objects.requireNonNull(((ParameterizedTypeName) rawTypeName).typeArguments.get(0));
            return ParameterizedTypeName.get(
                    ClassName.get(CompletableFuture.class),
                    ParameterizedTypeName.get(rawHttpResponseClassName, typeArgument));
        }

        return ParameterizedTypeName.get(rawHttpResponseClassName, rawTypeName);
    }

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
