/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.fern.java.client.generators;

import com.fern.ir.model.auth.ApiAuth;
import com.fern.ir.model.auth.AuthSchemesRequirement;
import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedEndpointRequest;
import com.fern.java.client.GeneratedJerseyServiceInterface;
import com.fern.java.client.GeneratedServiceClient;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class HttpServiceClientGenerator extends AbstractFileGenerator {

    private static final String SERVICE_FIELD_NAME = "service";
    private static final String AUTH_FIELD_NAME = "auth";
    private static final String REQUEST_PARAMETER_NAME = "request";

    private final HttpService httpService;
    private final Optional<GeneratedAuthFiles> maybeAuth;
    private final Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors;
    private final ClientGeneratorContext clientGeneratorContext;
    private final GeneratedJavaFile objectMapper;
    private final boolean atleastOneEndpointHasAuth;

    public HttpServiceClientGenerator(
            ClientGeneratorContext clientGeneratorContext,
            HttpService httpService,
            Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors,
            Optional<GeneratedAuthFiles> maybeAuth,
            GeneratedJavaFile objectMapper) {
        super(
                clientGeneratorContext.getPoetClassNameFactory().getServiceClientClassname(httpService),
                clientGeneratorContext);
        this.httpService = httpService;
        this.generatedErrors = generatedErrors;
        this.clientGeneratorContext = clientGeneratorContext;
        this.maybeAuth = maybeAuth;
        this.atleastOneEndpointHasAuth = httpService.getEndpoints().stream().anyMatch(HttpEndpoint::getAuth);
        this.objectMapper = objectMapper;
    }

    @Override
    public GeneratedServiceClient generateFile() {
        JerseyServiceInterfaceGenerator jerseyServiceInterfaceGenerator = new JerseyServiceInterfaceGenerator(
                clientGeneratorContext, generatedErrors, maybeAuth, httpService, objectMapper);
        GeneratedJerseyServiceInterface jerseyServiceInterfaceOutput = jerseyServiceInterfaceGenerator.generateFile();
        TypeSpec.Builder serviceClientBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(
                                jerseyServiceInterfaceOutput.getClassName(),
                                SERVICE_FIELD_NAME,
                                Modifier.PRIVATE,
                                Modifier.FINAL)
                        .build())
                .addMethod(getUrlConstructor(jerseyServiceInterfaceOutput));
        if (maybeAuth.isPresent() && atleastOneEndpointHasAuth) {
            serviceClientBuilder.addField(FieldSpec.builder(
                            ParameterizedTypeName.get(
                                    ClassName.get(Optional.class),
                                    maybeAuth.get().getClassName()),
                            AUTH_FIELD_NAME,
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build());
            MethodSpec urlAuthConstructor = getUrlAuthConstructor(jerseyServiceInterfaceOutput, maybeAuth.get());
            serviceClientBuilder.addMethod(urlAuthConstructor);
        }

        List<GeneratedEndpointRequest> generatedEndpointRequests = new ArrayList<>();
        for (HttpEndpoint httpEndpoint : httpService.getEndpoints()) {
            MethodSpec endpointInterfaceMethod =
                    jerseyServiceInterfaceOutput.endpointMethods().get(httpEndpoint.getId());
            Optional<GeneratedEndpointRequest> wrappedRequestFile =
                    getWrappedRequest(httpEndpoint, endpointInterfaceMethod);
            MethodSpec.Builder endpointMethodBuilder =
                    MethodSpec.methodBuilder(httpEndpoint.getId().get()).addModifiers(Modifier.PUBLIC);

            if (wrappedRequestFile.isPresent()) {
                generateCallWithWrappedRequest(
                        httpEndpoint, endpointInterfaceMethod, wrappedRequestFile.get(), endpointMethodBuilder);
                generatedEndpointRequests.add(wrappedRequestFile.get());
            } else {
                generateCallWithoutRequest(endpointMethodBuilder, endpointInterfaceMethod);
            }

            endpointMethodBuilder.addExceptions(endpointInterfaceMethod.exceptions);
            endpointMethodBuilder.returns(endpointInterfaceMethod.returnType);
            serviceClientBuilder.addMethod(endpointMethodBuilder.build());
        }

        TypeSpec serviceClientTypeSpec = serviceClientBuilder.build();
        JavaFile serviceClientJavaFile =
                JavaFile.builder(className.packageName(), serviceClientTypeSpec).build();

        return GeneratedServiceClient.builder()
                .className(className)
                .javaFile(serviceClientJavaFile)
                .httpService(httpService)
                .jerseyServiceInterfaceOutput(jerseyServiceInterfaceOutput)
                .addAllGeneratedEndpointRequestOutputs(generatedEndpointRequests)
                .build();
    }

    private MethodSpec getUrlConstructor(GeneratedJerseyServiceInterface jerseyServiceInterfaceOutput) {
        MethodSpec.Builder constructorBuilder =
                MethodSpec.constructorBuilder().addModifiers(Modifier.PUBLIC).addParameter(String.class, "url");
        constructorBuilder.addStatement(
                "this.$L = $T.$L($L)",
                SERVICE_FIELD_NAME,
                jerseyServiceInterfaceOutput.getClassName(),
                JerseyServiceInterfaceGenerator.GET_CLIENT_METHOD_NAME,
                "url");
        if (maybeAuth.isPresent() && atleastOneEndpointHasAuth) {
            constructorBuilder
                    .addStatement("this.$L = $T.empty()", AUTH_FIELD_NAME, Optional.class)
                    .build();
        }
        return constructorBuilder.build();
    }

    private MethodSpec getUrlAuthConstructor(
            GeneratedJerseyServiceInterface jerseyServiceInterfaceOutput, GeneratedAuthFiles auth) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, "url")
                .addParameter(auth.getClassName(), AUTH_FIELD_NAME)
                .addStatement(
                        "this.$L = $T.$L($L)",
                        SERVICE_FIELD_NAME,
                        jerseyServiceInterfaceOutput.getClassName(),
                        JerseyServiceInterfaceGenerator.GET_CLIENT_METHOD_NAME,
                        "url")
                .addStatement("this.$L = $T.of($L)", AUTH_FIELD_NAME, Optional.class, AUTH_FIELD_NAME)
                .build();
    }

    private void generateCallWithoutRequest(MethodSpec.Builder endpointMethodBuilder, MethodSpec interfaceMethod) {
        endpointMethodBuilder.addStatement("this.$L.$L()", SERVICE_FIELD_NAME, interfaceMethod.name);
        return;
    }

    private void generateCallWithWrappedRequest(
            HttpEndpoint httpEndpoint,
            MethodSpec interfaceMethod,
            GeneratedEndpointRequest generatedRequest,
            MethodSpec.Builder endpointMethodBuilder) {
        endpointMethodBuilder.addParameter(
                ParameterSpec.builder(generatedRequest.requestClassName(), REQUEST_PARAMETER_NAME)
                        .build());
        String args;
        if (httpEndpoint.getAuth()
                && maybeAuth.isPresent()
                && generatedRequest.authMethodSpec().isPresent()) {
            ApiAuth apiAuth = generatorContext.getIr().getAuth();
            GeneratedAuthFiles auth = maybeAuth.get();
            endpointMethodBuilder.addStatement(
                    "$T authValue = $L.$L().orElseGet(() -> this.$L.orElseThrow(() -> new $T($S)))",
                    auth.getClassName(),
                    REQUEST_PARAMETER_NAME,
                    generatedRequest.authMethodSpec().get().name,
                    AUTH_FIELD_NAME,
                    RuntimeException.class,
                    "Auth is required for " + httpEndpoint.getId().get());
            List<String> argTokens = new ArrayList<>();
            if (auth.authSchemeFileOutputs().isEmpty()) {
                argTokens.add("authValue");
            } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ALL)) {
                // generatedAuthSchemes.generatedAuthSchemes().forEach(((authScheme, generatedFile) -> {
                //     argTokens.add("authValue." + AuthSchemeUtils.getAuthSchemeCamelCaseName(authScheme) + "()");
                // }));
            } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ANY)) {
                // generatedAuthSchemes
                //         .generatedAuthSchemes()
                //         .forEach((authScheme, generatedFile) ->
                //                 argTokens.add("authValue." + AnyAuthGenerator.GET_AUTH_PREFIX
                //                         + AuthSchemeUtils.getAuthSchemePascalCaseName(authScheme) + "()"));
            }
            int startIndex = auth.authSchemeFileOutputs().isEmpty()
                    ? 1
                    : auth.authSchemeFileOutputs().get().size();
            for (int i = startIndex;
                    i < generatedRequest.enrichedObjectProperties().size();
                    ++i) {
                MethodSpec propertyMethodSpec =
                        generatedRequest.enrichedObjectProperties().get(i).getterProperty();
                argTokens.add(REQUEST_PARAMETER_NAME + "." + propertyMethodSpec.name + "()");
            }
            args = argTokens.stream().collect(Collectors.joining(", "));
        } else {
            args = generatedRequest.enrichedObjectProperties().stream()
                    .map(enrichedObjectProperty ->
                            REQUEST_PARAMETER_NAME + "." + enrichedObjectProperty.getterProperty().name + "()")
                    .collect(Collectors.joining(", "));
        }
        String codeBlockFormat = "this.$L.$L(" + args + ")";
        if (interfaceMethod.returnType.equals(TypeName.VOID)) {
            endpointMethodBuilder.addStatement(codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        } else {
            endpointMethodBuilder.addStatement("return " + codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        }
    }

    private Optional<GeneratedEndpointRequest> getWrappedRequest(
            HttpEndpoint httpEndpoint, MethodSpec endpointInterfaceMethod) {
        if (endpointInterfaceMethod.parameters.isEmpty()) {
            return Optional.empty();
        }
        HttpEndpointFileGenerator httpEndpointFileGenerator = new HttpEndpointFileGenerator(
                clientGeneratorContext,
                httpService,
                httpEndpoint,
                endpointInterfaceMethod.parameters,
                maybeAuth,
                generatedErrors);
        return Optional.of(httpEndpointFileGenerator.generateFile());
    }
}
