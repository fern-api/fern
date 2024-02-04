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
package com.fern.java.spring.generators;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.ir.ErrorDiscriminationByPropertyStrategy;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.UUID;
import javax.lang.model.element.Modifier;

public final class ErrorBodyGenerator extends AbstractFileGenerator {

    public static final String ERROR_BODY_CLASS_NAME = "ErrorBody";
    private static final TypeVariableName GENERIC_BODY = TypeVariableName.get("T");
    private static final FieldSpec BODY_FIELD = FieldSpec.builder(GENERIC_BODY, "body")
            .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
            .build();
    private final ErrorDiscriminationByPropertyStrategy errorDiscriminationByPropertyStrategy;
    private final FieldSpec errorNameField;
    private final FieldSpec errorInstanceIdField;

    public ErrorBodyGenerator(
            ErrorDiscriminationByPropertyStrategy errorDiscriminationByPropertyStrategy,
            AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getCoreClassName(ERROR_BODY_CLASS_NAME), generatorContext);
        this.errorDiscriminationByPropertyStrategy = errorDiscriminationByPropertyStrategy;
        this.errorNameField = FieldSpec.builder(
                        String.class,
                        errorDiscriminationByPropertyStrategy
                                .getDiscriminant()
                                .getName()
                                .getCamelCase()
                                .getSafeName())
                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                .build();
        this.errorInstanceIdField = FieldSpec.builder(
                        UUID.class,
                        generatorContext
                                .getIr()
                                .getConstants()
                                .getErrorInstanceIdKey()
                                .getName()
                                .getCamelCase()
                                .getSafeName())
                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                .initializer("$T.randomUUID()", UUID.class)
                .build();
    }

    @Override
    public GeneratedJavaFile generateFile() {
        NameAndWireValue errorInstanceId =
                generatorContext.getIr().getConstants().getErrorInstanceIdKey();
        NameAndWireValue errorName = errorDiscriminationByPropertyStrategy.getDiscriminant();
        NameAndWireValue contentProperty = errorDiscriminationByPropertyStrategy.getContentProperty();
        TypeSpec errorBodyTypeSpec = TypeSpec.classBuilder(className)
                .addTypeVariable(GENERIC_BODY)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addField(errorNameField)
                .addField(BODY_FIELD)
                .addField(errorInstanceIdField)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(errorNameField.type, errorNameField.name)
                        .addStatement("this($L, $L)", errorNameField.name, "null")
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(errorNameField.type, errorNameField.name)
                        .addParameter(BODY_FIELD.type, BODY_FIELD.name)
                        .addStatement("this.$L = $L", errorNameField.name, errorNameField.name)
                        .addStatement("this.$L = $L", BODY_FIELD.name, BODY_FIELD.name)
                        .build())
                .addMethod(createGetter(errorNameField, errorName))
                .addMethod(createGetter(BODY_FIELD, contentProperty))
                .addMethod(createGetter(errorInstanceIdField, errorInstanceId))
                .build();
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), errorBodyTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }

    private MethodSpec createGetter(FieldSpec fieldSpec, NameAndWireValue property) {
        return MethodSpec.methodBuilder(
                        "get" + property.getName().getPascalCase().getUnsafeName())
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                        .addMember("value", "$S", property.getWireValue())
                        .build())
                .returns(fieldSpec.type)
                .addStatement("return this.$L", fieldSpec.name)
                .build();
    }
}
