/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
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

import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.BasicAuthScheme;
import com.fern.ir.model.auth.BearerAuthScheme;
import com.fern.ir.model.auth.EnvironmentVariable;
import com.fern.ir.model.auth.HeaderAuthScheme;
import com.fern.ir.model.auth.OAuthClientCredentials;
import com.fern.ir.model.auth.OAuthConfiguration;
import com.fern.ir.model.auth.OAuthScheme;
import com.fern.ir.model.commons.EndpointReference;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.ir.Subpackage;
import com.fern.ir.model.types.Literal;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.SingleUrlEnvironmentClass;
import com.fern.java.client.GeneratedRootClient;
import com.fern.java.client.generators.AbstractClientGeneratorUtils.Result;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.fern.java.utils.CasingUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import okhttp3.OkHttpClient;

public abstract class AbstractRootClientGenerator extends AbstractFileGenerator {

    private static final String CLIENT_OPTIONS_BUILDER_NAME = "clientOptionsBuilder";
    private static final String ENVIRONMENT_FIELD_NAME = "environment";
    protected final GeneratedObjectMapper generatedObjectMapper;
    protected final ClientGeneratorContext clientGeneratorContext;
    protected final GeneratedClientOptions generatedClientOptions;
    protected final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final Optional<GeneratedJavaFile> generatedOAuthTokenSupplier;
    protected final GeneratedJavaFile generatedSuppliersFile;
    protected final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final ClassName builderName;
    protected final GeneratedJavaFile requestOptionsFile;
    protected final Map<ErrorId, GeneratedJavaFile> generatedErrors;

