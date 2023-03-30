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

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.generators.AbstractFileGenerator;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.HashMap;
import java.util.Map;
import javax.lang.model.element.Modifier;
import okhttp3.OkHttpClient;

public final class ClientOptionsGenerator extends AbstractFileGenerator {

    private static final String CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";

    private static final FieldSpec URL_FIELD = FieldSpec.builder(String.class, "url", Modifier.PRIVATE, Modifier.FINAL)
            .build();
    private static final FieldSpec HEADERS_FIELD = FieldSpec.builder(
                    ParameterizedTypeName.get(Map.class, String.class, String.class),
                    "headers",
                    Modifier.PRIVATE,
                    Modifier.FINAL)
            .build();
    private static final FieldSpec OKHTTP_CLIENT_FIELD = FieldSpec.builder(
                    OkHttpClient.class, "httpClient", Modifier.PRIVATE, Modifier.FINAL)
            .build();

    private final ClassName builderClassName;

    public ClientOptionsGenerator(AbstractGeneratorContext<?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName(CLIENT_OPTIONS_CLASS_NAME), generatorContext);
        this.builderClassName = className.nestedClass("Builder");
    }

    @Override
    public GeneratedClientOptions generateFile() {
        MethodSpec urlGetter = createGetter(URL_FIELD);
        MethodSpec headersGetter = createGetter(HEADERS_FIELD);
        MethodSpec httpClientGetter = createGetter(OKHTTP_CLIENT_FIELD);
        TypeSpec clientOptionsTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(URL_FIELD)
                .addField(HEADERS_FIELD)
                .addField(OKHTTP_CLIENT_FIELD)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .addParameter(ParameterSpec.builder(URL_FIELD.type, URL_FIELD.name)
                                .build())
                        .addParameter(ParameterSpec.builder(HEADERS_FIELD.type, HEADERS_FIELD.name)
                                .build())
                        .addParameter(ParameterSpec.builder(OKHTTP_CLIENT_FIELD.type, OKHTTP_CLIENT_FIELD.name)
                                .build())
                        .addStatement("this.$L = $L", URL_FIELD.name, URL_FIELD.name)
                        .addStatement("this.$L = $L", HEADERS_FIELD.name, HEADERS_FIELD.name)
                        .addStatement("this.$L = $L", OKHTTP_CLIENT_FIELD.name, OKHTTP_CLIENT_FIELD.name)
                        .build())
                .addMethod(urlGetter)
                .addMethod(headersGetter)
                .addMethod(httpClientGetter)
                .addMethod(MethodSpec.methodBuilder("builder")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .returns(builderClassName)
                        .addStatement("return new $T()", builderClassName)
                        .build())
                .addType(createBuilder())
                .build();
        JavaFile environmentsFile =
                JavaFile.builder(className.packageName(), clientOptionsTypeSpec).build();
        return GeneratedClientOptions.builder()
                .className(className)
                .javaFile(environmentsFile)
                .url(urlGetter)
                .headers(headersGetter)
                .httpClient(httpClientGetter)
                .builderClassName(builderClassName)
                .build();
    }

    private TypeSpec createBuilder() {
        return TypeSpec.classBuilder(builderClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .addField(FieldSpec.builder(URL_FIELD.type, URL_FIELD.name)
                        .addModifiers(Modifier.PRIVATE)
                        .build())
                .addField(HEADERS_FIELD.toBuilder()
                        .initializer("new $T<>()", HashMap.class)
                        .build())
                .addMethod(getUrlBuilder())
                .addMethod(getHeaderBuilder())
                .addMethod(getBuildMethod())
                .build();
    }

    private MethodSpec getUrlBuilder() {
        return MethodSpec.methodBuilder(URL_FIELD.name)
                .addModifiers(Modifier.PUBLIC)
                .returns(builderClassName)
                .addParameter(String.class, URL_FIELD.name)
                .addStatement("this.$L = $L", URL_FIELD.name, URL_FIELD.name)
                .addStatement("return this")
                .build();
    }

    private MethodSpec getHeaderBuilder() {
        return MethodSpec.methodBuilder("addHeader")
                .addModifiers(Modifier.PUBLIC)
                .returns(builderClassName)
                .addParameter(String.class, "key")
                .addParameter(String.class, "value")
                .addStatement("this.$L.put($L, $L)", HEADERS_FIELD.name, "key", "value")
                .addStatement("return this")
                .build();
    }

    private MethodSpec getBuildMethod() {
        return MethodSpec.methodBuilder("build")
                .addModifiers(Modifier.PUBLIC)
                .returns(className)
                .addStatement(
                        "return new $T($L, $L, new $T())",
                        className,
                        URL_FIELD.name,
                        HEADERS_FIELD.name,
                        OkHttpClient.class)
                .build();
    }

    private static MethodSpec createGetter(FieldSpec fieldSpec) {
        return MethodSpec.methodBuilder(fieldSpec.name)
                .addModifiers(Modifier.PUBLIC)
                .returns(fieldSpec.type)
                .addStatement("return this.$L", fieldSpec.name)
                .build();
    }
}
