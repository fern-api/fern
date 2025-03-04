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
import com.fern.java.utils.ObjectMapperUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import okhttp3.Response;
import okhttp3.ResponseBody;

public final class SyncHttpResponseParserGenerator extends AbstractHttpResponseParserGenerator {

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
                httpResponseBuilder,
                clientGeneratorContext,
                httpEndpoint,
                apiErrorClassName,
                generatedObjectMapper,
                responseName,
                responseBodyName,
                responseBodyStringName,
                generatedErrors);
        httpResponseBuilder.endControlFlow();
        addGenericFailureCodeBlock(httpResponseBuilder, baseErrorClassName);
    }

    @Override
    public void handleSuccessfulResult(CodeBlock.Builder httpResponseBuilder, CodeBlock resultExpression) {
        httpResponseBuilder.addStatement("return $L", resultExpression);
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

    @Override
    public void addTryWithResourcesVariant(
            CodeBlock.Builder httpResponseBuilder,
            String responseName,
            String defaultedClientName,
            String okhttpRequestName,
            String responseBodyName) {
        httpResponseBuilder
                .beginControlFlow(
                        "try ($T $L = $N.newCall($L).execute())",
                        Response.class,
                        responseName,
                        defaultedClientName,
                        okhttpRequestName)
                .addStatement("$T $L = $N.body()", ResponseBody.class, responseBodyName, responseName)
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
                .addStatement(
                        "$T $L = $N.newCall($L).execute()",
                        Response.class,
                        responseName,
                        defaultedClientName,
                        okhttpRequestName)
                .addStatement("$T $L = $N.body()", ResponseBody.class, responseBodyName, responseName)
                .beginControlFlow("if ($L.isSuccessful())", responseName);
    }

    @Override
    public void addGenericFailureCodeBlock(CodeBlock.Builder httpResponseBuilder, ClassName baseErrorClassName) {
        httpResponseBuilder
                .beginControlFlow("catch ($T e)", IOException.class)
                .addStatement("throw new $T($S, e)", baseErrorClassName, "Network error executing HTTP request")
                .endControlFlow()
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
                            "throw new $T($L)",
                            errorClassName,
                            objectMapperUtils.readValueCall(
                                    CodeBlock.of("$L", responseBodyStringName), errorDeclaration.getType()));
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
                "throw new $T($S + $L.code(), $L.code(), $L)",
                apiErrorClassName,
                "Error with status code ",
                responseName,
                responseName,
                objectMapperUtils.readValueCall(CodeBlock.of("$L", responseBodyStringName), Optional.empty()));
    }

    @Override
    public CodeBlock getNextPageGetter(String endpointName, String methodParameters) {
        return CodeBlock.of("() -> $L($L)", endpointName, methodParameters);
    }
}
