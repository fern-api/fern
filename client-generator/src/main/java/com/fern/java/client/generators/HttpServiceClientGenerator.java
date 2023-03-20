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

import com.fern.ir.v3.model.errors.DeclaredErrorName;
import com.fern.ir.v3.model.services.http.HttpEndpoint;
import com.fern.ir.v3.model.services.http.HttpRequestBodyReference;
import com.fern.ir.v3.model.services.http.HttpService;
import com.fern.ir.v3.model.services.http.PathParameter;
import com.fern.ir.v3.model.services.http.SdkRequestShape;
import com.fern.ir.v3.model.services.http.SdkRequestWrapper;
import com.fern.ir.v3.model.types.DeclaredTypeName;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedJerseyServiceInterface;
import com.fern.java.client.GeneratedJerseyServiceInterface.GeneratedEndpointMethod;
import com.fern.java.client.GeneratedServiceClient;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.GeneratedWrappedRequest.InlinedRequestBodyGetters;
import com.fern.java.client.GeneratedWrappedRequest.ReferencedRequestBodyGetter;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
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
import java.util.HashMap;
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

    private static final String BODY_VARIABLE_NAME = "_body";

    private final HttpService httpService;
    private final Optional<GeneratedAuthFiles> maybeAuth;
    private final Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors;
    private final ClientGeneratorContext clientGeneratorContext;
    private final GeneratedJavaFile objectMapper;
    private final boolean atleastOneEndpointHasAuth;
    private final Optional<GeneratedClientOptions> generatedClientOptionsClass;
    private final Map<DeclaredTypeName, GeneratedJavaInterface> allGeneratedInterfaces;

    public HttpServiceClientGenerator(
            ClientGeneratorContext clientGeneratorContext,
            HttpService httpService,
            Map<DeclaredErrorName, GeneratedJavaFile> generatedErrors,
            Optional<GeneratedAuthFiles> maybeAuth,
            Optional<GeneratedClientOptions> generatedClientOptionsClass,
            Map<DeclaredTypeName, GeneratedJavaInterface> allGeneratedInterfaces,
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
        this.allGeneratedInterfaces = allGeneratedInterfaces;
    }

    @SuppressWarnings({"checkstyle:CyclomaticComplexity", "checkstyle:MethodLength"})
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

        List<GeneratedWrappedRequest> generatedEndpointRequests = new ArrayList<>();
        for (HttpEndpoint httpEndpoint : httpService.getEndpoints()) {
            GeneratedEndpointMethod generatedEndpointMethod =
                    jerseyServiceInterfaceOutput.endpointMethods().get(httpEndpoint.getId());
            MethodSpec.Builder endpointMethodBuilder =
                    MethodSpec.methodBuilder(httpEndpoint.getId().get()).addModifiers(Modifier.PUBLIC);

            httpEndpoint.getDocs().ifPresent(docs -> endpointMethodBuilder.addJavadoc("$L", JavaDocUtils.render(docs)));

            httpService.getPathParameters().forEach(pathParameter -> {
                String pathParameterName =
                        pathParameter.getNameV2().getSafeName().getCamelCase();
                endpointMethodBuilder.addParameter(
                        generatorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParameter.getValueType()),
                        pathParameter.getNameV2().getSafeName().getCamelCase());
                endpointMethodBuilder.addJavadoc(JavaDocUtils.getParameterJavadoc(
                        pathParameterName, pathParameter.getDocs().orElse("")));
            });
            httpEndpoint.getPathParameters().forEach(pathParameter -> {
                String pathParameterName =
                        pathParameter.getNameV2().getSafeName().getCamelCase();
                endpointMethodBuilder.addParameter(
                        generatorContext.getPoetTypeNameMapper().convertToTypeName(true, pathParameter.getValueType()),
                        pathParameter.getNameV2().getSafeName().getCamelCase());
                endpointMethodBuilder.addJavadoc(JavaDocUtils.getParameterJavadoc(
                        pathParameterName, pathParameter.getDocs().orElse("")));
            });

            if (httpEndpoint.getSdkRequest().isPresent()) {
                httpEndpoint.getSdkRequest().get().getShape().visit(new SdkRequestShape.Visitor<Void>() {
                    @Override
                    public Void visitJustRequestBody(HttpRequestBodyReference justRequestBody) {
                        TypeName requestTypeName = generatorContext
                                .getPoetTypeNameMapper()
                                .convertToTypeName(true, justRequestBody.getRequestBodyType());
                        endpointMethodBuilder.addParameter(requestTypeName, REQUEST_PARAMETER_NAME);
                        endpointMethodBuilder.addJavadoc(JavaDocUtils.getParameterJavadoc(
                                REQUEST_PARAMETER_NAME,
                                justRequestBody.getDocs().orElse("")));
                        generateCallWithOnlyRequest(
                                endpointMethodBuilder, generatedEndpointMethod.methodSpec(), httpEndpoint);
                        return null;
                    }

                    @Override
                    public Void visitWrapper(SdkRequestWrapper wrapper) {
                        WrappedRequestGenerator wrappedRequestGenerator = new WrappedRequestGenerator(
                                wrapper,
                                httpService,
                                httpEndpoint,
                                clientGeneratorContext
                                        .getPoetClassNameFactory()
                                        .getRequestWrapperBodyClassName(httpService, wrapper),
                                allGeneratedInterfaces,
                                clientGeneratorContext);
                        GeneratedWrappedRequest generatedWrappedRequest = wrappedRequestGenerator.generateFile();
                        endpointMethodBuilder.addParameter(
                                generatedWrappedRequest.getClassName(), REQUEST_PARAMETER_NAME);
                        endpointMethodBuilder.addJavadoc(JavaDocUtils.getParameterJavadoc(REQUEST_PARAMETER_NAME, ""));
                        generatedEndpointRequests.add(generatedWrappedRequest);
                        generateCallWithWrappedRequest(
                                httpEndpoint,
                                generatedEndpointMethod.methodSpec(),
                                generatedWrappedRequest,
                                endpointMethodBuilder);
                        return null;
                    }

                    @Override
                    public Void _visitUnknown(Object unknownType) {
                        return null;
                    }
                });
            } else {
                generateCallWithoutRequest(endpointMethodBuilder, generatedEndpointMethod.methodSpec(), httpEndpoint);
            }

            endpointMethodBuilder.addExceptions(generatedEndpointMethod.methodSpec().exceptions);
            if (!generatedEndpointMethod.methodSpec().exceptions.isEmpty()) {
                for (TypeName exception : generatedEndpointMethod.methodSpec().exceptions) {
                    endpointMethodBuilder.addJavadoc(JavaDocUtils.getThrowsJavadoc(
                            exception, "Exception that wraps all possible endpoint errors"));
                }
            }

            endpointMethodBuilder.returns(generatedEndpointMethod.methodSpec().returnType);
            if (httpEndpoint.getResponse().getDocs().isPresent()) {
                endpointMethodBuilder.addJavadoc(JavaDocUtils.getReturnDocs(
                        httpEndpoint.getResponse().getDocs().get()));
            } else if (httpEndpoint.getResponse().getTypeV2().isPresent()) {
                endpointMethodBuilder.addJavadoc("@return $T", generatedEndpointMethod.methodSpec().returnType);
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

    private void generateCallWithoutRequest(
            MethodSpec.Builder endpointMethodBuilder, MethodSpec interfaceMethod, HttpEndpoint httpEndpoint) {
        List<String> arguments = new ArrayList<>();

        if (httpEndpoint.getAuth()) {
            GeneratedAuthFiles generatedAuth = maybeAuth.orElseThrow(
                    () -> new RuntimeException("Invalid IR. Authed endpoint but no auth defined."));
            endpointMethodBuilder.addStatement(
                    "$T authValue = this.$L.orElseThrow(() -> new $T($S))",
                    generatedAuth.getClassName(),
                    AUTH_FIELD_NAME,
                    RuntimeException.class,
                    "Auth is required");
            arguments.add("authValue");
        }

        for (ParameterSpec headerParameter : generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters()) {
            arguments.add(headerParameter.name);
        }
        for (PathParameter pathParameter : httpService.getPathParameters()) {
            arguments.add(pathParameter.getName().getCamelCase());
        }
        for (PathParameter pathParameter : httpEndpoint.getPathParameters()) {
            arguments.add(pathParameter.getName().getCamelCase());
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

    private void generateCallWithOnlyRequest(
            MethodSpec.Builder endpointMethodBuilder, MethodSpec interfaceMethod, HttpEndpoint httpEndpoint) {
        List<String> arguments = new ArrayList<>();
        if (httpEndpoint.getAuth()) {
            GeneratedAuthFiles generatedAuth = maybeAuth.orElseThrow(
                    () -> new RuntimeException("Invalid IR. Authed endpoint but no auth defined."));
            endpointMethodBuilder.addStatement(
                    "$T authValue = this.$L.orElseThrow(() -> new $T($S))",
                    generatedAuth.getClassName(),
                    AUTH_FIELD_NAME,
                    RuntimeException.class,
                    "Auth is required");
            arguments.add("authValue");
        }

        for (ParameterSpec headerParameter : generatorContext.getGlobalHeaders().getRequiredGlobalHeaderParameters()) {
            arguments.add(headerParameter.name);
        }
        for (PathParameter pathParameter : httpService.getPathParameters()) {
            arguments.add(pathParameter.getName().getCamelCase());
        }
        for (PathParameter pathParameter : httpEndpoint.getPathParameters()) {
            arguments.add(pathParameter.getName().getCamelCase());
        }
        arguments.add(REQUEST_PARAMETER_NAME);
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

    @SuppressWarnings("checkstyle:CyclomaticComplexity")
    private void generateCallWithWrappedRequest(
            HttpEndpoint httpEndpoint,
            MethodSpec interfaceMethod,
            GeneratedWrappedRequest generatedRequest,
            MethodSpec.Builder endpointMethodBuilder) {

        List<String> endpointArguments = new ArrayList<>();
        if (httpEndpoint.getAuth()) {
            GeneratedAuthFiles generatedAuth = maybeAuth.orElseThrow(
                    () -> new RuntimeException("Invalid IR. Authed endpoint but no auth defined."));
            endpointMethodBuilder.addStatement(
                    "$T authValue = this.$L.orElseThrow(() -> new $T($S))",
                    generatedAuth.getClassName(),
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

        for (MethodSpec headerGetterMethod : generatedRequest.headerGetterMethods()) {
            String argument = REQUEST_PARAMETER_NAME + "." + headerGetterMethod.name + "()";
            endpointArguments.add(argument);
        }

        for (PathParameter pathParameter : httpService.getPathParameters()) {
            endpointArguments.add(pathParameter.getName().getCamelCase());
        }
        for (PathParameter pathParameter : httpEndpoint.getPathParameters()) {
            endpointArguments.add(pathParameter.getName().getCamelCase());
        }

        for (MethodSpec queryParamGetterMethod : generatedRequest.queryParamGetterMethods()) {
            String argument = REQUEST_PARAMETER_NAME + "." + queryParamGetterMethod.name + "()";
            endpointArguments.add(argument);
        }

        if (generatedRequest.requestBodyGetter().isPresent()) {
            if (generatedRequest.requestBodyGetter().get() instanceof ReferencedRequestBodyGetter) {
                String argument = REQUEST_PARAMETER_NAME + "."
                        + ((ReferencedRequestBodyGetter)
                                        generatedRequest.requestBodyGetter().get())
                                .requestBodyGetter()
                                .name
                        + "()";
                endpointArguments.add(argument);
            } else if (generatedRequest.requestBodyGetter().get() instanceof InlinedRequestBodyGetters) {
                endpointMethodBuilder.addStatement(
                        "$T $L = new $T<>()",
                        ParameterizedTypeName.get(Map.class, String.class, Object.class),
                        BODY_VARIABLE_NAME,
                        HashMap.class);
                for (EnrichedObjectProperty bodyProperty : ((InlinedRequestBodyGetters)
                                generatedRequest.requestBodyGetter().get())
                        .properties()) {
                    endpointMethodBuilder.addStatement(
                            "$L.put($S, $L)",
                            BODY_VARIABLE_NAME,
                            bodyProperty.wireKey().get(),
                            REQUEST_PARAMETER_NAME + "." + bodyProperty.getterProperty().name + "()");
                }
                endpointArguments.add(BODY_VARIABLE_NAME);
            }
        }

        String codeBlockFormat = "this.$L.$L(" + String.join(", ", endpointArguments) + ")";
        if (interfaceMethod.returnType.equals(TypeName.VOID)) {
            endpointMethodBuilder.addStatement(codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        } else {
            endpointMethodBuilder.addStatement("return " + codeBlockFormat, SERVICE_FIELD_NAME, interfaceMethod.name);
        }
    }
}
