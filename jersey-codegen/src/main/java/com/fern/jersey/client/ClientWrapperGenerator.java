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

package com.fern.jersey.client;

import com.fern.codegen.GeneratedAuthSchemes;
import com.fern.codegen.GeneratedClientWrapper;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.Generator;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.CasingUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.types.FernFilepath;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Queue;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class ClientWrapperGenerator extends Generator {

    private static final String MEMOIZE_METHOD_NAME = "memoize";
    private static final String URL_PARAMETER_NAME = "url";
    private static final String AUTH_PARAMETER_NAME = "auth";
    private final List<GeneratedHttpServiceClient> generatedHttpServiceClients;
    private final ClassName generatedClientWrapperClassName;
    private final ClientConfig rootClientConfig;
    private final Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes;

    public ClientWrapperGenerator(
            GeneratorContext generatorContext,
            List<GeneratedHttpServiceClient> generatedHttpServiceClients,
            String workspaceName,
            Optional<GeneratedAuthSchemes> maybeGeneratedAuthSchemes) {
        super(generatorContext);
        this.generatedHttpServiceClients = generatedHttpServiceClients;
        this.generatedClientWrapperClassName = generatorContext
                .getClassNameUtils()
                .getClassName(
                        CasingUtils.convertKebabCaseToUpperCamelCase(workspaceName),
                        Optional.of("Client"),
                        Optional.empty(),
                        PackageType.CLIENT);
        List<GeneratedHttpServiceClient> clientsOrderedByDept = generatedHttpServiceClients.stream()
                .sorted(Comparator.comparingInt(generatedClient -> generatedClient
                        .serviceInterface()
                        .httpService()
                        .name()
                        .fernFilepath()
                        .value()
                        .size()))
                .collect(Collectors.toList());
        this.rootClientConfig = createClientConfig(clientsOrderedByDept, 1, generatedClientWrapperClassName);
        this.maybeGeneratedAuthSchemes = maybeGeneratedAuthSchemes;
    }

    @Override
    public GeneratedClientWrapper generate() {
        GeneratedFile rootClientWrapper = createClient(rootClientConfig);

        Queue<ClientConfig> nestedClientConfigs =
                new LinkedList<>(rootClientConfig.nestedClients().values());
        List<GeneratedFile> generatedNestedClients = new ArrayList<>();
        while (!nestedClientConfigs.isEmpty()) {
            ClientConfig clientConfig = nestedClientConfigs.poll();
            generatedNestedClients.add(createClient(clientConfig));
            nestedClientConfigs.addAll(clientConfig.nestedClients().values());
        }
        return GeneratedClientWrapper.builder()
                .file(rootClientWrapper.file())
                .className(rootClientWrapper.className())
                .addAllNestedClientWrappers(generatedNestedClients)
                .build();
    }

    private GeneratedFile createClient(ClientConfig clientConfig) {
        TypeSpec.Builder clientWrapperBuilder =
                TypeSpec.classBuilder(clientConfig.className()).addModifiers(Modifier.PUBLIC, Modifier.FINAL);
        Map<String, GeneratedHttpServiceClient> supplierFields = new HashMap<>();
        Map<String, ClassName> nestedClientFields = new HashMap<>();
        clientConfig.httpServiceClient().forEach(httpServiceClient -> {
            String fieldName =
                    StringUtils.uncapitalize(httpServiceClient.className().simpleName());
            clientWrapperBuilder.addField(
                    ParameterizedTypeName.get(ClassName.get(Supplier.class), httpServiceClient.className()),
                    fieldName,
                    Modifier.PRIVATE,
                    Modifier.FINAL);
            supplierFields.put(fieldName, httpServiceClient);

            FernFilepath fernFilepath =
                    httpServiceClient.serviceInterface().httpService().name().fernFilepath();
            String methodName;
            if (fernFilepath.value().isEmpty()) {
                methodName = StringUtils.uncapitalize(httpServiceClient
                        .serviceInterface()
                        .httpService()
                        .name()
                        .name());
            } else {
                methodName = fernFilepath
                        .value()
                        .get(fernFilepath.value().size() - 1)
                        .originalValue();
            }
            clientWrapperBuilder.addMethod(MethodSpec.methodBuilder(methodName)
                    .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                    .addStatement("return this.$L.get()", fieldName)
                    .returns(httpServiceClient.className())
                    .build());
        });
        KeyedStream.stream(clientConfig.nestedClients()).forEach((prefix, nestedClientConfig) -> {
            clientWrapperBuilder.addField(nestedClientConfig.className(), prefix, Modifier.PRIVATE, Modifier.FINAL);
            nestedClientFields.put(prefix, nestedClientConfig.className());

            clientWrapperBuilder.addMethod(MethodSpec.methodBuilder(prefix)
                    .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                    .addStatement("return this.$L", prefix)
                    .build());
        });
        clientWrapperBuilder.addMethod(createUrlOnlyConstructor(supplierFields, nestedClientFields));
        maybeGeneratedAuthSchemes.ifPresent(generatedAuthSchemes -> clientWrapperBuilder.addMethod(
                createUrlAndAuthConstructor(supplierFields, nestedClientFields, generatedAuthSchemes)));

        TypeSpec clientWrapperTypeSpec =
                clientWrapperBuilder.addMethod(createMemoizeMethod()).build();
        JavaFile clientWrapperJavaFile = JavaFile.builder(
                        clientConfig.className().packageName(), clientWrapperTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(clientWrapperJavaFile)
                .className(generatedClientWrapperClassName)
                .build();
    }

    private MethodSpec createUrlOnlyConstructor(
            Map<String, GeneratedHttpServiceClient> supplierFields, Map<String, ClassName> nestedClientFields) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, URL_PARAMETER_NAME);
        KeyedStream.stream(supplierFields).forEach((fieldName, httpClient) -> {
            constructorBuilder.addStatement(
                    "this.$L = $L(() -> new $T($L))",
                    fieldName,
                    MEMOIZE_METHOD_NAME,
                    httpClient.className(),
                    URL_PARAMETER_NAME);
        });
        KeyedStream.stream(nestedClientFields).forEach((fieldName, nestedClientCLassName) -> {
            constructorBuilder.addStatement(
                    "this.$L = new $T($L)", fieldName, nestedClientCLassName, URL_PARAMETER_NAME);
        });
        return constructorBuilder.build();
    }

    private MethodSpec createUrlAndAuthConstructor(
            Map<String, GeneratedHttpServiceClient> supplierFields,
            Map<String, ClassName> nestedClientFields,
            GeneratedAuthSchemes generatedAuthSchemes) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, URL_PARAMETER_NAME)
                .addParameter(generatedAuthSchemes.className(), AUTH_PARAMETER_NAME);
        KeyedStream.stream(supplierFields).forEach((fieldName, httpClient) -> {
            constructorBuilder.addStatement(
                    "this.$L = $L(() -> new $T($L, $L))",
                    fieldName,
                    MEMOIZE_METHOD_NAME,
                    httpClient.className(),
                    URL_PARAMETER_NAME,
                    AUTH_PARAMETER_NAME);
        });
        KeyedStream.stream(nestedClientFields).forEach((fieldName, nestedClientCLassName) -> {
            constructorBuilder.addStatement(
                    "this.$L = new $T($L, $L)",
                    fieldName,
                    nestedClientCLassName,
                    URL_PARAMETER_NAME,
                    AUTH_PARAMETER_NAME);
        });
        return constructorBuilder.build();
    }

    private MethodSpec createMemoizeMethod() {
        TypeVariableName genericType = TypeVariableName.get("T");
        TypeName genericSupplier = ParameterizedTypeName.get(ClassName.get(Supplier.class), genericType);
        TypeName genericAtomicReference = ParameterizedTypeName.get(ClassName.get(AtomicReference.class), genericType);
        return MethodSpec.methodBuilder(MEMOIZE_METHOD_NAME)
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC)
                .addTypeVariable(genericType)
                .returns(genericSupplier)
                .addParameter(genericSupplier, "delegate")
                .addStatement("$T value = new $T<>()", genericAtomicReference, AtomicReference.class)
                .beginControlFlow("return () -> ")
                .addStatement("$T val = value.get()", genericType)
                .beginControlFlow("if (val == null)")
                .addStatement(
                        "val = value.updateAndGet(cur -> cur == null ? $T.requireNonNull(delegate.get()) : cur)",
                        Objects.class)
                .endControlFlow()
                .addStatement("return val")
                .endControlFlow("")
                .build();
    }

    @SuppressWarnings("CheckReturnValue")
    private ClientConfig createClientConfig(
            List<GeneratedHttpServiceClient> serviceClients, int fernFilePathSize, ClassName wrapperClassName) {
        ImmutableClientConfig.BuildFinal clientConfigBuilder =
                ClientConfig.builder().className(wrapperClassName);
        Map<String, List<GeneratedHttpServiceClient>> nestedClients = new HashMap<>();
        for (GeneratedHttpServiceClient generatedHttpServiceClient : serviceClients) {
            FernFilepath fernFilepath = generatedHttpServiceClient
                    .serviceInterface()
                    .httpService()
                    .name()
                    .fernFilepath();
            if (fernFilepath.value().size() <= fernFilePathSize) {
                clientConfigBuilder.addHttpServiceClient(generatedHttpServiceClient);
            } else {
                String prefix = fernFilepath.value().get(fernFilePathSize).originalValue();
                if (nestedClients.containsKey(prefix)) {
                    nestedClients.get(prefix).add(generatedHttpServiceClient);
                } else {
                    List<GeneratedHttpServiceClient> clients = new ArrayList<>();
                    clients.add(generatedHttpServiceClient);
                    nestedClients.put(prefix, clients);
                }
            }
        }
        KeyedStream.stream(nestedClients).forEach((prefix, prefixedClients) -> {
            ClassName nestedClientClassName = generatorContext
                    .getClassNameUtils()
                    .getClassName(prefix, Optional.of("Client"), Optional.empty(), PackageType.CLIENT);
            ClientConfig nestedClientConfig =
                    createClientConfig(prefixedClients, fernFilePathSize + 1, nestedClientClassName);
            clientConfigBuilder.putNestedClients(prefix, nestedClientConfig);
        });
        return clientConfigBuilder.build();
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface ClientConfig {

        ClassName className();

        List<GeneratedHttpServiceClient> httpServiceClient();

        Map<String, ClientConfig> nestedClients();

        static ImmutableClientConfig.ClassNameBuildStage builder() {
            return ImmutableClientConfig.builder();
        }
    }
}
