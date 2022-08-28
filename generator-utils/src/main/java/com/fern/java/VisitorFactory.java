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

package com.fern.java;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class VisitorFactory {

    public static final TypeVariableName VISITOR_RETURN_TYPE = TypeVariableName.get("T");

    private static final String VISITOR_INTERFACE_NAME = "Visitor";
    private static final String VISITOR_VISIT_METHOD_NAME_PREFIX = "visit";
    private static final String VISITOR_VISIT_UNKNOWN_METHOD_NAME = VISITOR_VISIT_METHOD_NAME_PREFIX + "Unknown";
    private static final String VISITOR_UNKNOWN_TYPE_PARAMETER_NAME = "unknownType";
    private static final String VISITOR_TYPE_PARAMETER_NAME = "value";

    private VisitorFactory() {}

    public static TypeName getVisitorTypeName(ClassName enclosingClassName) {
        ClassName visitorInterfaceClassName = enclosingClassName.nestedClass(VISITOR_INTERFACE_NAME);
        return ParameterizedTypeName.get(visitorInterfaceClassName, VISITOR_RETURN_TYPE);
    }

    public static <T> GeneratedVisitor<T> buildVisitorInterface(List<VisitMethodArgs<T>> visitMethodArgsList) {
        Map<T, MethodSpec> visitMethodsByKey = new HashMap<>();
        List<MethodSpec> visitMethods = visitMethodArgsList.stream()
                .map(visitMethodArgs -> {
                    MethodSpec visitMethod = visitMethodArgs.convertToMethod();
                    visitMethodsByKey.put(visitMethodArgs.key(), visitMethod);
                    return visitMethod;
                })
                .collect(Collectors.toList());
        TypeSpec visitorTypeSpec = TypeSpec.interfaceBuilder(VISITOR_INTERFACE_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addTypeVariable(VISITOR_RETURN_TYPE)
                .addMethods(visitMethods)
                .addMethod(MethodSpec.methodBuilder(VISITOR_VISIT_UNKNOWN_METHOD_NAME)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .addParameter(String.class, VISITOR_UNKNOWN_TYPE_PARAMETER_NAME)
                        .returns(VISITOR_RETURN_TYPE)
                        .build())
                .build();
        return GeneratedVisitor.<T>builder()
                .typeSpec(visitorTypeSpec)
                .putAllVisitMethodsByKey(visitMethodsByKey)
                .build();
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface VisitMethodArgs<T> {
        T key();

        String pascalCaseName();

        Optional<TypeName> visitorType();

        default MethodSpec convertToMethod() {
            MethodSpec.Builder methodSpecBuilder = MethodSpec.methodBuilder(
                            VISITOR_VISIT_METHOD_NAME_PREFIX + pascalCaseName())
                    .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                    .returns(VISITOR_RETURN_TYPE);
            if (visitorType().isPresent()) {
                methodSpecBuilder.addParameter(visitorType().get(), VISITOR_TYPE_PARAMETER_NAME);
            }
            return methodSpecBuilder.build();
        }

        static <T> ImmutableVisitMethodArgs.KeyBuildStage<T> builder() {
            return ImmutableVisitMethodArgs.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface GeneratedVisitor<T> {
        TypeSpec typeSpec();

        Map<T, MethodSpec> visitMethodsByKey();

        static <T> ImmutableGeneratedVisitor.TypeSpecBuildStage<T> builder() {
            return ImmutableGeneratedVisitor.builder();
        }
    }
}
