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
import com.fern.ir.model.auth.HeaderAuthScheme;
import com.fern.ir.model.http.HttpHeader;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class RequestOptionsGenerator extends AbstractFileGenerator {

    private static final String REQUEST_OPTIONS_CLASS_NAME = "RequestOptions";

    private static final FieldSpec HEADERS_FIELD = FieldSpec.builder(
                    ParameterizedTypeName.get(Map.class, String.class, String.class),
                    "headers",
                    Modifier.PRIVATE,
                    Modifier.FINAL)
            .build();

    private final ClassName builderClassName;

    public RequestOptionsGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(
                generatorContext.getPoetClassNameFactory().getCoreClassName(REQUEST_OPTIONS_CLASS_NAME),
                generatorContext);
        this.builderClassName = className.nestedClass("Builder");
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec.Builder requestOptionsTypeSpec =
                TypeSpec.classBuilder(className).addModifiers(Modifier.PUBLIC, Modifier.FINAL);
        TypeSpec.Builder builderTypeSpec =
                TypeSpec.classBuilder(builderClassName).addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL);

        CodeBlock.Builder getHeadersCodeBlock = CodeBlock.builder()
                .addStatement(
                        "$T headers = new $T<>()",
                        ParameterizedTypeName.get(Map.class, String.class, String.class),
                        HashMap.class);

        AuthSchemeHandler authSchemeHandler =
                new AuthSchemeHandler(requestOptionsTypeSpec, builderTypeSpec, getHeadersCodeBlock);
        List<AuthSchemeFieldAndMethods> fields = new ArrayList<>();
        for (AuthScheme authScheme : generatorContext.getIr().getAuth().getSchemes()) {
            AuthSchemeFieldAndMethods fieldAndMethods = authScheme.visit(authSchemeHandler);
            // TODO(dsinghvi): Support basic auth and remove null check
            if (fieldAndMethods != null) {
                fields.add(fieldAndMethods);
            }
        }
        for (HttpHeader httpHeader : generatorContext.getIr().getHeaders()) {
            AuthScheme authScheme = AuthScheme.header(HeaderAuthScheme.builder()
                    .name(httpHeader.getName())
                    .valueType(httpHeader.getValueType())
                    .build());
            fields.add(authScheme.visit(authSchemeHandler));
        }

        String constructorArgs =
                fields.stream().map(field -> field.builderField.name).collect(Collectors.joining(", "));
        builderTypeSpec.addMethod(MethodSpec.methodBuilder("build")
                .addModifiers(Modifier.PUBLIC)
                .addStatement("return new $T(" + constructorArgs + ")", className)
                .returns(className)
                .build());

        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameters(fields.stream()
                        .map(authSchemeFields -> ParameterSpec.builder(
                                        authSchemeFields.builderField.type, authSchemeFields.builderField.name)
                                .build())
                        .collect(Collectors.toList()));
        for (AuthSchemeFieldAndMethods authScheme : fields) {
            constructorBuilder.addStatement("this.$L = $L", authScheme.builderField.name, authScheme.builderField.name);
        }
        requestOptionsTypeSpec.addMethod(constructorBuilder.build());
        requestOptionsTypeSpec.addMethod(MethodSpec.methodBuilder("getHeaders")
                .addModifiers(Modifier.PUBLIC)
                .addCode(getHeadersCodeBlock.build())
                .addStatement("return $N", HEADERS_FIELD.name)
                .returns(HEADERS_FIELD.type)
                .build());
        requestOptionsTypeSpec.addMethod(MethodSpec.methodBuilder("builder")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addStatement("return new $T()", builderClassName)
                .returns(builderClassName)
                .build());
        requestOptionsTypeSpec.addType(builderTypeSpec.build());

        JavaFile requestOptionsFile = JavaFile.builder(className.packageName(), requestOptionsTypeSpec.build())
                .build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(requestOptionsFile)
                .build();
    }

    private class AuthSchemeFieldAndMethods {
        private final FieldSpec builderField;
        private final FieldSpec requestOptionsField;

        AuthSchemeFieldAndMethods(FieldSpec builderField, FieldSpec requestOptionsField) {
            this.builderField = builderField;
            this.requestOptionsField = requestOptionsField;
        }
    }

    private class AuthSchemeHandler implements AuthScheme.Visitor<AuthSchemeFieldAndMethods> {

        private final TypeSpec.Builder requestOptionsTypeSpec;
        private final TypeSpec.Builder builderTypeSpec;
        private final CodeBlock.Builder getHeadersCodeBlock;

        private AuthSchemeHandler(
                TypeSpec.Builder requestOptionsTypeSpec,
                TypeSpec.Builder builderTypeSpec,
                CodeBlock.Builder getHeadersCodeBlock) {
            this.requestOptionsTypeSpec = requestOptionsTypeSpec;
            this.builderTypeSpec = builderTypeSpec;
            this.getHeadersCodeBlock = getHeadersCodeBlock;
        }

        @Override
        public AuthSchemeFieldAndMethods visitBearer(BearerAuthScheme bearer) {
            FieldSpec builderField = FieldSpec.builder(
                            String.class, bearer.getToken().getCamelCase().getSafeName(), Modifier.PRIVATE)
                    .initializer("null")
                    .build();
            builderTypeSpec.addField(builderField);

            MethodSpec builderMethodSpec = MethodSpec.methodBuilder(
                            bearer.getToken().getCamelCase().getSafeName())
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(builderField.type, builderField.name)
                    .addStatement("this.$L = $L", builderField.name, builderField.name)
                    .addStatement("return this")
                    .returns(builderClassName)
                    .build();
            builderTypeSpec.addMethod(builderMethodSpec);

            FieldSpec requestOptionsField = FieldSpec.builder(
                            String.class,
                            bearer.getToken().getCamelCase().getSafeName(),
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build();
            requestOptionsTypeSpec.addField(requestOptionsField);

            getHeadersCodeBlock
                    .beginControlFlow("if (this.$N != null)", requestOptionsField)
                    .addStatement(
                            "$N.put($S, $S + this.$L)",
                            HEADERS_FIELD,
                            "Authorization",
                            "Bearer ",
                            requestOptionsField.name)
                    .endControlFlow();

            return new AuthSchemeFieldAndMethods(builderField, requestOptionsField);
        }

        @Override
        public AuthSchemeFieldAndMethods visitBasic(BasicAuthScheme basic) {
            return null;
        }

        @Override
        public AuthSchemeFieldAndMethods visitHeader(HeaderAuthScheme header) {
            FieldSpec builderField = FieldSpec.builder(
                            String.class,
                            header.getName().getName().getCamelCase().getSafeName(),
                            Modifier.PRIVATE)
                    .initializer("null")
                    .build();
            builderTypeSpec.addField(builderField);

            MethodSpec builderMethodSpec = MethodSpec.methodBuilder(
                            header.getName().getName().getCamelCase().getSafeName())
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(builderField.type, builderField.name)
                    .addStatement("this.$L = $L", builderField.name, builderField.name)
                    .addStatement("return this")
                    .returns(builderClassName)
                    .build();
            builderTypeSpec.addMethod(builderMethodSpec);

            FieldSpec requestOptionsField = FieldSpec.builder(
                            String.class,
                            header.getName().getName().getCamelCase().getSafeName(),
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build();
            requestOptionsTypeSpec.addField(requestOptionsField);

            getHeadersCodeBlock
                    .beginControlFlow("if (this.$N != null)", requestOptionsField)
                    .addStatement(
                            "$N.put($S, $L)",
                            HEADERS_FIELD,
                            header.getName().getWireValue(),
                            header.getPrefix()
                                    .map(prefix -> "\"" + prefix + " \"" + "this."
                                            + header.getName()
                                                    .getName()
                                                    .getCamelCase()
                                                    .getSafeName())
                                    .orElseGet(() -> "this."
                                            + header.getName()
                                                    .getName()
                                                    .getCamelCase()
                                                    .getSafeName()))
                    .endControlFlow();

            return new AuthSchemeFieldAndMethods(builderField, requestOptionsField);
        }

        @Override
        public AuthSchemeFieldAndMethods _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown auth scheme");
        }
    }
}
