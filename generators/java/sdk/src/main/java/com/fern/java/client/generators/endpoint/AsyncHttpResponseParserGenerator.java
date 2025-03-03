package com.fern.java.client.generators.endpoint;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.errors.ErrorDeclaration;
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
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.jetbrains.annotations.NotNull;

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
        writeOkhttpCallback(
                httpResponseBuilder,
                defaultedClientName,
                okhttpRequestName,
                responseName,
                builder -> {
                    beginResponseProcessingTryBlock(
                            builder,
                            httpEndpoint,
                            responseName,
                            defaultedClientName,
                            okhttpRequestName,
                            responseBodyName);
                    addSuccessResponseCodeBlock(
                            builder,
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
                    httpResponseBuilder.endControlFlow();
                    addMappedFailuresCodeBlock(
                            builder,
                            clientGeneratorContext,
                            httpEndpoint,
                            apiErrorClassName,
                            generatedObjectMapper,
                            responseName,
                            responseBodyName,
                            responseBodyStringName,
                            generatedErrors);
                    httpResponseBuilder.endControlFlow();
                },
                builder -> {
                    addGenericFailureCodeBlock(builder, baseErrorClassName);
                });
        httpResponseBuilder.addStatement("return $L", FUTURE);
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
        httpResponseBuilder.addStatement("return");
    }

    @Override
    public void addPropertySuccessResponse(
            CodeBlock.Builder httpResponseBuilder, String parsedResponseVariableName, CodeBlock snippetCodeBlock) {
        httpResponseBuilder.addStatement(CodeBlock.builder()
                .add("$L.complete($L)", parsedResponseVariableName)
                .add(snippetCodeBlock)
                .build());
        httpResponseBuilder.addStatement("return");
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
        httpResponseBuilder.addStatement("return");
    }

    @Override
    public void addTryWithResourcesVariant(
            CodeBlock.Builder httpResponseBuilder,
            String responseName,
            String defaultedClientName,
            String okhttpRequestName,
            String responseBodyName) {
        httpResponseBuilder
                .beginControlFlow("try ($T $L = $N.body())", ResponseBody.class, responseBodyName, responseName)
                .beginControlFlow("if ($L.isSuccessful())", responseName);
    }

    @Override
    public void addGenericFailureCodeBlock(CodeBlock.Builder httpResponseBuilder, ClassName baseErrorClassName) {
        httpResponseBuilder
                .addStatement(
                        "$L.completeExceptionally(new $T($S, e))",
                        FUTURE,
                        baseErrorClassName,
                        "Network error executing HTTP request")
                .build();
    }

    @Override
    public void addMappedFailuresCodeBlock(
            CodeBlock.Builder httpResponseBuilder,
            ClientGeneratorContext clientGeneratorContext,
            HttpEndpoint httpEndpoint,
            ClassName apiErrorClassName,
            GeneratedObjectMapper generatedObjectMapper,
            String responseName,
            String responseBodyName,
            String responseBodyStringName,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        ObjectMapperUtils objectMapperUtils = new ObjectMapperUtils(clientGeneratorContext, generatedObjectMapper);
        httpResponseBuilder.addStatement(
                "$T $L = $L != null ? $L.string() : $S",
                String.class,
                responseBodyStringName,
                responseBodyName,
                responseBodyName,
                "{}");

        // map to status-specific errors
        if (clientGeneratorContext.getIr().getErrorDiscriminationStrategy().isStatusCode()) {
            List<ErrorDeclaration> errorDeclarations = httpEndpoint.getErrors().get().stream()
                    .map(responseError -> clientGeneratorContext
                            .getIr()
                            .getErrors()
                            .get(responseError.getError().getErrorId()))
                    .sorted(Comparator.comparingInt(ErrorDeclaration::getStatusCode))
                    .collect(Collectors.toList());
            if (!errorDeclarations.isEmpty()) {
                boolean multipleErrors = errorDeclarations.size() > 1;
                httpResponseBuilder.beginControlFlow("try");
                if (multipleErrors) {
                    httpResponseBuilder.beginControlFlow("switch ($L.code())", responseName);
                }
                errorDeclarations.forEach(errorDeclaration -> {
                    GeneratedJavaFile generatedError =
                            generatedErrors.get(errorDeclaration.getName().getErrorId());
                    ClassName errorClassName = generatedError.getClassName();
                    if (multipleErrors) {
                        httpResponseBuilder.add("case $L:", errorDeclaration.getStatusCode());
                    } else {
                        httpResponseBuilder.beginControlFlow(
                                "if ($L.code() == $L)", responseName, errorDeclaration.getStatusCode());
                    }
                    httpResponseBuilder.addStatement(
                            "$N.completeExceptionally(new $T($L))",
                            FUTURE,
                            errorClassName,
                            objectMapperUtils.readValueCall(
                                    CodeBlock.of("$L", responseBodyStringName), errorDeclaration.getType()));
                    httpResponseBuilder.addStatement("return");
                    if (!multipleErrors) {
                        httpResponseBuilder.endControlFlow();
                    }
                });
                if (multipleErrors) {
                    httpResponseBuilder.endControlFlow();
                }
                httpResponseBuilder
                        .endControlFlow()
                        .beginControlFlow("catch ($T ignored)", JsonProcessingException.class)
                        .add("// unable to map error response, throwing generic error\n")
                        .endControlFlow();
            }
        }
        httpResponseBuilder.addStatement(
                "$N.completeExceptionally(new $T($S + $L.code(), $L.code(), $L))",
                FUTURE,
                apiErrorClassName,
                "Error with status code ",
                responseName,
                responseName,
                objectMapperUtils.readValueCall(CodeBlock.of("$L", responseBodyStringName), Optional.empty()));
    }

    private void writeOkhttpCallback(
            CodeBlock.Builder httpResponseBuilder,
            String defaultedClientName,
            String okhttpRequestName,
            String responseName,
            Consumer<CodeBlock.Builder> onResponseWriter,
            Consumer<CodeBlock.Builder> onFailureWriter) {
        httpResponseBuilder.add(
                "$N.newCall($L).enqueue(new $T() {\n", defaultedClientName, okhttpRequestName, Callback.class);
        httpResponseBuilder.indent();

        httpResponseBuilder.add("@$T\n", Override.class);
        httpResponseBuilder.add(
                "public void onResponse(@$T $T $N, @$T $T $N) throws $T {\n",
                NotNull.class,
                Call.class,
                "call",
                NotNull.class,
                Response.class,
                responseName,
                IOException.class);
        httpResponseBuilder.indent();
        onResponseWriter.accept(httpResponseBuilder);
        httpResponseBuilder.unindent();
        httpResponseBuilder.add("}\n");
        httpResponseBuilder.add("\n");

        httpResponseBuilder.add("@$T\n", Override.class);
        httpResponseBuilder.add(
                "public void onFailure(@$T $T $N, @$T $T $N) {\n",
                NotNull.class,
                Call.class,
                "call",
                NotNull.class,
                IOException.class,
                "e");
        httpResponseBuilder.indent();
        onFailureWriter.accept(httpResponseBuilder);
        httpResponseBuilder.unindent();
        httpResponseBuilder.add("}\n");

        httpResponseBuilder.unindent();
        httpResponseBuilder.addStatement("})");
    }
}
