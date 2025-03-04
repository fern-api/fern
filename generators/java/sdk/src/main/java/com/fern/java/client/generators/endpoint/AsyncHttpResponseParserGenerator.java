package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.CompletableFutureUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.function.Consumer;
import java.util.function.Function;
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
    public CodeBlock getByteArrayEndpointBaseMethodBody(
            CodeBlock.Builder methodBodyBuilder,
            MethodSpec byteArrayBaseMethodSpec,
            ParameterSpec requestParameterSpec,
            MethodSpec endpointWithRequestOptions) {
        return methodBodyBuilder
                .add(
                        "return $L(new $T($L)",
                        endpointWithRequestOptions.name,
                        ByteArrayInputStream.class,
                        requestParameterSpec.name)
                .build();
    }

    @Override
    public void addResponseHandlerCodeBlock(
            CodeBlock.Builder httpResponseBuilder,
            MethodSpec.Builder endpointMethodBuilder,
            ClientGeneratorContext clientGeneratorContext,
            FieldSpec clientOptionsField,
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
        addResponseHandlingCode(
                httpResponseBuilder,
                baseErrorClassName,
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
                            clientOptionsField,
                            generatedObjectMapper,
                            httpEndpoint,
                            maybeRequestParameterSpec,
                            responseName,
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
    }

    @Override
    public void addResponseHandlingCode(
            CodeBlock.Builder httpResponseBuilder,
            ClassName baseErrorClassName,
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
        httpResponseBuilder
                .beginControlFlow("catch ($T e)", IOException.class)
                .addStatement(
                        "$L.completeExceptionally(new $T($S, e))",
                        FUTURE,
                        baseErrorClassName,
                        "Network error executing HTTP request")
                .endControlFlow()
                .build();
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
        httpResponseBuilder.addStatement("return $L", FUTURE);
    }

    @Override
    public void handleSuccessfulResult(CodeBlock.Builder httpResponseBuilder, CodeBlock resultExpression) {
        httpResponseBuilder.addStatement("$L.complete($L)", FUTURE, resultExpression);
        httpResponseBuilder.addStatement("return");
    }

    @Override
    public void handleExceptionalResult(CodeBlock.Builder httpResponseBuilder, CodeBlock resultExpression) {
        httpResponseBuilder.addStatement("$L.completeExceptionally($L)", FUTURE, resultExpression);
        httpResponseBuilder.addStatement("return");
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
    public void addNonTryWithResourcesVariant(
            CodeBlock.Builder httpResponseBuilder,
            String responseName,
            String defaultedClientName,
            String okhttpRequestName,
            String responseBodyName) {
        httpResponseBuilder
                .beginControlFlow("try")
                .addStatement("$T $L = $N.body()", ResponseBody.class, responseBodyName, responseName)
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
    public CodeBlock getNextPageGetter(String endpointName, String methodParameters) {
        return CodeBlock.builder()
                .add("() -> {\n")
                .indent()
                .beginControlFlow("try")
                .add("return $L($L).get();\n", endpointName, methodParameters)
                .endControlFlow()
                .beginControlFlow("catch ($T | $T e)", InterruptedException.class, ExecutionException.class)
                .add("throw new $T(e);\n", RuntimeException.class)
                .endControlFlow()
                .unindent()
                .add("}\n")
                .build();
    }
}
