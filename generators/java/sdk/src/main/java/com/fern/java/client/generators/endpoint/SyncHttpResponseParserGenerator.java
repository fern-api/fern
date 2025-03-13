package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedObjectMapper;
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
import java.util.function.Consumer;
import okhttp3.Response;
import okhttp3.ResponseBody;

public final class SyncHttpResponseParserGenerator extends AbstractHttpResponseParserGenerator {

    public SyncHttpResponseParserGenerator(
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
                endpointWithRequestOptions.returnType.equals(TypeName.VOID)
                        ? endpointWithRequestOptions.name + "(" + String.join(",", paramNames) + ")"
                        : "return " + endpointWithRequestOptions.name + "(" + String.join(",", paramNames) + ")",
                endpointWithRequestOptions.name);
    }

    @Override
    public void addEndpointWithoutRequestReturnStatement(
            MethodSpec.Builder endpointWithoutRequestBuilder,
            MethodSpec endpointWithRequestOptions,
            List<String> paramNamesWoBody,
            ParameterSpec bodyParameterSpec) {
        endpointWithoutRequestBuilder.addStatement(
                endpointWithRequestOptions.returnType.equals(TypeName.VOID)
                        ? endpointWithRequestOptions.name + "(" + String.join(",", paramNamesWoBody) + ")"
                        : "return " + endpointWithRequestOptions.name + "(" + String.join(",", paramNamesWoBody) + ")",
                bodyParameterSpec.type);
    }

    @Override
    public CodeBlock getByteArrayEndpointBaseMethodBody(
            CodeBlock.Builder methodBodyBuilder,
            MethodSpec byteArrayBaseMethodSpec,
            ParameterSpec requestParameterSpec,
            MethodSpec endpointWithRequestOptions) {
        if (!byteArrayBaseMethodSpec.returnType.equals(TypeName.VOID)) {
            methodBodyBuilder.add("return ");
        }
        return methodBodyBuilder
                .add(
                        "$L(new $T($L)",
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
        onResponseWriter.accept(httpResponseBuilder);
        onFailureWriter.accept(httpResponseBuilder);
    }

    @Override
    public void handleSuccessfulResult(CodeBlock.Builder httpResponseBuilder, CodeBlock resultExpression) {
        httpResponseBuilder.addStatement("return $L", resultExpression);
    }

    @Override
    public void handleExceptionalResult(CodeBlock.Builder httpResponseBuilder, CodeBlock resultExpression) {
        httpResponseBuilder.addStatement("throw $L", resultExpression);
    }

    @Override
    public void maybeInitializeFuture(CodeBlock.Builder httpResponseBuilder, TypeName responseType) {
        // Do nothing
    }

    @Override
    public void addNoBodySuccessResponse(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder.addStatement("return");
    }

    @Override
    public void addTryWithResourcesVariant(CodeBlock.Builder httpResponseBuilder) {
        httpResponseBuilder
                .beginControlFlow(
                        "try ($T $L = $N.newCall($L).execute())",
                        Response.class,
                        variables.getResponseName(),
                        variables.getDefaultedClientName(),
                        variables.getOkhttpRequestName())
                .addStatement(
                        "$T $L = $N.body()",
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
                        "$T $L = $N.newCall($L).execute()",
                        Response.class,
                        variables.getResponseName(),
                        variables.getDefaultedClientName(),
                        variables.getOkhttpRequestName())
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
                .beginControlFlow("catch ($T e)", IOException.class)
                .addStatement("throw new $T($S, e)", baseErrorClassName, "Network error executing HTTP request")
                .endControlFlow()
                .build();
    }

    @Override
    public CodeBlock getNextPageGetter(String endpointName, String methodParameters) {
        return CodeBlock.of("() -> $L($L)", endpointName, methodParameters);
    }
}
