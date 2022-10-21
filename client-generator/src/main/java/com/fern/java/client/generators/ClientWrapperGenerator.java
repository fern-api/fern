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

import com.fern.ir.model.commons.FernFilepath;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.GeneratedClientWrapper;
import com.fern.java.client.GeneratedServiceClient;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.CasingUtils;
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

public final class ClientWrapperGenerator extends AbstractFileGenerator {

    private static final String MEMOIZE_METHOD_NAME = "memoize";
    private static final String URL_PARAMETER_NAME = "url";
    private static final String AUTH_PARAMETER_NAME = "auth";
    private final List<GeneratedServiceClient> generatedHttpServiceClients;
    private final ClientConfig rootClientConfig;
    private final Optional<GeneratedAuthFiles> maybeAuth;

    public ClientWrapperGenerator(
            AbstractGeneratorContext<?> generatorContext,
            List<GeneratedServiceClient> generatedHttpServiceClients,
            Optional<GeneratedAuthFiles> maybeAuth) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getTopLevelClassName(CasingUtils.convertKebabCaseToUpperCamelCase(
                                        generatorContext.getGeneratorConfig().getOrganization())
                                + CasingUtils.convertKebabCaseToUpperCamelCase(
                                        generatorContext.getGeneratorConfig().getWorkspaceName())
                                + "Client"),
                generatorContext);
        List<GeneratedServiceClient> clientsOrderedByDepth = generatedHttpServiceClients.stream()
                .sorted(Comparator.comparingInt(generatedServiceClient -> generatedServiceClient
                        .httpService()
                        .getName()
                        .getFernFilepath()
                        .get()
                        .size()))
                .collect(Collectors.toList());
        this.generatedHttpServiceClients = clientsOrderedByDepth;
        this.rootClientConfig = createClientConfig(clientsOrderedByDepth, 1, className);
        this.maybeAuth = maybeAuth;
    }

    @Override
    public GeneratedClientWrapper generateFile() {
        GeneratedJavaFile rootClientWrapper = createClient(rootClientConfig);

        Queue<ClientConfig> nestedClientConfigs =
                new LinkedList<>(rootClientConfig.nestedClients().values());
        List<GeneratedJavaFile> generatedNestedClients = new ArrayList<>();
        while (!nestedClientConfigs.isEmpty()) {
            ClientConfig clientConfig = nestedClientConfigs.poll();
            generatedNestedClients.add(createClient(clientConfig));
            nestedClientConfigs.addAll(clientConfig.nestedClients().values());
        }
        return GeneratedClientWrapper.builder()
                .className(rootClientWrapper.getClassName())
                .javaFile(rootClientWrapper.javaFile())
                .addAllNestedClients(generatedNestedClients)
                .build();
    }

    private GeneratedJavaFile createClient(ClientConfig clientConfig) {
        TypeSpec.Builder clientWrapperBuilder =
                TypeSpec.classBuilder(clientConfig.className()).addModifiers(Modifier.PUBLIC, Modifier.FINAL);

        Map<String, GeneratedServiceClient> supplierFields = new HashMap<>();
        Map<String, ClassName> nestedClientFields = new HashMap<>();
        for (GeneratedServiceClient serviceClient : clientConfig.generatedServiceClients()) {
            String fieldName =
                    StringUtils.uncapitalize(serviceClient.getClassName().simpleName());
            clientWrapperBuilder.addField(
                    ParameterizedTypeName.get(ClassName.get(Supplier.class), serviceClient.getClassName()),
                    fieldName,
                    Modifier.PRIVATE,
                    Modifier.FINAL);
            supplierFields.put(fieldName, serviceClient);

            FernFilepath fernFilepath = serviceClient.httpService().getName().getFernFilepath();
            String methodName;
            if (fernFilepath.get().isEmpty()) {
                methodName = StringUtils.uncapitalize(
                        serviceClient.httpService().getName().getName());
            } else {
                methodName =
                        fernFilepath.get().get(fernFilepath.get().size() - 1).getCamelCase();
            }
            clientWrapperBuilder.addMethod(MethodSpec.methodBuilder(methodName)
                    .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                    .addStatement("return this.$L.get()", fieldName)
                    .returns(serviceClient.getClassName())
                    .build());
        }
        KeyedStream.stream(clientConfig.nestedClients()).forEach((prefix, nestedClientConfig) -> {
            clientWrapperBuilder.addField(nestedClientConfig.className(), prefix, Modifier.PRIVATE, Modifier.FINAL);
            nestedClientFields.put(prefix, nestedClientConfig.className());

            clientWrapperBuilder.addMethod(MethodSpec.methodBuilder(prefix)
                    .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                    .addStatement("return this.$L", prefix)
                    .build());
        });
        clientWrapperBuilder.addMethod(createUrlOnlyConstructor(supplierFields, nestedClientFields));
        maybeAuth.ifPresent(auth ->
                clientWrapperBuilder.addMethod(createUrlAndAuthConstructor(supplierFields, nestedClientFields, auth)));

        TypeSpec clientWrapperTypeSpec =
                clientWrapperBuilder.addMethod(createMemoizeMethod()).build();
        JavaFile clientWrapperJavaFile = JavaFile.builder(
                        clientConfig.className().packageName(), clientWrapperTypeSpec)
                .build();
        return GeneratedJavaFile.builder()
                .className(clientConfig.className())
                .javaFile(clientWrapperJavaFile)
                .build();
    }

    private MethodSpec createUrlOnlyConstructor(
            Map<String, GeneratedServiceClient> supplierFields, Map<String, ClassName> nestedClientFields) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, URL_PARAMETER_NAME);
        KeyedStream.stream(supplierFields).forEach((fieldName, httpClient) -> {
            constructorBuilder.addStatement(
                    "this.$L = $L(() -> new $T($L))",
                    fieldName,
                    MEMOIZE_METHOD_NAME,
                    httpClient.getClassName(),
                    URL_PARAMETER_NAME);
        });
        KeyedStream.stream(nestedClientFields).forEach((fieldName, nestedClientCLassName) -> {
            constructorBuilder.addStatement(
                    "this.$L = new $T($L)", fieldName, nestedClientCLassName, URL_PARAMETER_NAME);
        });
        return constructorBuilder.build();
    }

    private MethodSpec createUrlAndAuthConstructor(
            Map<String, GeneratedServiceClient> supplierFields,
            Map<String, ClassName> nestedClientFields,
            GeneratedAuthFiles auth) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(String.class, URL_PARAMETER_NAME)
                .addParameter(auth.getClassName(), AUTH_PARAMETER_NAME);
        KeyedStream.stream(supplierFields).forEach((fieldName, httpClient) -> {
            boolean hasAuthParameter = httpClient.javaFile().typeSpec.fieldSpecs.stream()
                    .anyMatch(fieldSpec -> fieldSpec.name.equals(AUTH_PARAMETER_NAME));
            if (hasAuthParameter) {
                constructorBuilder.addStatement(
                        "this.$L = $L(() -> new $T($L, $L))",
                        fieldName,
                        MEMOIZE_METHOD_NAME,
                        httpClient.getClassName(),
                        URL_PARAMETER_NAME,
                        AUTH_PARAMETER_NAME);
            } else {
                constructorBuilder.addStatement(
                        "this.$L = $L(() -> new $T($L))",
                        fieldName,
                        MEMOIZE_METHOD_NAME,
                        httpClient.getClassName(),
                        URL_PARAMETER_NAME);
            }
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
            List<GeneratedServiceClient> serviceClients, int fernFilePathSize, ClassName wrapperClassName) {
        ImmutableClientConfig.BuildFinal clientConfigBuilder =
                ClientConfig.builder().className(wrapperClassName);
        Map<String, List<GeneratedServiceClient>> nestedClients = new HashMap<>();
        for (GeneratedServiceClient generatedHttpServiceClient : serviceClients) {
            FernFilepath fernFilepath =
                    generatedHttpServiceClient.httpService().getName().getFernFilepath();
            if (fernFilepath.get().size() <= fernFilePathSize) {
                clientConfigBuilder.addGeneratedServiceClients(generatedHttpServiceClient);
            } else {
                String prefix = fernFilepath.get().get(fernFilePathSize).getOriginalValue();
                if (nestedClients.containsKey(prefix)) {
                    nestedClients.get(prefix).add(generatedHttpServiceClient);
                } else {
                    List<GeneratedServiceClient> clients = new ArrayList<>();
                    clients.add(generatedHttpServiceClient);
                    nestedClients.put(prefix, clients);
                }
            }
        }
        KeyedStream.stream(nestedClients).forEach((prefix, prefixedClients) -> {
            ClassName nestedClientClassName =
                    generatorContext.getPoetClassNameFactory().getTopLevelClassName(prefix + "Client");
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

        List<GeneratedServiceClient> generatedServiceClients();

        Map<String, ClientConfig> nestedClients();

        static ImmutableClientConfig.ClassNameBuildStage builder() {
            return ImmutableClientConfig.builder();
        }
    }
}
