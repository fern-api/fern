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

import com.fern.ir.v9.model.environment.EnvironmentId;
import com.fern.ir.v9.model.environment.Environments;
import com.fern.ir.v9.model.environment.EnvironmentsConfig;
import com.fern.ir.v9.model.environment.SingleBaseUrlEnvironment;
import com.fern.ir.v9.model.environment.SingleBaseUrlEnvironments;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.generators.AbstractFileGenerator;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public final class EnvironmentGenerator extends AbstractFileGenerator {

    public static final String GET_URL = "getUrl";

    private static final String URL_FIELD_NAME = "url";

    public EnvironmentGenerator(AbstractGeneratorContext<?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName("Environment"), generatorContext);
    }

    @Override
    public GeneratedEnvironmentsClass generateFile() {
        MethodSpec getUrlMethod = MethodSpec.methodBuilder(GET_URL)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return this.$L", URL_FIELD_NAME)
                .build();

        TypeSpec.Builder environmentsBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(FieldSpec.builder(String.class, URL_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .addParameter(String.class, URL_FIELD_NAME)
                        .addStatement("this.$L = $L", URL_FIELD_NAME, URL_FIELD_NAME)
                        .build())
                .addMethod(getUrlMethod);

        boolean optionsPresent = false;
        Optional<String> defaultEnvironmentConstant = Optional.empty();
        if (generatorContext.getIr().getEnvironments().isPresent()) {
            Environments environments =
                    generatorContext.getIr().getEnvironments().get().getEnvironments();
            if (environments.isMultipleBaseUrls()) {
                throw new RuntimeException("Multiple base URL environments are not supported!");
            }

            SingleBaseUrlEnvironments singleBaseUrlEnvironment =
                    environments.getSingleBaseUrl().get();

            Optional<EnvironmentId> defaultEnvironmentId =
                    generatorContext.getIr().getEnvironments().flatMap(EnvironmentsConfig::getDefaultEnvironment);

            for (SingleBaseUrlEnvironment environment : singleBaseUrlEnvironment.getEnvironments()) {
                optionsPresent = true;
                String constant = environment.getName().getScreamingSnakeCase().getSafeName();
                environmentsBuilder.addField(
                        FieldSpec.builder(className, constant, Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                                .initializer("new $T($S)", className, environment.getUrl())
                                .build());
                if (defaultEnvironmentId.isPresent()
                        && defaultEnvironmentId.get().equals(environment.getId())) {
                    defaultEnvironmentConstant = Optional.of(constant);
                }
            }
        }

        MethodSpec customMethod = MethodSpec.methodBuilder("custom")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(className)
                .addParameter(String.class, URL_FIELD_NAME)
                .addStatement("return new $T($L)", className, URL_FIELD_NAME)
                .build();
        TypeSpec environmentsTypeSpec =
                environmentsBuilder.addMethod(customMethod).build();
        JavaFile environmentsFile =
                JavaFile.builder(className.packageName(), environmentsTypeSpec).build();
        return GeneratedEnvironmentsClass.builder()
                .className(className)
                .javaFile(environmentsFile)
                .urlMethod(getUrlMethod)
                .customMethod(customMethod)
                .optionsPresent(optionsPresent)
                .defaultEnvironmentConstant(defaultEnvironmentConstant)
                .build();
    }
}
