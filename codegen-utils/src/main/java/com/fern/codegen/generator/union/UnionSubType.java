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

package com.fern.codegen.generator.union;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fern.codegen.generator.DefaultMethodGenerators;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.List;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public abstract class UnionSubType {

    private static final String VISITOR_CLASS_NAME = "Visitor";

    private static final TypeVariableName VISITOR_RETURN_TYPE = TypeVariableName.get("T");

    private final ClassName unionClassName;
    private final ParameterizedTypeName visitorInterfaceClassName;

    public UnionSubType(ClassName unionClassName) {
        this.unionClassName = unionClassName;
        this.visitorInterfaceClassName =
                ParameterizedTypeName.get(unionClassName.nestedClass(VISITOR_CLASS_NAME), VISITOR_RETURN_TYPE);
    }

    public final ClassName getUnionClassName() {
        return unionClassName;
    }

    public abstract String getStaticFactoryMethodName();

    public abstract Optional<String> getDiscriminantValue();

    public abstract ClassName getUnionSubTypeClassName();

    public abstract ClassName getUnionSubTypeWrapperClass();

    public abstract List<FieldSpec> getFieldSpecs();

    public abstract List<MethodSpec> getConstructors();

    public abstract MethodSpec getVisitorMethodInterface();

    @SuppressWarnings("checkstyle:DesignForExtension")
    public String getValueFieldName() {
        return "value";
    }

    @SuppressWarnings("checkstyle:DesignForExtension")
    public MethodSpec getStaticFactory() {
        return MethodSpec.methodBuilder(getStaticFactoryMethodName())
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(unionClassName)
                .addParameter(getUnionSubTypeClassName(), getValueFieldName())
                .addStatement("new $T(new $T($L))", unionClassName, getUnionSubTypeWrapperClass(), getValueFieldName())
                .build();
    }

    public final MethodSpec getVisitMethod() {
        return MethodSpec.methodBuilder("visit")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(Override.class)
                .addTypeVariable(VISITOR_RETURN_TYPE)
                .returns(VISITOR_RETURN_TYPE)
                .addParameter(ParameterSpec.builder(visitorInterfaceClassName, "visitor")
                        .build())
                .addStatement("return $L.$N($L)", "visitor", getVisitorMethodInterface(), getValueFieldName())
                .build();
    }

    public final MethodSpec getEqualsMethod(Optional<MethodSpec> equalToMethod) {
        return DefaultMethodGenerators.generateEqualsMethod(getUnionSubTypeWrapperClass(), equalToMethod);
    }

    public final Optional<MethodSpec> getEqualToMethod() {
        return DefaultMethodGenerators.generateEqualToMethod(getUnionSubTypeWrapperClass(), getFieldSpecs());
    }

    public final MethodSpec getHashCodeMethod() {
        return DefaultMethodGenerators.generateHashCode(getFieldSpecs(), false);
    }

    public final MethodSpec getToStringMethod() {
        return DefaultMethodGenerators.generateToString(
                Optional.ofNullable(unionClassName.enclosingClassName()), unionClassName, getFieldSpecs());
    }

    public final TypeSpec getUnionSubTypeWrapper(ClassName unionWrapperInterface) {
        ClassName subTypeWrapperClassName = getUnionSubTypeWrapperClass();
        TypeSpec.Builder unionSubTypeBuilder = TypeSpec.classBuilder(subTypeWrapperClassName)
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL)
                .addSuperinterface(unionWrapperInterface);
        if (getDiscriminantValue().isPresent()) {
            unionSubTypeBuilder.addAnnotation(AnnotationSpec.builder(JsonTypeName.class)
                    .addMember("value", "$S", getDiscriminantValue())
                    .build());
        }
        Optional<MethodSpec> equalToMethod = getEqualToMethod();
        unionSubTypeBuilder
                .addFields(getFieldSpecs())
                .addMethods(getConstructors())
                .addMethod(getVisitMethod())
                .addMethod(getEqualsMethod(equalToMethod));
        equalToMethod.ifPresent(unionSubTypeBuilder::addMethod);
        return unionSubTypeBuilder
                .addMethod(getHashCodeMethod())
                .addMethod(getToStringMethod())
                .build();
    }
}
