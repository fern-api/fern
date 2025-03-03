package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.JsonResponseBodyWithProperty;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.CompletableFutureUtils;
import com.fern.java.utils.ObjectMapperUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;

public final class AsyncHttpResponseParserGenerator extends AbstractHttpResponseParserGenerator {

    private static final String FUTURE = "future";

    @Override
    public void addEndpointWithoutRequestOptionsReturnStatement(
            MethodSpec.Builder endpointWithoutRequestOptionsBuilder,
            MethodSpec endpointWithRequestOptions,
            List<String> paramNames) {
        endpointWithoutRequestOptionsBuilder.addStatement(
                "return " + endpointWithRequestOptions.name + "(" + String.join(",", paramNames) + ")",
                endpointWithRequestOptions.name);
    }

    @Override
    public void addEndpointWithoutRequestReturnStatement(
            MethodSpec.Builder endpointWithoutRequestBuilder,
            MethodSpec endpointWithRequestOptions,
            List<String> paramNamesWoBody,
            ParameterSpec bodyParameterSpec) {
        endpointWithoutRequestBuilder.addStatement(
                "return " + endpointWithRequestOptions.name + "(" + String.join(",", paramNamesWoBody) + ")",
                bodyParameterSpec.type);
    }

    @Override
    public void addResponseHandlerCodeBlock(
            CodeBlock.Builder httpResponseBuilder,
            MethodSpec.Builder endpointMethodBuilder,
            ClientGeneratorContext clientGeneratorContext,
            HttpEndpoint httpEndpoint,
            GeneratedObjectMapper generatedObjectMapper,
            String responseBodyStringName,
            String responseBodyName,
            String parsedResponseVariableName,
            String responseName,
            String nextRequestVariableName,
            String startingAfterVariableName,
            String resultVariableName,
            String newPageNumberVariableName,
            String defaultedClientName,
            String okhttpRequestName,
            ClassName apiErrorClassName,
            ClassName baseErrorClassName,
            Map<ErrorId, GeneratedJavaFile> generatedErrors,
            Optional<ParameterSpec> maybeRequestParameterSpec,
            Function<TypeReference, Boolean> typeReferenceIsOptional) {
        beginResponseProcessingTryBlock(
                httpResponseBuilder,
                httpEndpoint,
                responseName,
                defaultedClientName,
                okhttpRequestName,
                responseBodyName);
        addSuccessResponseCodeBlock(
                httpResponseBuilder,
                endpointMethodBuilder,
                clientGeneratorContext,
                generatedObjectMapper,
                httpEndpoint,
                maybeRequestParameterSpec,
                responseName,
                defaultedClientName,
                okhttpRequestName,
                responseBodyName,
                parsedResponseVariableName,
                nextRequestVariableName,
                startingAfterVariableName,
                resultVariableName,
                newPageNumberVariableName,
                typeReferenceIsOptional);
        addMappedFailuresCodeBlock(
                httpResponseBuilder,
                clientGeneratorContext,
                httpEndpoint,
                apiErrorClassName,
                generatedObjectMapper,
                responseName,
                responseBodyName,
                responseBodyStringName,
                generatedErrors);
        addGenericFailureCodeBlock(httpResponseBuilder, baseErrorClassName);
    }

    @Override
    public void maybeInitializeFuture(CodeBlock.Builder httpResponseBuilder, TypeName responseType) {
        httpResponseBuilder.addStatement(
                "$T $L = new $T<>()",
                CompletableFutureUtils.wrapInCompletableFuture(responseType),
                FUTURE,
                CompletableFuture.class);
    }

    @Override
    public void addNoBodySuccessResponse(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder.addStatement("$L.complete(null)", FUTURE);
    }

    @Override
    public void addPropertySuccessResponse(
            CodeBlock.Builder httpResponseBuilder, String parsedResponseVariableName, CodeBlock snippetCodeBlock) {
        httpResponseBuilder.addStatement(CodeBlock.builder()
                .add("$L.complete($L)", parsedResponseVariableName)
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
                "$L.complete(new $T<>($L, $L, () -> $L($L)))",
                FUTURE,
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
        httpResponseBuilder.add("$L.complete(", FUTURE);
        httpResponseBuilder.add(objectMapperUtils.readValueCall(
                CodeBlock.of("$L.string()", responseBodyName), Optional.of(body.getResponseBodyType())));
        httpResponseBuilder.addStatement(")");
    }
}
