package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.JsonResponseBodyWithProperty;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.ObjectMapperUtils;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

public final class AsyncHttpResponseParserGenerator extends AbstractHttpResponseParserGenerator {

    private static final String FUTURE = "future";

    @Override
    public void maybeInitializeFuture(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder.addStatement("$T $L = new $T<>()");
    }

    @Override
    public void addNoBodySuccessResponse(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder.addStatement("$L.complete(null)", FUTURE);
        httpResponseBuilder.addStatement("return");
    }

    @Override
    public void addNonPropertyNonPaginationSuccessResponse(
            CodeBlock.Builder httpResponseBuilder,
            MethodSpec.Builder endpointMethodBuilder,
            TypeName responseType,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedObjectMapper generatedObjectMapper,
            String responseBodyName,
            JsonResponseBodyWithProperty body) {
        ObjectMapperUtils objectMapperUtils = new ObjectMapperUtils(clientGeneratorContext, generatedObjectMapper);
        httpResponseBuilder.add("$L.complete(", FUTURE);
        httpResponseBuilder.add(objectMapperUtils.readValueCall(
                CodeBlock.of("$L.string()", responseBodyName), Optional.of(body.getResponseBodyType())));
        httpResponseBuilder.addStatement(")");
    }
}
