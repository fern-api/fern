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

package com.fern.codegen.generator.union.client;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonCreator.Mode;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.generator.union.UnionSubType;
import com.fern.types.ErrorDeclaration;
import com.fern.types.FernConstants;
import com.fern.types.HttpErrorConfiguration;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;

public final class ClientErrorUnionSubType extends UnionSubType {
    private static final String ERROR_INSTANCE_ID_FIELD_NAME = "errorInstanceId";

    private final ErrorDeclaration errorDeclaration;
    private final IGeneratedFile generatedError;
    private final FernConstants fernConstants;
    private final List<FieldSpec> fieldSpecs = new ArrayList<>();
    private final List<MethodSpec> constructors = new ArrayList<>();

    public ClientErrorUnionSubType(
            ClassName unionClassName,
            ErrorDeclaration errorDeclaration,
            IGeneratedFile generatedError,
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
    public String getStaticFactoryMethodName() {
        return errorDeclaration.discriminantValue().camelCase();
    }

    @Override
    public Optional<String> getDiscriminantValue() {
        return Optional.of(errorDeclaration.discriminantValue().wireValue());
    }

    @Override
    public ClassName getUnionSubTypeClassName() {
        return generatedError.className();
    }

    @Override
    public ClassName getUnionSubTypeWrapperClass() {
        return getUnionClassName().nestedClass(errorDeclaration.name().name() + "Value");
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
    public MethodSpec getVisitorMethodInterface() {
        return MethodSpec.methodBuilder(
                        "visit" + StringUtils.capitalize(errorDeclaration.name().name()))
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .returns(TypeVariableName.get("T"))
                .addParameter(ParameterSpec.builder(
                                getUnionSubTypeClassName(),
                                errorDeclaration.discriminantValue().camelCase())
                        .build())
                .build();
    }

    @Override
    public MethodSpec getStaticFactory() {
        return MethodSpec.methodBuilder(getStaticFactoryMethodName())
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(getUnionClassName())
                .addParameter(getUnionSubTypeClassName(), getValueFieldName())
                .addStatement(
                        "return new $T(new $T($L), $L)",
                        getUnionClassName(),
                        getUnionSubTypeWrapperClass(),
                        getValueFieldName(),
                        errorDeclaration
                                .http()
                                .map(HttpErrorConfiguration::statusCode)
                                .orElse(400))
                .build();
    }

    private FieldSpec getValueField() {
        boolean errorIsObject = errorDeclaration.type().isObject();
        FieldSpec.Builder valueFieldSpec =
                FieldSpec.builder(getUnionSubTypeClassName(), getValueFieldName(), Modifier.PRIVATE);
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

        boolean errorIsObject = errorDeclaration.type().isObject();
        List<ParameterSpec> parameterSpecs = new ArrayList<>();
        if (!errorIsObject) {
            parameterSpecs.add(ParameterSpec.builder(getUnionSubTypeClassName(), getValueFieldName())
                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                            .addMember("value", "$S", getValueFieldName())
                            .build())
                    .build());
            fromJsonConstructorBuilder.addStatement("this.$L = $L", getValueFieldName(), getValueFieldName());
        }
        parameterSpecs.add(ParameterSpec.builder(String.class, ERROR_INSTANCE_ID_FIELD_NAME)
                .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                        .addMember("value", "$S", fernConstants.errorInstanceIdKey())
                        .build())
                .build());
        fromJsonConstructorBuilder.addStatement(
                "this.$L = $L", ERROR_INSTANCE_ID_FIELD_NAME, ERROR_INSTANCE_ID_FIELD_NAME);

        return fromJsonConstructorBuilder.addParameters(parameterSpecs).build();
    }

    private MethodSpec getInitConstructor() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(ParameterSpec.builder(getUnionSubTypeClassName(), getValueFieldName())
                        .build())
                .addStatement("this.$L = $L", getValueFieldName(), getValueFieldName())
                .addStatement("this.$L = $T.randomUUID().toString()", ERROR_INSTANCE_ID_FIELD_NAME, UUID.class)
                .build();
    }
}