    public AbstractRootClientGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            GeneratedObjectMapper generatedObjectMapper,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedJavaFile generatedSuppliersFile,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            GeneratedJavaFile requestOptionsFile,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            Optional<GeneratedJavaFile> generatedOAuthTokenSupplier,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getRootClassName(clientGeneratorContext
                                .getCustomConfig()
                                .clientClassName()
                                .orElseGet(() -> getRootClientName(generatorContext))),
                generatorContext);
        this.generatedObjectMapper = generatedObjectMapper;
        this.clientGeneratorContext = clientGeneratorContext;
        this.generatedClientOptions = generatedClientOptions;
        this.generatedSuppliersFile = generatedSuppliersFile;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.generatedOAuthTokenSupplier = generatedOAuthTokenSupplier;
        this.generatedErrors = generatedErrors;
        this.builderName = builderName();
        this.requestOptionsFile = requestOptionsFile;
    }

    protected abstract AbstractClientGeneratorUtils clientGeneratorUtils();

    protected abstract ClassName className();

    protected abstract ClassName rawClientName();

    protected abstract ClassName builderName();

    @Override
    public GeneratedRootClient generateFile() {
        AbstractClientGeneratorUtils clientGeneratorUtils = clientGeneratorUtils();
        Result result = clientGeneratorUtils.buildClients();

        TypeSpec builderTypeSpec = getClientBuilder();

        result.getClientImpl()
                .addMethod(MethodSpec.methodBuilder("builder")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .returns(builderName)
                        .addStatement("return new $T()", builderName)
                        .build());

        return GeneratedRootClient.builder()
                .className(className())
                .javaFile(JavaFile.builder(
                                className.packageName(), result.getClientImpl().build())
                        .build())
                .builderClass(GeneratedJavaFile.builder()
                        .className(builderName)
                        .javaFile(JavaFile.builder(builderName.packageName(), builderTypeSpec)
                                .build())
                        .build())
                .rawClient(result.getRawClientImpl().map(rawClient -> GeneratedJavaFile.builder()
                        .className(rawClientName())
                        .javaFile(JavaFile.builder(className.packageName(), rawClient.build())
                                .build())
                        .build()))
                .addAllWrappedRequests(result.getGeneratedWrappedRequests())
                .build();
    }

    private TypeSpec getClientBuilder() {
        TypeSpec.Builder clientBuilder = TypeSpec.classBuilder(builderName).addModifiers(Modifier.PUBLIC);
        MethodSpec.Builder buildMethod =
                MethodSpec.methodBuilder("build").addModifiers(Modifier.PUBLIC).returns(className());

        clientBuilder.addField(FieldSpec.builder(generatedClientOptions.builderClassName(), CLIENT_OPTIONS_BUILDER_NAME)
                .addModifiers(Modifier.PRIVATE)
                .initializer("$T.builder()", generatedClientOptions.getClassName())
                .build());

        FieldSpec.Builder environmentFieldBuilder = FieldSpec.builder(
                        generatedEnvironmentsClass.getClassName(), ENVIRONMENT_FIELD_NAME)
                .addModifiers(Modifier.PRIVATE);

        AuthSchemeHandler authSchemeHandler = new AuthSchemeHandler(clientBuilder, buildMethod);
        generatorContext.getResolvedAuthSchemes().forEach(authScheme -> authScheme.visit(authSchemeHandler));
        generatorContext.getIr().getHeaders().forEach(httpHeader -> {
            authSchemeHandler.visitNonAuthHeader(HeaderAuthScheme.builder()
                    .name(httpHeader.getName())
                    .valueType(httpHeader.getValueType())
                    .docs(httpHeader.getDocs())
                    .build());
        });

        if (generatedEnvironmentsClass.defaultEnvironmentConstant().isPresent()) {
            environmentFieldBuilder.initializer(
                    "$T.$L",
                    generatedEnvironmentsClass.getClassName(),
                    generatedEnvironmentsClass.defaultEnvironmentConstant().get());
        }
        if (generatedEnvironmentsClass.optionsPresent()) {
            MethodSpec environmentMethod = MethodSpec.methodBuilder("environment")
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(generatedEnvironmentsClass.getClassName(), "environment")
                    .returns(builderName)
                    .build();
            clientBuilder.addMethod(environmentMethod.toBuilder()
                    .addStatement("this.$L = $L", ENVIRONMENT_FIELD_NAME, "environment")
                    .addStatement("return this")
                    .build());
        }

        FieldSpec environmentField = environmentFieldBuilder.build();
        clientBuilder.addField(environmentField);

        if (generatedEnvironmentsClass.info() instanceof SingleUrlEnvironmentClass) {
            SingleUrlEnvironmentClass singleUrlEnvironmentClass =
                    ((SingleUrlEnvironmentClass) generatedEnvironmentsClass.info());
            MethodSpec urlMethod = MethodSpec.methodBuilder("url")
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(String.class, "url")
                    .returns(builderName)
                    .build();
            clientBuilder.addMethod(urlMethod.toBuilder()
                    .addStatement(
                            "this.$L = $T.$N($L)",
                            ENVIRONMENT_FIELD_NAME,
                            generatedEnvironmentsClass.getClassName(),
                            singleUrlEnvironmentClass.getCustomMethod(),
                            "url")
                    .addStatement("return this")
                    .build());
        }

        clientBuilder.addMethod(MethodSpec.methodBuilder("timeout")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Sets the timeout (in seconds) for the client. Defaults to 60 seconds.")
                .addParameter(int.class, "timeout")
                .returns(builderName)
                .addStatement("this.$L.timeout(timeout)", CLIENT_OPTIONS_BUILDER_NAME)
                .addStatement("return this")
                .build());

        clientBuilder.addMethod(MethodSpec.methodBuilder("maxRetries")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Sets the maximum number of retries for the client. Defaults to 2 retries.")
                .addParameter(int.class, "maxRetries")
                .returns(builderName)
                .addStatement("this.$L.maxRetries(maxRetries)", CLIENT_OPTIONS_BUILDER_NAME)
                .addStatement("return this")
                .build());

        clientBuilder.addMethod(MethodSpec.methodBuilder("httpClient")
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Sets the underlying OkHttp client")
                .returns(builderName)
                .addParameter(OkHttpClient.class, "httpClient")
                .addStatement("this.$L.httpClient(httpClient)", CLIENT_OPTIONS_BUILDER_NAME)
                .addStatement("return this")
                .build());

        generatorContext.getIr().getVariables().stream()
                .map(variableDeclaration -> {
                    String variableName =
                            variableDeclaration.getName().getCamelCase().getSafeName();
                    return MethodSpec.methodBuilder(variableName)
                            .addModifiers(Modifier.PUBLIC)
                            .returns(builderName)
                            .addParameter(
                                    generatorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, variableDeclaration.getType()),
                                    variableName)
                            .addStatement(
                                    "$L.$N($L)",
                                    CLIENT_OPTIONS_BUILDER_NAME,
                                    generatedClientOptions.variableGetters().get(variableDeclaration.getId()),
                                    variableName)
                            .addStatement("return this")
                            .build();
                })
                .forEach(clientBuilder::addMethod);

        MethodSpec buildClientOptionsMethod = MethodSpec.methodBuilder("buildClientOptions")
                .addModifiers(Modifier.PROTECTED)
                .returns(generatedClientOptions.getClassName())
                .addStatement(
                        "$L.$N(this.$N)",
                        CLIENT_OPTIONS_BUILDER_NAME,
                        generatedClientOptions.environment(),
                        environmentField)
                .addStatement("return $L.build()", CLIENT_OPTIONS_BUILDER_NAME)
                .build();
        clientBuilder.addMethod(buildClientOptionsMethod);

        clientBuilder.addMethod(buildMethod
                .addStatement("return new $T(buildClientOptions())", className())
                .build());

        return clientBuilder.build();
    }

    private static String getRootClientName(AbstractGeneratorContext<?, ?> generatorContext) {
        return getRootClientPrefix(generatorContext) + "Client";
    }

    private static String getRootClientPrefix(AbstractGeneratorContext<?, ?> generatorContext) {
        return CasingUtils.convertKebabCaseToUpperCamelCase(
                        generatorContext.getGeneratorConfig().getOrganization())
                + CasingUtils.convertKebabCaseToUpperCamelCase(
                        generatorContext.getGeneratorConfig().getWorkspaceName());
    }

    private final class AuthSchemeHandler implements AuthScheme.Visitor<Void> {

        private final TypeSpec.Builder clientBuilder;
        private final MethodSpec.Builder buildMethod;
        private final boolean isMandatory;

        private AuthSchemeHandler(TypeSpec.Builder clientBuilder, MethodSpec.Builder buildMethod) {
            this.clientBuilder = clientBuilder;
            this.buildMethod = buildMethod;
            this.isMandatory = clientGeneratorContext.getIr().getSdkConfig().getIsAuthMandatory();
        }

        @Override
        public Void visitBearer(BearerAuthScheme bearer) {
            String fieldName = bearer.getToken().getCamelCase().getSafeName();
            createSetter(fieldName, bearer.getTokenEnvVar(), Optional.empty());
            if (isMandatory) {
                this.buildMethod
                        .beginControlFlow("if ($L == null)", fieldName)
                        .addStatement(
                                "throw new RuntimeException($S)",
                                bearer.getTokenEnvVar().isEmpty()
                                        ? getErrorMessage(fieldName)
                                        : getErrorMessage(
                                                fieldName,
                                                bearer.getTokenEnvVar().get()))
                        .endControlFlow();
            }
            this.buildMethod.addStatement(
                    "this.$L.addHeader($S, $S + this.$L)",
                    CLIENT_OPTIONS_BUILDER_NAME,
                    "Authorization",
                    "Bearer ",
                    fieldName);
            return null;
        }

        @Override
        public Void visitBasic(BasicAuthScheme basic) {
            // username
            String usernameFieldName = basic.getUsername().getCamelCase().getSafeName();
            FieldSpec.Builder usernameField =
                    FieldSpec.builder(String.class, usernameFieldName).addModifiers(Modifier.PRIVATE);
            if (basic.getUsernameEnvVar().isPresent()) {
                usernameField.initializer(
                        "System.getenv($S)", basic.getUsernameEnvVar().get().get());
            } else {
                usernameField.initializer("null");
            }
            this.clientBuilder.addField(usernameField.build());

            // password
            String passwordFieldName = basic.getPassword().getCamelCase().getSafeName();
            FieldSpec.Builder passwordField =
                    FieldSpec.builder(String.class, passwordFieldName).addModifiers(Modifier.PRIVATE);
            if (basic.getPasswordEnvVar().isPresent()) {
                passwordField.initializer(
                        "System.getenv($S)", basic.getPasswordEnvVar().get().get());
            } else {
                passwordField.initializer("null");
            }
            this.clientBuilder.addField(passwordField.build());

            // add setter method
            ParameterSpec usernameParam =
                    ParameterSpec.builder(String.class, usernameFieldName).build();
            ParameterSpec passwordParam =
                    ParameterSpec.builder(String.class, passwordFieldName).build();
            this.clientBuilder.addMethod(MethodSpec.methodBuilder("credentials")
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(usernameParam)
                    .addParameter(passwordParam)
                    .addStatement("this.$L = $L", usernameFieldName, usernameFieldName)
                    .addStatement("this.$L = $L", passwordFieldName, passwordFieldName)
                    .addStatement("return this")
                    .returns(builderName)
                    .build());

            if (isMandatory) {
                this.buildMethod
                        .beginControlFlow("if (this.$L == null)", usernameFieldName)
                        .addStatement(
                                "throw new RuntimeException($S)",
                                basic.getUsernameEnvVar().isEmpty()
                                        ? getErrorMessage(usernameFieldName)
                                        : getErrorMessage(
                                                usernameFieldName,
                                                basic.getUsernameEnvVar().get()))
                        .endControlFlow();
                this.buildMethod
                        .beginControlFlow("if (this.$L == null)", passwordFieldName)
                        .addStatement(
                                "throw new RuntimeException($S)",
                                basic.getPasswordEnvVar().isEmpty()
                                        ? getErrorMessage(passwordFieldName)
                                        : getErrorMessage(
                                                passwordFieldName,
                                                basic.getPasswordEnvVar().get()))
                        .endControlFlow();
            }

            this.buildMethod
                    .addStatement(
                            "String unencodedToken = $L + \":\" + $L",
                            basic.getUsername().getCamelCase().getSafeName(),
                            basic.getPassword().getCamelCase().getSafeName())
                    .addStatement(
                            "String encodedToken = $T.getEncoder().encodeToString(unencodedToken.getBytes())",
                            Base64.class)
                    .addStatement(
                            "this.$L.addHeader($S, $S + $L)",
                            CLIENT_OPTIONS_BUILDER_NAME,
                            "Authorization",
                            "Bearer ",
                            "encodedToken");
            return null;
        }

        @Override
        public Void visitHeader(HeaderAuthScheme header) {
            return visitHeaderBase(header, true);
        }

        @Override
        public Void visitOauth(OAuthScheme oauth) {
            return oauth.getConfiguration().visit(new OAuthSchemeHandler());
        }

        public class OAuthSchemeHandler implements OAuthConfiguration.Visitor<Void> {

            @Override
            public Void visitClientCredentials(OAuthClientCredentials clientCredentials) {
                EndpointReference tokenEndpointReference =
                        clientCredentials.getTokenEndpoint().getEndpointReference();

                createSetter("clientId", clientCredentials.getClientIdEnvVar(), Optional.empty());
                createSetter("clientSecret", clientCredentials.getClientSecretEnvVar(), Optional.empty());

                Subpackage subpackage = clientGeneratorContext
                        .getIr()
                        .getSubpackages()
                        .get(tokenEndpointReference.getSubpackageId().get());
                ClassName authClientClassName =
                        clientGeneratorContext.getPoetClassNameFactory().getClientClassName(subpackage);
                ClassName oauthTokenSupplierClassName =
                        generatedOAuthTokenSupplier.get().getClassName();
                buildMethod
                        .addStatement(
                                "$T authClient = new $T($T.builder().environment(this.$L).build())",
                                authClientClassName,
                                authClientClassName,
                                generatedClientOptions.getClassName(),
                                ENVIRONMENT_FIELD_NAME)
                        .addStatement(
                                "$T oAuthTokenSupplier = new $T(clientId, clientSecret, authClient)",
                                oauthTokenSupplierClassName,
                                oauthTokenSupplierClassName)
                        .addStatement(
                                "this.$L.addHeader($S, oAuthTokenSupplier)",
                                CLIENT_OPTIONS_BUILDER_NAME,
                                "Authorization");
                return null;
            }

            @Override
            public Void _visitUnknown(Object unknownType) {
                throw new RuntimeException("Encountered unknown oauth scheme" + unknownType);
            }
        }

        public Void visitNonAuthHeader(HeaderAuthScheme header) {
            return visitHeaderBase(header, false);
        }

        public Void visitHeaderBase(HeaderAuthScheme header, Boolean respectMandatoryAuth) {
            String fieldName = header.getName().getName().getCamelCase().getSafeName();
            // Never not create a setter or a null check if it's a literal
            if ((respectMandatoryAuth && isMandatory)
                    || !(header.getValueType().isContainer()
                            && header.getValueType().getContainer().get().isLiteral())) {
                createSetter(fieldName, header.getHeaderEnvVar(), Optional.empty());
                if ((respectMandatoryAuth && isMandatory)
                        || !(header.getValueType().isContainer()
                                && header.getValueType().getContainer().get().isOptional())) {
                    this.buildMethod
                            .beginControlFlow("if ($L == null)", fieldName)
                            .addStatement(
                                    "throw new RuntimeException($S)",
                                    header.getHeaderEnvVar().isEmpty()
                                            ? getErrorMessage(fieldName)
                                            : getErrorMessage(
                                                    fieldName,
                                                    header.getHeaderEnvVar().get()))
                            .endControlFlow();
                }
            } else {
                Literal literal =
                        header.getValueType().getContainer().get().getLiteral().get();

                createSetter(fieldName, header.getHeaderEnvVar(), Optional.of(literal));
            }

            Boolean shouldWrapInConditional = header.getValueType().isContainer()
                    && header.getValueType().getContainer().get().isOptional();
            MethodSpec.Builder maybeConditionalAdditionFlow = this.buildMethod;
            // If the header is optional, wrap the add in a presence check so it does not get added unless it's non-null
            if (shouldWrapInConditional) {
                maybeConditionalAdditionFlow = this.buildMethod.beginControlFlow("if ($L != null)", fieldName);
            }

            if (header.getPrefix().isPresent()) {
                maybeConditionalAdditionFlow = maybeConditionalAdditionFlow.addStatement(
                        "this.$L.addHeader($S, $S + this.$L)",
                        CLIENT_OPTIONS_BUILDER_NAME,
                        header.getName().getWireValue(),
                        header.getPrefix().get(),
                        fieldName);
            } else {
                maybeConditionalAdditionFlow = maybeConditionalAdditionFlow.addStatement(
                        "this.$L.addHeader($S, this.$L)",
                        CLIENT_OPTIONS_BUILDER_NAME,
                        header.getName().getWireValue(),
                        fieldName);
            }

            if (shouldWrapInConditional) {
                maybeConditionalAdditionFlow.endControlFlow();
            }
            return null;
        }

        private void createSetter(
                String fieldName, Optional<EnvironmentVariable> environmentVariable, Optional<Literal> literal) {
            FieldSpec.Builder field = FieldSpec.builder(String.class, fieldName).addModifiers(Modifier.PRIVATE);
            if (environmentVariable.isPresent()) {
                field.initializer("System.getenv($S)", environmentVariable.get().get());
            } else if (literal.isPresent()) {
                literal.get().visit(new Literal.Visitor<Void>() {
                    @Override
                    public Void visitString(String string) {
                        field.initializer("$S", string);
                        return null;
                    }

                    // Convert bool headers to string
                    @Override
                    public Void visitBoolean(boolean boolean_) {
                        field.initializer("$S", boolean_);
                        return null;
                    }

                    @Override
                    public Void _visitUnknown(Object unknownType) {
                        return null;
                    }
                });
            } else {
                field.initializer("null");
            }
            clientBuilder.addField(field.build());

            MethodSpec.Builder setter = MethodSpec.methodBuilder(fieldName)
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(String.class, fieldName)
                    .returns(builderName)
                    .addJavadoc("Sets $L", fieldName)
                    .addStatement("this.$L = $L", fieldName, fieldName)
                    .addStatement("return this");
            if (environmentVariable.isPresent()) {
                setter.addJavadoc(
                        ".\nDefaults to the $L environment variable.",
                        environmentVariable.get().get());
            }
            clientBuilder.addMethod(setter.build());
        }

        private String getErrorMessage(String fieldName) {
            return "Please provide " + fieldName;
        }

        private String getErrorMessage(String fieldName, EnvironmentVariable environmentVariable) {
            return "Please provide " + fieldName + " or set the " + environmentVariable.get() + " "
                    + "environment variable.";
        }

        @Override
        public Void _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown auth scheme");
        }
    }
}
