package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.function.Consumer;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.jetbrains.annotations.NotNull;

public final class AsyncHttpResponseParserGenerator extends AbstractHttpResponseParserGenerator {

    private static final String FUTURE = "future";

    public AsyncHttpResponseParserGenerator(
            AbstractEndpointWriterVariableNameContext variables,
            ClientGeneratorContext clientGeneratorContext,
            HttpEndpoint httpEndpoint,
            ClassName apiErrorClassName,
            ClassName baseErrorClassName,
            GeneratedClientOptions generatedClientOptions,
            GeneratedObjectMapper generatedObjectMapper,
            FieldSpec clientOptionsField,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        super(
                variables,
                clientGeneratorContext,
                httpEndpoint,
                apiErrorClassName,
                baseErrorClassName,
                generatedClientOptions,
                generatedObjectMapper,
                clientOptionsField,
                generatedErrors);
    }

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
    public void addResponseHandlingCode(
            CodeBlock.Builder httpResponseBuilder,
            Consumer<CodeBlock.Builder> onResponseWriter,
            Consumer<CodeBlock.Builder> onFailureWriter) {
        httpResponseBuilder.add(
                "$N.newCall($L).enqueue(new $T() {\n",
                variables.getDefaultedClientName(),
                variables.getOkhttpRequestName(),
                Callback.class);
        httpResponseBuilder.indent();

        httpResponseBuilder.add("@$T\n", Override.class);
        httpResponseBuilder.add(
                "public void onResponse(@$T $T $N, @$T $T $N) throws $T {\n",
                NotNull.class,
                Call.class,
                "call",
                NotNull.class,
                Response.class,
                variables.getResponseName(),
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
    public void addTryWithResourcesVariant(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder
                .beginControlFlow(
                        "try ($T $L = $N.body())",
                        ResponseBody.class,
                        variables.getResponseBodyName(),
                        variables.getResponseName())
                .beginControlFlow("if ($L.isSuccessful())", variables.getResponseName());
    }

    @Override
    public void addNonTryWithResourcesVariant(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder
                .beginControlFlow("try")
                .addStatement(
                        "$T $L = $N.body()",
                        ResponseBody.class,
                        variables.getResponseBodyName(),
                        variables.getResponseName())
                .beginControlFlow("if ($L.isSuccessful())", variables.getResponseName());
    }

    @Override
    public void addGenericFailureCodeBlock(CodeBlock.Builder httpResponseBuilder) {
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
