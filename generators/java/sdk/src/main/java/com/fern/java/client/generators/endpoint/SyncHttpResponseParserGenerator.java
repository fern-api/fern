package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.JsonResponseBodyWithProperty;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.ObjectMapperUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import java.util.Optional;

public final class SyncHttpResponseParserGenerator extends AbstractHttpResponseParserGenerator {

    @Override
    public void maybeInitializeFuture(CodeBlock.Builder httpResponseBuilder, TypeName responseType) {
        // Do nothing
    }

    @Override
    public void addNoBodySuccessResponse(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder.addStatement("return");
    }

    @Override
    public void addPropertySuccessResponse(
            CodeBlock.Builder httpResponseBuilder, String parsedResponseVariableName, CodeBlock snippetCodeBlock) {
        httpResponseBuilder.addStatement(CodeBlock.builder()
                .add("return $L", parsedResponseVariableName)
                .add(snippetCodeBlock)
                .build());
    }

    @Override
    public void addCursorPaginationResponse(
            CodeBlock.Builder httpResponseBuilder,
            ClassName pagerClassName,
            CodeBlock hasNextPageBlock,
            String resultVariableName,
            String endpointName,
            String methodParameters) {
        httpResponseBuilder.addStatement(
                "return new $T<>($L, $L, () -> $L($L))",
                pagerClassName,
                hasNextPageBlock,
                resultVariableName,
                endpointName,
                methodParameters);
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
        httpResponseBuilder.add("return ");
        httpResponseBuilder.addStatement(objectMapperUtils.readValueCall(
                CodeBlock.of("$L.string()", responseBodyName), Optional.of(body.getResponseBodyType())));
    }
}
