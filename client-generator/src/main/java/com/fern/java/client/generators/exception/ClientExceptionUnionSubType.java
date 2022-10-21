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

package com.fern.java.client.generators.exception;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonCreator.Mode;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.errors.HttpErrorConfiguration;
import com.fern.ir.model.ir.FernConstants;
import com.fern.java.generators.union.UnionSubType;
import com.fern.java.output.IGeneratedJavaFile;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.lang.model.element.Modifier;

public final class ClientExceptionUnionSubType extends UnionSubType {
    private static final String ERROR_INSTANCE_ID_FIELD_NAME = "errorInstanceId";

    private final ErrorDeclaration errorDeclaration;
    private final IGeneratedJavaFile generatedError;
    private final FernConstants fernConstants;
    private final List<FieldSpec> fieldSpecs = new ArrayList<>();
    private final List<MethodSpec> constructors = new ArrayList<>();

    public ClientExceptionUnionSubType(
            ClassName unionClassName,
            ErrorDeclaration errorDeclaration,
            IGeneratedJavaFile generatedError,
            FernConstants fernConstants) {
        super(unionClassName);
        this.errorDeclaration = errorDeclaration;
        this.generatedError = generatedError;
        this.fernConstants = fernConstants;

        this.fieldSpecs.add(getValueField());
        this.fieldSpecs.add(getErrorInstanceIdField());

        this.constructors.add(getFromJsonConstructor());
        this.constructors.add(getInitConstructor());
    }

    @Override
    public String getCamelCaseName() {
        return errorDeclaration.getDiscriminantValue().getCamelCase();
    }

    @Override
    public String getPascalCaseName() {
        return errorDeclaration.getDiscriminantValue().getPascalCase();
    }

    @Override
    public Optional<String> getDiscriminantValue() {
        return Optional.of(errorDeclaration.getDiscriminantValue().getWireValue());
    }

    @Override
    public Optional<TypeName> getUnionSubTypeTypeName() {
        return Optional.of(generatedError.getClassName());
    }

    @Override
    public ClassName getUnionSubTypeWrapperClass() {
        return getUnionClassName().nestedClass(errorDeclaration.getName().getName() + "Value");
    }

    @Override
    public List<FieldSpec> getFieldSpecs() {
        return fieldSpecs;
    }

    @Override
    public List<MethodSpec> getConstructors() {
        return constructors;
    }

    @Override
    public Optional<MethodSpec> getStaticFactory() {
        return Optional.of(MethodSpec.methodBuilder(getCamelCaseName())
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(getUnionClassName())
                .addParameter(getUnionSubTypeTypeName().get(), getValueFieldName())
                .addStatement(
                        "return new $T(new $T($L), $L)",
                        getUnionClassName(),
                        getUnionSubTypeWrapperClass(),
                        getValueFieldName(),
                        errorDeclaration
                                .getHttp()
                                .map(HttpErrorConfiguration::getStatusCode)
                                .orElse(400))
                .build());
    }

    private FieldSpec getValueField() {
        boolean errorIsObject = errorDeclaration.getType().isObject();
        FieldSpec.Builder valueFieldSpec =
                FieldSpec.builder(getUnionSubTypeTypeName().get(), getValueFieldName(), Modifier.PRIVATE);
        if (errorIsObject) {
            valueFieldSpec.addAnnotation(JsonUnwrapped.class);
        }
        return valueFieldSpec.build();
    }

    private FieldSpec getErrorInstanceIdField() {
        return FieldSpec.builder(String.class, ERROR_INSTANCE_ID_FIELD_NAME, Modifier.PRIVATE)
                .build();
    }

    private MethodSpec getFromJsonConstructor() {
        MethodSpec.Builder fromJsonConstructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addAnnotation(AnnotationSpec.builder(JsonCreator.class)
                        .addMember(
                                "mode",
                                "$T.$L.$L",
                                JsonCreator.class,
                                JsonCreator.Mode.class.getSimpleName(),
                                Mode.PROPERTIES.name())
                        .build());

        boolean errorIsObject = errorDeclaration.getType().isObject();
        List<ParameterSpec> parameterSpecs = new ArrayList<>();
        if (!errorIsObject) {
            parameterSpecs.add(ParameterSpec.builder(getUnionSubTypeTypeName().get(), getValueFieldName())
                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                            .addMember("value", "$S", getValueFieldName())
                            .build())
                    .build());
            fromJsonConstructorBuilder.addStatement("this.$L = $L", getValueFieldName(), getValueFieldName());
        }
        parameterSpecs.add(ParameterSpec.builder(String.class, ERROR_INSTANCE_ID_FIELD_NAME)
                .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                        .addMember("value", "$S", fernConstants.getErrorInstanceIdKey())
                        .build())
                .build());
        fromJsonConstructorBuilder.addStatement(
                "this.$L = $L", ERROR_INSTANCE_ID_FIELD_NAME, ERROR_INSTANCE_ID_FIELD_NAME);

        return fromJsonConstructorBuilder.addParameters(parameterSpecs).build();
    }

    private MethodSpec getInitConstructor() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(ParameterSpec.builder(getUnionSubTypeTypeName().get(), getValueFieldName())
                        .build())
                .addStatement("this.$L = $L", getValueFieldName(), getValueFieldName())
                .addStatement("this.$L = $T.randomUUID().toString()", ERROR_INSTANCE_ID_FIELD_NAME, UUID.class)
                .build();
    }
}
