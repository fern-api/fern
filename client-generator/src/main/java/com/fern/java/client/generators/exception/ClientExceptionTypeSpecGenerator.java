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

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.ir.v3.model.ir.FernConstants;
import com.fern.java.generators.union.UnionSubType;
import com.fern.java.generators.union.UnionTypeSpecGenerator;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import java.io.IOException;
import java.util.List;
import javax.lang.model.element.Modifier;

public final class ClientExceptionTypeSpecGenerator extends UnionTypeSpecGenerator {

    private static final String DESERIALIZER_CLASS_NAME = "Deserializer";

    private final ClassName deserializerClassName;

    public ClientExceptionTypeSpecGenerator(
            ClassName unionClassName,
            List<? extends UnionSubType> subTypes,
            UnionSubType unknownSubType,
            FernConstants fernConstants) {
        super(unionClassName, subTypes, unknownSubType, fernConstants, false, fernConstants.getErrorDiscriminant());
        this.deserializerClassName = getUnionClassName().nestedClass(DESERIALIZER_CLASS_NAME);
    }

    @Override
    public List<FieldSpec> getAdditionalFieldSpecs() {
        return List.of(
                FieldSpec.builder(int.class, "statusCode", Modifier.PRIVATE).build());
    }

    @Override
    public TypeSpec build(TypeSpec.Builder unionBuilder) {
        return unionBuilder
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addType(getCustomDeserializer())
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("using", "$T.class", deserializerClassName)
                        .build())
                .superclass(Exception.class)
                .build();
    }

    private TypeSpec getCustomDeserializer() {
        return TypeSpec.classBuilder(deserializerClassName)
                .addModifiers(Modifier.STATIC, Modifier.FINAL)
                .superclass(ParameterizedTypeName.get(ClassName.get(JsonDeserializer.class), getUnionClassName()))
                .addMethod(MethodSpec.methodBuilder("deserialize")
                        .addModifiers(Modifier.PUBLIC)
                        .addAnnotation(Override.class)
                        .returns(getUnionClassName())
                        .addParameter(JsonParser.class, "p")
                        .addParameter(DeserializationContext.class, "ctx")
                        .addException(IOException.class)
                        .addStatement(
                                "$T value = $L.readValue($L, $T.class)",
                                getValueInterfaceClassName(),
                                "ctx",
                                "p",
                                getValueInterfaceClassName())
                        .addStatement("$T statusCode = (int) $L.getAttribute($S)", int.class, "ctx", "statusCode")
                        .addStatement("return new $T($L, $L)", getUnionClassName(), "value", "statusCode")
                        .build())
                .build();
    }
}
