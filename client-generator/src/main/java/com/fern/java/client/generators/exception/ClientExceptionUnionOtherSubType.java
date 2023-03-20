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
import com.fern.ir.v3.model.commons.NameAndWireValue;
import com.fern.java.generators.union.UnionSubType;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public final class ClientExceptionUnionOtherSubType extends UnionSubType {

    private final List<FieldSpec> fieldSpecs = new ArrayList<>();
    private final List<MethodSpec> constructors = new ArrayList<>();

    public ClientExceptionUnionOtherSubType(ClassName unionClassName) {
        super(unionClassName);
        this.fieldSpecs.add(getValueField());
        this.constructors.add(getFromJsonConstructor());
    }

    @Override
    public Optional<NameAndWireValue> getDiscriminant() {
        return Optional.empty();
    }

    @Override
    public Optional<TypeName> getUnionSubTypeTypeName() {
        return Optional.of(ClassName.get(Object.class));
    }

    @Override
    public ClassName getUnionSubTypeWrapperClass() {
        return getUnionClassName().nestedClass("UnknownErrorValue");
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
        return Optional.of(MethodSpec.methodBuilder("other")
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(getUnionClassName())
                .addParameter(getUnionSubTypeTypeName().get(), getValueFieldName())
                .addParameter(int.class, "statusCode")
                .addStatement(
                        "return new $T(new $T($L), $L)",
                        getUnionClassName(),
                        getUnionSubTypeWrapperClass(),
                        getValueFieldName(),
                        "statusCode")
                .build());
    }

    @Override
    public String getVisitMethodName() {
        return "_visitOther";
    }

    @Override
    public String getIsMethodName() {
        return "_isOther";
    }

    @Override
    public String getGetMethodName() {
        return "_getOther";
    }

    @Override
    public String getVisitorParameterName() {
        return "otherType";
    }

    private FieldSpec getValueField() {
        return FieldSpec.builder(getUnionSubTypeTypeName().get(), getValueFieldName(), Modifier.PRIVATE)
                .build();
    }

    private MethodSpec getFromJsonConstructor() {
        return MethodSpec.constructorBuilder()
                .addAnnotation(AnnotationSpec.builder(JsonCreator.class)
                        .addMember(
                                "mode",
                                "$T.$L.$L",
                                JsonCreator.class,
                                JsonCreator.Mode.class.getSimpleName(),
                                Mode.DELEGATING.name())
                        .build())
                .addParameter(ParameterSpec.builder(getUnionSubTypeTypeName().get(), getValueFieldName())
                        .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                .addMember("value", "$S", getValueFieldName())
                                .build())
                        .build())
                .addStatement("this.$L = $L", getValueFieldName(), getValueFieldName())
                .build();
    }

    @Override
    public String getValueFieldName() {
        return "unknownValue";
    }
}
