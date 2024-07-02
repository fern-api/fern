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
import com.fern.ir.model.auth.OAuthScheme;
import com.fern.ir.model.commons.NameAndWireValue;
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
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class RequestOptionsGenerator extends AbstractFileGenerator {

    private static final FieldSpec HEADERS_FIELD = FieldSpec.builder(
                    ParameterizedTypeName.get(Map.class, String.class, String.class),
                    "headers",
                    Modifier.PRIVATE,
                    Modifier.FINAL)
            .build();

    private final List<HttpHeader> additionalHeaders;
    private final ClassName builderClassName;

    public RequestOptionsGenerator(AbstractGeneratorContext<?, ?> generatorContext, ClassName className) {
        this(generatorContext, className, Collections.emptyList());
    }

    public RequestOptionsGenerator(
            AbstractGeneratorContext<?, ?> generatorContext, ClassName className, List<HttpHeader> additionalHeaders) {
        super(className, generatorContext);
        this.builderClassName = className.nestedClass("Builder");
        this.additionalHeaders = additionalHeaders;
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
        HeaderHandler headerHandler = new HeaderHandler(requestOptionsTypeSpec, builderTypeSpec, getHeadersCodeBlock);
        AuthSchemeHandler authSchemeHandler =
                new AuthSchemeHandler(requestOptionsTypeSpec, builderTypeSpec, getHeadersCodeBlock, headerHandler);
        List<RequestOption> fields = new ArrayList<>();
        for (AuthScheme authScheme : generatorContext.getResolvedAuthSchemes()) {
            RequestOption fieldAndMethods = authScheme.visit(authSchemeHandler);
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

        for (HttpHeader httpHeader : this.additionalHeaders) {
            fields.add(headerHandler.visitHeader(httpHeader));
        }

        FieldSpec.Builder timeoutFieldBuilder = FieldSpec.builder(
                ParameterizedTypeName.get(ClassName.get(Optional.class), TypeName.get(Integer.class)),
                "timeout",
                Modifier.PRIVATE);

        FieldSpec.Builder timeoutTimeUnitFieldBuilder =
                FieldSpec.builder(ParameterizedTypeName.get(TimeUnit.class), "timeoutTimeUnit", Modifier.PRIVATE);

        // Add in the other (static) fields for request options
        createRequestOptionField(
                "getTimeout",
                timeoutFieldBuilder,
                CodeBlock.of("$T.empty()", Optional.class),
                requestOptionsTypeSpec,
                builderTypeSpec,
                fields);
        createRequestOptionField(
                "getTimeoutTimeUnit",
                timeoutTimeUnitFieldBuilder,
                CodeBlock.of("$T.SECONDS", TimeUnit.class),
                requestOptionsTypeSpec,
                builderTypeSpec,
                fields);

        FieldSpec timeoutField = timeoutFieldBuilder.build();
        FieldSpec timeUnitField = timeoutTimeUnitFieldBuilder.build();
        builderTypeSpec.addMethod(MethodSpec.methodBuilder(timeoutField.name)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(Integer.class, timeoutField.name)
                .addStatement("this.$L = Optional.of($L)", timeoutField.name, timeoutField.name)
                .addStatement("return this")
                .returns(builderClassName)
                .build());

        builderTypeSpec.addMethod(MethodSpec.methodBuilder(timeoutField.name)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(Integer.class, timeoutField.name)
                .addParameter(timeUnitField.type, timeUnitField.name)
                .addStatement("this.$L = Optional.of($L)", timeoutField.name, timeoutField.name)
                .addStatement("this.$L = $L", timeUnitField.name, timeUnitField.name)
                .addStatement("return this")
                .returns(builderClassName)
                .build());

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
                        .map(field -> ParameterSpec.builder(field.builderField.type, field.builderField.name)
                                .build())
                        .collect(Collectors.toList()));
        for (RequestOption requestOption : fields) {
            constructorBuilder.addStatement(
                    "this.$L = $L", requestOption.builderField.name, requestOption.builderField.name);
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

    private void createRequestOptionField(
            String getterFunctionName,
            FieldSpec.Builder fieldSpecBuilder,
            CodeBlock initializer,
            TypeSpec.Builder requestOptionsTypeSpec,
            TypeSpec.Builder builderTypeSpec,
            List<RequestOption> fields) {
        FieldSpec field = fieldSpecBuilder.build();
        requestOptionsTypeSpec.addField(
                fieldSpecBuilder.addModifiers(Modifier.FINAL).build());
        fields.add(new RequestOption(fieldSpecBuilder.initializer(initializer).build(), field));
        FieldSpec builderField = FieldSpec.builder(field.type, field.name, Modifier.PRIVATE)
                .initializer(initializer)
                .build();
        builderTypeSpec.addField(builderField);

        requestOptionsTypeSpec.addMethod(MethodSpec.methodBuilder(getterFunctionName)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("return $N", field.name)
                .returns(field.type)
                .build());
    }

    private static class RequestOption {
        private final FieldSpec builderField;
        private final FieldSpec requestOptionsField;

        RequestOption(FieldSpec builderField, FieldSpec requestOptionsField) {
            this.builderField = builderField;
            this.requestOptionsField = requestOptionsField;
        }
    }

    private final class AuthSchemeHandler implements AuthScheme.Visitor<RequestOption> {

        private final TypeSpec.Builder requestOptionsTypeSpec;
        private final TypeSpec.Builder builderTypeSpec;
        private final CodeBlock.Builder getHeadersCodeBlock;
        private final HeaderHandler headerHandler;

        private AuthSchemeHandler(
                TypeSpec.Builder requestOptionsTypeSpec,
                TypeSpec.Builder builderTypeSpec,
                CodeBlock.Builder getHeadersCodeBlock,
                HeaderHandler headerHandler) {
            this.requestOptionsTypeSpec = requestOptionsTypeSpec;
            this.builderTypeSpec = builderTypeSpec;
            this.getHeadersCodeBlock = getHeadersCodeBlock;
            this.headerHandler = headerHandler;
        }

        @Override
        public RequestOption visitBearer(BearerAuthScheme bearer) {
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

            return new RequestOption(builderField, requestOptionsField);
        }

        @Override
        public RequestOption visitBasic(BasicAuthScheme basic) {
            return null;
        }

        @Override
        public RequestOption visitHeader(HeaderAuthScheme header) {
            return headerHandler.visitAuthScheme(header);
        }

        @Override
        public RequestOption visitOauth(OAuthScheme oauth) {
            return null;
        }

        @Override
        public RequestOption _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown auth scheme");
        }
    }

    private final class HeaderHandler {

        private final TypeSpec.Builder requestOptionsTypeSpec;
        private final TypeSpec.Builder builderTypeSpec;
        private final CodeBlock.Builder getHeadersCodeBlock;

        private HeaderHandler(
                TypeSpec.Builder requestOptionsTypeSpec,
                TypeSpec.Builder builderTypeSpec,
                CodeBlock.Builder getHeadersCodeBlock) {
            this.requestOptionsTypeSpec = requestOptionsTypeSpec;
            this.builderTypeSpec = builderTypeSpec;
            this.getHeadersCodeBlock = getHeadersCodeBlock;
        }

        public RequestOption visitHeader(HttpHeader header) {
            return requestOptionForHeader(header.getName(), Optional.empty());
        }

        public RequestOption visitAuthScheme(HeaderAuthScheme header) {
            return requestOptionForHeader(header.getName(), header.getPrefix());
        }

        private RequestOption requestOptionForHeader(NameAndWireValue headerName, Optional<String> headerPrefix) {
            FieldSpec builderField = FieldSpec.builder(
                            String.class, headerName.getName().getCamelCase().getSafeName(), Modifier.PRIVATE)
                    .initializer("null")
                    .build();
            builderTypeSpec.addField(builderField);

            MethodSpec builderMethodSpec = MethodSpec.methodBuilder(
                            headerName.getName().getCamelCase().getSafeName())
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(builderField.type, builderField.name)
                    .addStatement("this.$L = $L", builderField.name, builderField.name)
                    .addStatement("return this")
                    .returns(builderClassName)
                    .build();
            builderTypeSpec.addMethod(builderMethodSpec);

            FieldSpec requestOptionsField = FieldSpec.builder(
                            String.class,
                            headerName.getName().getCamelCase().getSafeName(),
                            Modifier.PRIVATE,
                            Modifier.FINAL)
                    .build();
            requestOptionsTypeSpec.addField(requestOptionsField);

            getHeadersCodeBlock
                    .beginControlFlow("if (this.$N != null)", requestOptionsField)
                    .addStatement(
                            "$N.put($S, $L)",
                            HEADERS_FIELD,
                            headerName.getWireValue(),
                            headerPrefix
                                    .map(prefix -> "\"" + prefix + " \"" + "this."
                                            + headerName
                                                    .getName()
                                                    .getCamelCase()
                                                    .getSafeName())
                                    .orElseGet(() -> "this."
                                            + headerName
                                                    .getName()
                                                    .getCamelCase()
                                                    .getSafeName()))
                    .endControlFlow();

            return new RequestOption(builderField, requestOptionsField);
        }
    }
}
