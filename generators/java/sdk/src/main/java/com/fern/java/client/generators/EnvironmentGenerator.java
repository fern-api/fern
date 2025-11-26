package com.fern.java.client.generators;

import com.fern.ir.model.environment.EnvironmentBaseUrlId;
import com.fern.ir.model.environment.EnvironmentId;
import com.fern.ir.model.environment.EnvironmentUrl;
import com.fern.ir.model.environment.Environments;
import com.fern.ir.model.environment.EnvironmentsConfig;
import com.fern.ir.model.environment.MultipleBaseUrlsEnvironment;
import com.fern.ir.model.environment.MultipleBaseUrlsEnvironments;
import com.fern.ir.model.environment.SingleBaseUrlEnvironment;
import com.fern.ir.model.environment.SingleBaseUrlEnvironments;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.EnvironmentClassInfo;
import com.fern.java.client.GeneratedEnvironmentsClass.MultiUrlEnvironmentsClass;
import com.fern.java.client.GeneratedEnvironmentsClass.SingleUrlEnvironmentClass;
import com.fern.java.generators.AbstractFileGenerator;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class EnvironmentGenerator extends AbstractFileGenerator {

    public static final String GET_URL = "getUrl";

    private static final String URL_FIELD_NAME = "url";

    private final Optional<EnvironmentsConfig> maybeEnvironmentsConfig;

    private String defaultEnvironmentConstant;
    private boolean optionsPresent = false;

    public EnvironmentGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("Environment"), generatorContext);
        this.maybeEnvironmentsConfig = generatorContext.getIr().getEnvironments();
    }

    @Override
    public GeneratedEnvironmentsClass generateFile() {

        TypeSpec.Builder environmentsBuilder =
                TypeSpec.classBuilder(className).addModifiers(Modifier.PUBLIC, Modifier.FINAL);

        EnvironmentClassInfo environmentClassInfo = null;
        if (maybeEnvironmentsConfig.isPresent()) {
            EnvironmentsConfig environmentsConfig = maybeEnvironmentsConfig.get();
            EnvironmentsHandler environmentsHandler =
                    new EnvironmentsHandler(environmentsBuilder, environmentsConfig.getDefaultEnvironment());
            environmentClassInfo = environmentsConfig.getEnvironments().visit(environmentsHandler);
        } else {
            MethodSpec urlGetMethod = urlGetMethod();
            MethodSpec customUrlFactoryMethod = customUrlFactoryMethod();
            environmentsBuilder
                    .addField(urlField())
                    .addMethod(urlConstructorMethod())
                    .addMethod(urlGetMethod)
                    .addMethod(customUrlFactoryMethod);
            environmentClassInfo = SingleUrlEnvironmentClass.builder()
                    .urlMethod(urlGetMethod)
                    .customMethod(customUrlFactoryMethod)
                    .build();
        }

        TypeSpec environmentsTypeSpec = environmentsBuilder.build();
        JavaFile environmentsFile =
                JavaFile.builder(className.packageName(), environmentsTypeSpec).build();
        return GeneratedEnvironmentsClass.builder()
                .className(className)
                .javaFile(environmentsFile)
                .optionsPresent(optionsPresent)
                .info(environmentClassInfo)
                .defaultEnvironmentConstant(Optional.ofNullable(defaultEnvironmentConstant))
                .build();
    }

    public final class EnvironmentsHandler implements Environments.Visitor<EnvironmentClassInfo> {

        private final TypeSpec.Builder environmentsBuilder;
        private final Optional<EnvironmentId> defaultEnvironmentId;

        private EnvironmentsHandler(
                TypeSpec.Builder environmentsClassBuilder, Optional<EnvironmentId> defaultEnvironmentId) {
            this.environmentsBuilder = environmentsClassBuilder;
            this.defaultEnvironmentId = defaultEnvironmentId;
        }

        @Override
        public EnvironmentClassInfo visitSingleBaseUrl(SingleBaseUrlEnvironments singleBaseUrl) {
            environmentsBuilder.addField(urlField()).addMethod(urlConstructorMethod());
            for (SingleBaseUrlEnvironment environment : singleBaseUrl.getEnvironments()) {
                optionsPresent = true;
                String constant = environment.getName().getScreamingSnakeCase().getSafeName();
                environmentsBuilder.addField(
                        FieldSpec.builder(className, constant, Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                                .initializer("new $T($S)", className, environment.getUrl())
                                .build());
                if (defaultEnvironmentId.isPresent()
                        && defaultEnvironmentId.get().equals(environment.getId())) {
                    defaultEnvironmentConstant = constant;
                }
            }
            MethodSpec urlGetMethod = urlGetMethod();
            MethodSpec customUrlFactoryMethod = customUrlFactoryMethod();
            environmentsBuilder.addMethod(urlGetMethod).addMethod(customUrlFactoryMethod);
            return SingleUrlEnvironmentClass.builder()
                    .urlMethod(urlGetMethod)
                    .customMethod(customUrlFactoryMethod)
                    .build();
        }

        @Override
        public EnvironmentClassInfo visitMultipleBaseUrls(MultipleBaseUrlsEnvironments multipleBaseUrls) {

            Map<EnvironmentBaseUrlId, MethodSpec> urlGetterMethods = new HashMap<>();

            MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder();

            multipleBaseUrls.getBaseUrls().forEach(environmentBaseUrlWithId -> {
                String urlCamelCase =
                        environmentBaseUrlWithId.getName().getCamelCase().getSafeName();
                String urlPascalCase =
                        environmentBaseUrlWithId.getName().getPascalCase().getSafeName();
                environmentsBuilder.addField(FieldSpec.builder(String.class, urlCamelCase)
                        .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                        .build());
                constructorBuilder
                        .addParameter(String.class, urlCamelCase)
                        .addStatement("this.$L = $L", urlCamelCase, urlCamelCase);

                MethodSpec urlGetterMethod = MethodSpec.methodBuilder("get" + urlPascalCase + "URL")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(String.class)
                        .addStatement("return this.$L", urlCamelCase)
                        .build();
                urlGetterMethods.put(environmentBaseUrlWithId.getId(), urlGetterMethod);
                environmentsBuilder.addMethod(urlGetterMethod);
            });

            environmentsBuilder.addMethod(constructorBuilder.build());

            for (MultipleBaseUrlsEnvironment environment : multipleBaseUrls.getEnvironments()) {
                optionsPresent = true;
                String args = multipleBaseUrls.getBaseUrls().stream()
                        .map(baseUrlWithId -> environment.getUrls().get(baseUrlWithId.getId()))
                        .map(EnvironmentUrl::get)
                        .map(url -> "\"" + url + "\"")
                        .collect(Collectors.joining(","));
                String constant = environment.getName().getOriginalName();
                environmentsBuilder.addField(
                        FieldSpec.builder(className, constant, Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                                .initializer("new $T(" + args + ")", className)
                                .build());
                if (defaultEnvironmentId.isPresent()
                        && defaultEnvironmentId.get().equals(environment.getId())) {
                    defaultEnvironmentConstant = constant;
                }
            }

            // Add custom() factory method and Builder class for multi-URL environments
            TypeSpec.Builder builderClassBuilder = TypeSpec.classBuilder("Builder")
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC);

            MethodSpec.Builder buildMethodBuilder = MethodSpec.methodBuilder("build")
                    .addModifiers(Modifier.PUBLIC)
                    .returns(className);

            StringBuilder buildArgs = new StringBuilder();
            multipleBaseUrls.getBaseUrls().forEach(environmentBaseUrlWithId -> {
                String urlCamelCase =
                        environmentBaseUrlWithId.getName().getCamelCase().getSafeName();

                // Add field to Builder
                builderClassBuilder.addField(FieldSpec.builder(String.class, urlCamelCase)
                        .addModifiers(Modifier.PRIVATE)
                        .build());

                // Add setter method to Builder
                builderClassBuilder.addMethod(MethodSpec.methodBuilder(urlCamelCase)
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(String.class, urlCamelCase)
                        .returns(className.nestedClass("Builder"))
                        .addStatement("this.$L = $L", urlCamelCase, urlCamelCase)
                        .addStatement("return this")
                        .build());

                if (buildArgs.length() > 0) {
                    buildArgs.append(", ");
                }
                buildArgs.append(urlCamelCase);
            });

            buildMethodBuilder.addStatement("return new $T(" + buildArgs.toString() + ")", className);
            builderClassBuilder.addMethod(buildMethodBuilder.build());

            environmentsBuilder.addType(builderClassBuilder.build());

            // Add static custom() factory method
            environmentsBuilder.addMethod(MethodSpec.methodBuilder("custom")
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .returns(className.nestedClass("Builder"))
                    .addStatement("return new Builder()")
                    .build());

            return MultiUrlEnvironmentsClass.builder()
                    .putAllUrlGetterMethods(urlGetterMethods)
                    .build();
        }

        @Override
        public EnvironmentClassInfo _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown type " + unknownType);
        }
    }

    private FieldSpec urlField() {
        return FieldSpec.builder(String.class, URL_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                .build();
    }

    private MethodSpec urlConstructorMethod() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(String.class, URL_FIELD_NAME)
                .addStatement("this.$L = $L", URL_FIELD_NAME, URL_FIELD_NAME)
                .build();
    }

    private MethodSpec urlGetMethod() {
        return MethodSpec.methodBuilder(GET_URL)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return this.$L", URL_FIELD_NAME)
                .build();
    }

    private MethodSpec customUrlFactoryMethod() {
        return MethodSpec.methodBuilder("custom")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(className)
                .addParameter(String.class, URL_FIELD_NAME)
                .addStatement("return new $T($L)", className, URL_FIELD_NAME)
                .build();
    }
}
