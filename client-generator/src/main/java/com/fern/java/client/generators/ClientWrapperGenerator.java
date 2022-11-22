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
import com.fern.ir.model.commons.StringWithAllCasings;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.GlobalHeaders;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedClientWrapper;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedServiceClient;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.CasingUtils;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
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
    private static final String ENVIRONMENT_PARAMETER_NAME = "environment";
    private static final String URL_PARAMETER_NAME = "url";
    private static final String AUTH_PARAMETER_NAME = "auth";
    private final List<GeneratedServiceClient> generatedHttpServiceClients;
    private final ClientConfig rootClientConfig;
    private final Optional<GeneratedAuthFiles> maybeAuth;
    private final Optional<GeneratedEnvironmentsClass> maybeGeneratedEnvironmentsClass;
    private final Optional<GeneratedClientOptions> generatedClientOptionsClass;

    public ClientWrapperGenerator(
            AbstractGeneratorContext<?> generatorContext,
            List<GeneratedServiceClient> generatedHttpServiceClients,
            Optional<GeneratedEnvironmentsClass> maybeGeneratedEnvironmentsClass,
            Optional<GeneratedAuthFiles> maybeAuth,
            Optional<GeneratedClientOptions> generatedClientOptionsClass) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getRootClassName(CasingUtils.convertKebabCaseToUpperCamelCase(
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
        this.maybeGeneratedEnvironmentsClass = maybeGeneratedEnvironmentsClass;
        this.generatedClientOptionsClass = generatedClientOptionsClass;
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
                    .returns(nestedClientConfig.className())
                    .build());
        });
        clientWrapperBuilder.addMethods(getConstructors(supplierFields, nestedClientFields));

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

    @SuppressWarnings("checkstyle:CyclomaticComplexity")
    private List<MethodSpec> getConstructors(
            Map<String, GeneratedServiceClient> supplierFields, Map<String, ClassName> nestedClientFields) {
        List<MethodSpec> constructors = new ArrayList<>();

        GlobalHeaders globalHeaders = generatorContext.getGlobalHeaders();
        EnvironmentConstructorParam environmentConstructorParam = getEnvironmentConstructorParam();
        boolean isEnvironmentPresent = maybeGeneratedEnvironmentsClass.isPresent();
        boolean isDefaultEnvironmentPresent = isEnvironmentPresent
                && maybeGeneratedEnvironmentsClass
                        .get()
                        .defaultEnvironmentConstant()
                        .isPresent();
        boolean isAuthPresent = maybeAuth.isPresent();
        boolean isAuthMandatory =
                isAuthPresent && generatorContext.getIr().getSdkConfig().getIsAuthMandatory();
        boolean isClientOptionsPresent = generatedClientOptionsClass.isPresent();

        // Add auth constructors
        if (isAuthPresent) {
            if (isDefaultEnvironmentPresent) {
                String defaultEnvironmentConstant = maybeGeneratedEnvironmentsClass
                        .get()
                        .defaultEnvironmentConstant()
                        .get();
                constructors.add(createDefaultEnvironmentAuthConstructor(
                        maybeGeneratedEnvironmentsClass.get().getClassName(),
                        defaultEnvironmentConstant,
                        maybeAuth.get(),
                        globalHeaders));
                if (isClientOptionsPresent) {
                    constructors.add(createDefaultEnvironmentAuthOptionsConstructor(
                            maybeGeneratedEnvironmentsClass.get().getClassName(),
                            defaultEnvironmentConstant,
                            maybeAuth.get(),
                            globalHeaders,
                            generatedClientOptionsClass.get()));
                }
            }
            constructors.add(createEnvironmentAuthConstructor(
                    environmentConstructorParam, maybeAuth.get(), globalHeaders, supplierFields, nestedClientFields));
            if (isClientOptionsPresent) {
                constructors.add(createEnvironmentAuthOptionsConstructor(
                        environmentConstructorParam,
                        maybeAuth.get(),
                        generatedClientOptionsClass.get(),
                        globalHeaders,
                        supplierFields,
                        nestedClientFields));
            }
        }
        if (isAuthMandatory) {
            return constructors;
        }
        // Add no auth constructors
        if (isDefaultEnvironmentPresent) {
            String defaultEnvironmentConstant = maybeGeneratedEnvironmentsClass
                    .get()
                    .defaultEnvironmentConstant()
                    .get();
            constructors.add(createDefaultEnvironmentNoAuthConstructor(
                    maybeGeneratedEnvironmentsClass.get(), defaultEnvironmentConstant, globalHeaders));
            if (isClientOptionsPresent) {
                constructors.add(createDefaultEnvironmentNoAuthOptionsConstructor(
                        maybeGeneratedEnvironmentsClass.get(),
                        defaultEnvironmentConstant,
                        globalHeaders,
                        generatedClientOptionsClass.get()));
            }
        }
        constructors.add(createEnvironmentNoAuthConstructor(
                environmentConstructorParam, globalHeaders, supplierFields, nestedClientFields));
        if (isClientOptionsPresent) {
            constructors.add(createEnvironmentNoAuthOptionsConstructor(
                    environmentConstructorParam,
                    generatedClientOptionsClass.get(),
                    globalHeaders,
                    supplierFields,
                    nestedClientFields));
        }

        constructors.sort(Comparator.comparingInt(methodSpec -> methodSpec.parameters.size()));

        return constructors;
    }

    private static MethodSpec createDefaultEnvironmentNoAuthConstructor(
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            String defaultEnvironmentConstant,
            GlobalHeaders globalHeaders) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameters(globalHeaders.getRequiredGlobalHeaderParameters())
                .addStatement(
                        "this(" + globalHeaders.suffixRequiredGlobalHeaderParams("$T.$L") + ")",
                        generatedEnvironmentsClass.getClassName(),
                        defaultEnvironmentConstant)
                .build();
    }

    private static MethodSpec createDefaultEnvironmentNoAuthOptionsConstructor(
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            String defaultEnvironmentConstant,
            GlobalHeaders globalHeaders,
            GeneratedClientOptions generatedClientOptions) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameters(globalHeaders.getRequiredGlobalHeaderParameters())
                .addParameter(generatedClientOptions.getClassName(), "options")
                .addStatement(
                        "this(" + globalHeaders.suffixRequiredGlobalHeaderParams("$T.$L, options") + ")",
                        generatedEnvironmentsClass.getClassName(),
                        defaultEnvironmentConstant)
                .build();
    }

    private static MethodSpec createDefaultEnvironmentAuthConstructor(
            ClassName generatedEnvironmentsClass,
            String defaultEnvironmentConstant,
            GeneratedAuthFiles generatedAuth,
            GlobalHeaders globalHeaders) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(generatedAuth.getClassName(), AUTH_PARAMETER_NAME)
                .addParameters(globalHeaders.getRequiredGlobalHeaderParameters())
                .addStatement(
                        "this(" + globalHeaders.suffixRequiredGlobalHeaderParams("$T.$L, $L") + ")",
                        generatedEnvironmentsClass,
                        defaultEnvironmentConstant,
                        AUTH_PARAMETER_NAME)
                .build();
    }

    private static MethodSpec createDefaultEnvironmentAuthOptionsConstructor(
            ClassName generatedEnvironmentsClass,
            String defaultEnvironmentConstant,
            GeneratedAuthFiles generatedAuth,
            GlobalHeaders globalHeaders,
            GeneratedClientOptions generatedClientOptions) {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(generatedAuth.getClassName(), AUTH_PARAMETER_NAME)
                .addParameters(globalHeaders.getRequiredGlobalHeaderParameters())
                .addParameter(generatedClientOptions.getClassName(), "options")
                .addStatement(
                        "this(" + globalHeaders.suffixRequiredGlobalHeaderParams("$T.$L, $L, options") + ")",
                        generatedEnvironmentsClass,
                        defaultEnvironmentConstant,
                        AUTH_PARAMETER_NAME)
                .build();
    }

    private static MethodSpec createEnvironmentNoAuthConstructor(
            EnvironmentConstructorParam environmentConstructorParam,
            GlobalHeaders globalHeaders,
            Map<String, GeneratedServiceClient> supplierFields,
            Map<String, ClassName> nestedClientFields) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(environmentConstructorParam.paramType, environmentConstructorParam.paramName)
                .addParameters(globalHeaders.getRequiredGlobalHeaderParameters());
        KeyedStream.stream(supplierFields)
                .forEach((fieldName, httpClient) -> constructorBuilder.addStatement(
                        "this.$L = $L(() -> new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L") + "))",
                        fieldName,
                        MEMOIZE_METHOD_NAME,
                        httpClient.getClassName(),
                        environmentConstructorParam.urlGetterCodeBlock));
        KeyedStream.stream(nestedClientFields)
                .forEach((fieldName, nestedClientCLassName) -> constructorBuilder.addStatement(
                        "this.$L = new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L") + ")",
                        fieldName,
                        nestedClientCLassName,
                        environmentConstructorParam.paramName));
        return constructorBuilder.build();
    }

    private static MethodSpec createEnvironmentNoAuthOptionsConstructor(
            EnvironmentConstructorParam environmentConstructorParam,
            GeneratedClientOptions generatedClientOptions,
            GlobalHeaders globalHeaders,
            Map<String, GeneratedServiceClient> supplierFields,
            Map<String, ClassName> nestedClientFields) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(environmentConstructorParam.paramType, environmentConstructorParam.paramName)
                .addParameters(globalHeaders.getRequiredGlobalHeaderParameters())
                .addParameter(generatedClientOptions.getClassName(), "options");
        KeyedStream.stream(supplierFields)
                .forEach((fieldName, httpClient) -> constructorBuilder.addStatement(
                        "this.$L = $L(() -> new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L")
                                + ", options))",
                        fieldName,
                        MEMOIZE_METHOD_NAME,
                        httpClient.getClassName(),
                        environmentConstructorParam.urlGetterCodeBlock));
        KeyedStream.stream(nestedClientFields)
                .forEach((fieldName, nestedClientCLassName) -> constructorBuilder.addStatement(
                        "this.$L = new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L") + ", options)",
                        fieldName,
                        nestedClientCLassName,
                        environmentConstructorParam.paramName));
        return constructorBuilder.build();
    }

    private static MethodSpec createEnvironmentAuthConstructor(
            EnvironmentConstructorParam environmentConstructorParam,
            GeneratedAuthFiles generatedAuth,
            GlobalHeaders globalHeaders,
            Map<String, GeneratedServiceClient> supplierFields,
            Map<String, ClassName> nestedClientFields) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(environmentConstructorParam.paramType, environmentConstructorParam.paramName)
                .addParameter(generatedAuth.getClassName(), AUTH_PARAMETER_NAME)
                .addParameters(globalHeaders.getRequiredGlobalHeaderParameters());
        KeyedStream.stream(supplierFields).forEach((fieldName, httpClient) -> {
            boolean hasAuthParameter = httpClient.javaFile().typeSpec.fieldSpecs.stream()
                    .anyMatch(fieldSpec -> fieldSpec.name.equals(AUTH_PARAMETER_NAME));
            if (hasAuthParameter) {
                constructorBuilder.addStatement(
                        "this.$L = $L(() -> new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L, $L") + "))",
                        fieldName,
                        MEMOIZE_METHOD_NAME,
                        httpClient.getClassName(),
                        environmentConstructorParam.urlGetterCodeBlock,
                        AUTH_PARAMETER_NAME);
            } else {
                constructorBuilder.addStatement(
                        "this.$L = $L(() -> new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L") + "))",
                        fieldName,
                        MEMOIZE_METHOD_NAME,
                        httpClient.getClassName(),
                        environmentConstructorParam.urlGetterCodeBlock);
            }
        });
        KeyedStream.stream(nestedClientFields).forEach((fieldName, nestedClientCLassName) -> {
            constructorBuilder.addStatement(
                    "this.$L = new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L, $L") + ")",
                    fieldName,
                    nestedClientCLassName,
                    environmentConstructorParam.paramName,
                    AUTH_PARAMETER_NAME);
        });
        return constructorBuilder.build();
    }

    private static MethodSpec createEnvironmentAuthOptionsConstructor(
            EnvironmentConstructorParam environmentConstructorParam,
            GeneratedAuthFiles generatedAuth,
            GeneratedClientOptions generatedClientOptions,
            GlobalHeaders globalHeaders,
            Map<String, GeneratedServiceClient> supplierFields,
            Map<String, ClassName> nestedClientFields) {
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(environmentConstructorParam.paramType, environmentConstructorParam.paramName)
                .addParameter(generatedAuth.getClassName(), AUTH_PARAMETER_NAME)
                .addParameters(globalHeaders.getRequiredGlobalHeaderParameters())
                .addParameter(generatedClientOptions.getClassName(), "options");
        KeyedStream.stream(supplierFields).forEach((fieldName, httpClient) -> {
            boolean hasAuthParameter = httpClient.javaFile().typeSpec.fieldSpecs.stream()
                    .anyMatch(fieldSpec -> fieldSpec.name.equals(AUTH_PARAMETER_NAME));
            if (hasAuthParameter) {
                constructorBuilder.addStatement(
                        "this.$L = $L(() -> new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L, $L, options")
                                + "))",
                        fieldName,
                        MEMOIZE_METHOD_NAME,
                        httpClient.getClassName(),
                        environmentConstructorParam.urlGetterCodeBlock,
                        AUTH_PARAMETER_NAME);
            } else {
                constructorBuilder.addStatement(
                        "this.$L = $L(() -> new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L, options")
                                + "))",
                        fieldName,
                        MEMOIZE_METHOD_NAME,
                        httpClient.getClassName(),
                        environmentConstructorParam.urlGetterCodeBlock);
            }
        });
        KeyedStream.stream(nestedClientFields).forEach((fieldName, nestedClientCLassName) -> {
            constructorBuilder.addStatement(
                    "this.$L = new $T(" + globalHeaders.suffixRequiredGlobalHeaderParams("$L, $L, options") + ")",
                    fieldName,
                    nestedClientCLassName,
                    environmentConstructorParam.paramName,
                    AUTH_PARAMETER_NAME);
        });
        return constructorBuilder.build();
    }

    private EnvironmentConstructorParam getEnvironmentConstructorParam() {
        if (maybeGeneratedEnvironmentsClass.isPresent()) {
            return new EnvironmentConstructorParam(
                    ENVIRONMENT_PARAMETER_NAME,
                    maybeGeneratedEnvironmentsClass.get().getClassName(),
                    CodeBlock.of(
                                    "$L.$N()",
                                    ENVIRONMENT_PARAMETER_NAME,
                                    maybeGeneratedEnvironmentsClass.get().getUrlMethod())
                            .toString());
        } else {
            return new EnvironmentConstructorParam(URL_PARAMETER_NAME, ClassName.get(String.class), URL_PARAMETER_NAME);
        }
    }

    private static class EnvironmentConstructorParam {
        private final String paramName;
        private final ClassName paramType;
        private final String urlGetterCodeBlock;

        private EnvironmentConstructorParam(String paramName, ClassName paramType, String urlGetterCodeBlock) {
            this.paramName = paramName;
            this.paramType = paramType;
            this.urlGetterCodeBlock = urlGetterCodeBlock;
        }
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
        Map<String, NestedClient> nestedClients = new HashMap<>();
        for (GeneratedServiceClient generatedHttpServiceClient : serviceClients) {
            FernFilepath fernFilepath =
                    generatedHttpServiceClient.httpService().getName().getFernFilepath();
            if (fernFilepath.get().size() <= fernFilePathSize) {
                clientConfigBuilder.addGeneratedServiceClients(generatedHttpServiceClient);
            } else {
                StringWithAllCasings prefixCasings = fernFilepath.get().get(fernFilePathSize);
                String prefix = prefixCasings.getOriginalValue();
                if (nestedClients.containsKey(prefix)) {
                    nestedClients.get(prefix).clients.add(generatedHttpServiceClient);
                } else {
                    List<GeneratedServiceClient> clients = new ArrayList<>();
                    clients.add(generatedHttpServiceClient);
                    nestedClients.put(prefix, new NestedClient(prefixCasings, clients));
                }
            }
        }
        KeyedStream.stream(nestedClients).forEach((prefix, prefixedClients) -> {
            ClassName nestedClientClassName = generatorContext
                    .getPoetClassNameFactory()
                    .getTopLevelClassName(prefixedClients.prefixCasings.getPascalCase() + "Client");
            ClientConfig nestedClientConfig =
                    createClientConfig(prefixedClients.clients, fernFilePathSize + 1, nestedClientClassName);
            clientConfigBuilder.putNestedClients(prefix, nestedClientConfig);
        });
        return clientConfigBuilder.build();
    }

    private static class NestedClient {
        private final StringWithAllCasings prefixCasings;
        private final List<GeneratedServiceClient> clients;

        private NestedClient(StringWithAllCasings prefixCasings, List<GeneratedServiceClient> clients) {
            this.prefixCasings = prefixCasings;
            this.clients = clients;
        }
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
