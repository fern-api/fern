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

import com.fern.ir.model.errors.DeclaredErrorName;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEndpointRequest;
import com.fern.java.client.GeneratedJerseyServiceInterface;
import com.fern.java.client.GeneratedJerseyServiceInterface.GeneratedEndpointMethod;
import com.fern.java.client.GeneratedServiceClient;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.JavaDocUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class HttpServiceClientGenerator extends AbstractFileGenerator {

    private static final String SERVICE_FIELD_NAME = "service";
    private static final String AUTH_FIELD_NAME = "auth";
    private static final String OPTIONS_FIELD_NAME = "options";
    private static final String REQUEST_PARAMETER_NAME = "request";

    private final HttpService httpService;
    private final Optional<GeneratedAuthFiles> maybeAuth;
    private final Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors;
    private final ClientGeneratorContext clientGeneratorContext;
    private final GeneratedJavaFile objectMapper;
    private final boolean atleastOneEndpointHasAuth;
    private final Optional<GeneratedClientOptions> generatedClientOptionsClass;

    public HttpServiceClientGenerator(
            ClientGeneratorContext clientGeneratorContext,
            HttpService httpService,
            Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors,
            Optional<GeneratedAuthFiles> maybeAuth,
            Optional<GeneratedClientOptions> generatedClientOptionsClass,
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
        this.generatedClientOptionsClass = generatedClientOptionsClass;
    }

    @SuppressWarnings("checkstyle:CyclomaticComplexity")
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
                .addFields(generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters().stream()
                        .map(parameterSpec -> FieldSpec.builder(parameterSpec.type, parameterSpec.name)
                                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                                .build())
                        .collect(Collectors.toList()))
                .addMethod(getUrlConstructor(jerseyServiceInterfaceOutput));

        if (generatedClientOptionsClass.isPresent()) {
            serviceClientBuilder.addField(FieldSpec.builder(
                            generatedClientOptionsClass.get().getClassName(),
                            OPTIONS_FIELD_NAME,
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build());
            getUrlOptionsConstructor(jerseyServiceInterfaceOutput, generatedClientOptionsClass.get());
        }

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
            generatedClientOptionsClass.ifPresent(generatedClientOptions -> getUrlAuthOptionsConstructor(
                    jerseyServiceInterfaceOutput, maybeAuth.get(), generatedClientOptions));
        }

        List<GeneratedEndpointRequest> generatedEndpointRequests = new ArrayList<>();
        for (HttpEndpoint httpEndpoint : httpService.getEndpoints()) {
            GeneratedEndpointMethod generatedEndpointMethod =
                    jerseyServiceInterfaceOutput.endpointMethods().get(httpEndpoint.getId());
            Optional<GeneratedEndpointRequest> wrappedRequestFile =
                    getWrappedRequest(httpEndpoint, generatedEndpointMethod);
            MethodSpec.Builder endpointMethodBuilder =
                    MethodSpec.methodBuilder(httpEndpoint.getId().get()).addModifiers(Modifier.PUBLIC);

            boolean addJavaDoc = httpEndpoint.getDocs().isPresent()
                    || httpEndpoint.getResponse().getDocs().isPresent();

            if (addJavaDoc) {
                httpEndpoint
                        .getDocs()
                        .ifPresent(docs -> endpointMethodBuilder.addJavadoc("$L", JavaDocUtils.render(docs)));
            }

            if (wrappedRequestFile.isPresent()) {
                generateCallWithWrappedRequest(
                        httpEndpoint,
                        generatedEndpointMethod.methodSpec(),
                        wrappedRequestFile.get(),
                        endpointMethodBuilder);
                if (addJavaDoc) {
                    if (httpEndpoint.getRequest().getTypeV2().isPresent()) {
                        endpointMethodBuilder.addJavadoc(JavaDocUtils.getParameterJavadoc(
                                REQUEST_PARAMETER_NAME,
                                "Wrapper object for the request body that includes any path parameters, query "
                                        + "parameters, and headers"));
                    } else {
                        endpointMethodBuilder.addJavadoc(JavaDocUtils.getParameterJavadoc(
                                REQUEST_PARAMETER_NAME,
                                "Wrapper object that includes any path parameters, query parameters, and headers"));
                    }
                }
                generatedEndpointRequests.add(wrappedRequestFile.get());
            } else {
                generateCallWithoutRequest(endpointMethodBuilder, generatedEndpointMethod.methodSpec());
            }

            endpointMethodBuilder.addExceptions(generatedEndpointMethod.methodSpec().exceptions);
            if (addJavaDoc && !generatedEndpointMethod.methodSpec().exceptions.isEmpty()) {
                for (TypeName exception : generatedEndpointMethod.methodSpec().exceptions) {
                    endpointMethodBuilder.addJavadoc(JavaDocUtils.getThrowsJavadoc(
                            exception, "Exception that wraps all possible endpoint errors"));
                }
            }

            endpointMethodBuilder.returns(generatedEndpointMethod.methodSpec().returnType);
            if (addJavaDoc) {
                if (httpEndpoint.getResponse().getDocs().isPresent()) {
                    endpointMethodBuilder.addJavadoc(JavaDocUtils.getReturnDocs(
                            httpEndpoint.getResponse().getDocs().get()));
                } else if (httpEndpoint.getResponse().getTypeV2().isPresent()) {
                    endpointMethodBuilder.addJavadoc("@return $T", generatedEndpointMethod.methodSpec().returnType);
                }
            }

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
        if (generatedClientOptionsClass.isPresent()) {
            MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(String.class, "url")
                    .addParameters(generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters());
            constructorBuilder.addStatement(
                    "this($L, $T.builder().build())",
                    constructorBuilder.parameters.stream()
                            .map(parameterSpec -> parameterSpec.name)
                            .collect(Collectors.joining(", ")),
                    generatedClientOptionsClass.get());
            return constructorBuilder.build();
        }
        return withUrlConstructorBuilder(jerseyServiceInterfaceOutput).build();
    }

    private MethodSpec getUrlOptionsConstructor(
            GeneratedJerseyServiceInterface jerseyServiceInterfaceOutput,
            GeneratedClientOptions generatedClientOptions) {
        return withUrlConstructorBuilder(jerseyServiceInterfaceOutput)
                .addParameter(generatedClientOptions.getClassName(), OPTIONS_FIELD_NAME)
                .addStatement("this.$L = $L", OPTIONS_FIELD_NAME, OPTIONS_FIELD_NAME)
                .build();
    }

    private MethodSpec.Builder withUrlConstructorBuilder(GeneratedJerseyServiceInterface jerseyServiceInterfaceOutput) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, "url")
                .addParameters(generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters());
        constructorBuilder.addStatement(
                "this.$L = $T.$L($L)",
                SERVICE_FIELD_NAME,
                jerseyServiceInterfaceOutput.getClassName(),
                JerseyServiceInterfaceGenerator.GET_CLIENT_METHOD_NAME,
                "url");
        for (ParameterSpec headerParameter : generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters()) {
            constructorBuilder.addStatement("this.$L = $L", headerParameter.name, headerParameter.name);
        }
        if (maybeAuth.isPresent() && atleastOneEndpointHasAuth) {
            constructorBuilder
                    .addStatement("this.$L = $T.empty()", AUTH_FIELD_NAME, Optional.class)
                    .build();
        }
        return constructorBuilder;
    }

    private MethodSpec getUrlAuthConstructor(
            GeneratedJerseyServiceInterface jerseyServiceInterfaceOutput, GeneratedAuthFiles auth) {
        if (generatedClientOptionsClass.isPresent()) {
            MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(String.class, "url")
                    .addParameter(auth.getClassName(), AUTH_FIELD_NAME)
                    .addParameters(generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters());
            constructorBuilder.addStatement(
                    "this($L, $T.builder().build())",
                    constructorBuilder.parameters.stream()
                            .map(parameterSpec -> parameterSpec.name)
                            .collect(Collectors.joining(", ")),
                    generatedClientOptionsClass.get());
            return constructorBuilder.build();
        }
        return withUrlAuthConstructor(jerseyServiceInterfaceOutput, auth).build();
    }

    private MethodSpec getUrlAuthOptionsConstructor(
            GeneratedJerseyServiceInterface jerseyServiceInterfaceOutput,
            GeneratedAuthFiles auth,
            GeneratedClientOptions generatedClientOptions) {
        return withUrlAuthConstructor(jerseyServiceInterfaceOutput, auth)
                .addParameter(generatedClientOptions.getClassName(), OPTIONS_FIELD_NAME)
                .addStatement("this.$L = $L", OPTIONS_FIELD_NAME, OPTIONS_FIELD_NAME)
                .build();
    }

    private MethodSpec.Builder withUrlAuthConstructor(
            GeneratedJerseyServiceInterface jerseyServiceInterfaceOutput, GeneratedAuthFiles auth) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, "url")
                .addParameter(auth.getClassName(), AUTH_FIELD_NAME)
                .addParameters(generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters())
                .addStatement(
                        "this.$L = $T.$L($L)",
                        SERVICE_FIELD_NAME,
                        jerseyServiceInterfaceOutput.getClassName(),
                        JerseyServiceInterfaceGenerator.GET_CLIENT_METHOD_NAME,
                        "url")
                .addStatement("this.$L = $T.of($L)", AUTH_FIELD_NAME, Optional.class, AUTH_FIELD_NAME);
        for (ParameterSpec headerParameter : generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters()) {
            constructorBuilder.addStatement("this.$L = $L", headerParameter.name, headerParameter.name);
        }
        return constructorBuilder;
    }

    private void generateCallWithoutRequest(MethodSpec.Builder endpointMethodBuilder, MethodSpec interfaceMethod) {
        List<String> arguments = new ArrayList<>();
        for (ParameterSpec headerParameter : generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters()) {
            arguments.add(headerParameter.name);
        }
        if (interfaceMethod.returnType != null && !interfaceMethod.returnType.equals(TypeName.VOID)) {
            endpointMethodBuilder.addStatement(
                    "return this.$L.$L(" + String.join(", ", arguments) + ")",
                    SERVICE_FIELD_NAME,
                    interfaceMethod.name);
        } else {
            endpointMethodBuilder.addStatement(
                    "this.$L.$L(" + String.join(", ", arguments) + ")", SERVICE_FIELD_NAME, interfaceMethod.name);
        }
    }

    private void generateCallWithWrappedRequest(
            HttpEndpoint httpEndpoint,
            MethodSpec interfaceMethod,
            GeneratedEndpointRequest generatedRequest,
            MethodSpec.Builder endpointMethodBuilder) {
        endpointMethodBuilder.addParameter(
                ParameterSpec.builder(generatedRequest.requestClassName(), REQUEST_PARAMETER_NAME)
                        .build());

        List<String> endpointArguments = new ArrayList<>();
        if (httpEndpoint.getAuth()) {
            GeneratedAuthFiles generatedAuth = maybeAuth.orElseThrow(
                    () -> new RuntimeException("Invalid IR. Authed endpoint but no auth defined."));
            if (generatedRequest.authMethodSpec().isEmpty()) {
                throw new IllegalStateException("Authed endpoint should have generated authMethodSpec");
            }
            endpointMethodBuilder.addStatement(
                    "$T authValue = $L.$N().orElseGet(() -> this.$L.orElseThrow(() -> new $T($S)))",
                    generatedAuth.getClassName(),
                    REQUEST_PARAMETER_NAME,
                    generatedRequest.authMethodSpec().get(),
                    AUTH_FIELD_NAME,
                    RuntimeException.class,
                    "Auth is required");
            endpointArguments.add("authValue");
        }

        for (ParameterSpec headerParameter : generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters()) {
            endpointArguments.add(headerParameter.name);
        }

        if (generatedClientOptionsClass.isPresent()) {
            generatedClientOptionsClass.get().optionalGlobalHeaderMethodSpecs().forEach(optionalHeaderMethodSpec -> {
                endpointArguments.add(OPTIONS_FIELD_NAME + "." + optionalHeaderMethodSpec.name);
            });
        }

        generatedRequest.nonAuthProperties().forEach(enrichedObjectProperty -> {
            String argument = REQUEST_PARAMETER_NAME + "." + enrichedObjectProperty.getterProperty().name + "()";
            endpointArguments.add(argument);
        });

        String codeBlockFormat = "this.$L.$L(" + String.join(", ", endpointArguments) + ")";
        if (interfaceMethod.returnType.equals(TypeName.VOID)) {
            endpointMethodBuilder.addStatement(codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        } else {
            endpointMethodBuilder.addStatement("return " + codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        }
    }

    private Optional<GeneratedEndpointRequest> getWrappedRequest(
            HttpEndpoint httpEndpoint, GeneratedEndpointMethod generatedEndpointMethod) {
        int numRequiredHeaders = generatorContext
                .getGlobalHeaders()
                .getRequiredGlobalHeaderParameters()
                .size();
        if (generatedEndpointMethod.parameters().size() <= numRequiredHeaders) {
            return Optional.empty();
        }

        int numParametersToSkip = numRequiredHeaders;
        if (httpEndpoint.getAuth()) {
            numParametersToSkip += 1;
        }
        HttpEndpointFileGenerator httpEndpointFileGenerator = new HttpEndpointFileGenerator(
                clientGeneratorContext,
                httpService,
                httpEndpoint,
                numParametersToSkip == generatedEndpointMethod.parameters().size()
                        ? Collections.emptyList()
                        : generatedEndpointMethod
                                .parameters()
                                .subList(
                                        numParametersToSkip,
                                        generatedEndpointMethod.parameters().size()),
                maybeAuth,
                generatedErrors);
        return Optional.of(httpEndpointFileGenerator.generateFile());
    }
}
