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

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public class ObjectMethodFactory {

    private ObjectMethodFactory() {}

    public static EqualsMethod createEqualsMethod(ClassName className, List<FieldSpec> fieldSpecs) {
        if (fieldSpecs.isEmpty()) {
            MethodSpec equalsMethod = MethodSpec.methodBuilder(EqualsConstants.EQUALS_METHOD_NAME)
                    .addAnnotation(Override.class)
                    .addModifiers(Modifier.PUBLIC)
                    .returns(boolean.class)
                    .addParameter(Object.class, EqualsConstants.OTHER_PARAMETER)
                    .addStatement("if (this == $L) return true", EqualsConstants.OTHER_PARAMETER)
                    .addStatement("return $L instanceof $T", EqualsConstants.OTHER_PARAMETER, className)
                    .build();
            return new EqualsMethod(equalsMethod);
        }
        MethodSpec equalToMethod = createEqualToMethod(className, fieldSpecs);
        MethodSpec equalsMethod = MethodSpec.methodBuilder(EqualsConstants.EQUALS_METHOD_NAME)
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addParameter(Object.class, EqualsConstants.OTHER_PARAMETER)
                .addStatement("if (this == $L) return true", EqualsConstants.OTHER_PARAMETER)
                .addStatement(
                        "return $L instanceof $T && $N(($T) $L)",
                        EqualsConstants.OTHER_PARAMETER,
                        className,
                        equalToMethod,
                        className,
                        EqualsConstants.OTHER_PARAMETER)
                .build();
        return new EqualsMethod(equalsMethod, equalToMethod);
    }

    private static MethodSpec createEqualToMethod(ClassName className, List<FieldSpec> fieldSpecs) {
        MethodSpec.Builder equalToMethodBuilder = MethodSpec.methodBuilder(EqualsConstants.EQUAL_TO_METHOD_NAME)
                .addModifiers(Modifier.PRIVATE)
                .returns(boolean.class)
                .addParameter(className, EqualsConstants.OTHER_PARAMETER);
        String expression = fieldSpecs.stream()
                .map(fieldSpec -> {
                    if (fieldSpec.type.isPrimitive()) {
                        return CodeBlock.builder()
                                .add("$L == $L.$L", fieldSpec.name, EqualsConstants.OTHER_PARAMETER, fieldSpec.name)
                                .build();
                    } else {
                        return CodeBlock.builder()
                                .add(
                                        "$L.equals($L.$L)",
                                        fieldSpec.name,
                                        EqualsConstants.OTHER_PARAMETER,
                                        fieldSpec.name)
                                .build();
                    }
                })
                .map(CodeBlock::toString)
                .collect(Collectors.joining(" && "));
        return equalToMethodBuilder.addStatement("return " + expression).build();
    }

    public static Optional<MethodSpec> createHashCodeMethod(List<FieldSpec> fieldSpecs) {
        if (fieldSpecs.isEmpty()) {
            return Optional.empty();
        }
        String commaDelimitedFields =
                fieldSpecs.stream().map(fieldSpec -> "this." + fieldSpec.name).collect(Collectors.joining(", "));
        MethodSpec.Builder hashCodeBuilder = MethodSpec.methodBuilder(HashCodeConstants.HASHCODE_METHOD_NAME)
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(int.class);
        hashCodeBuilder.addStatement("return $T.hash($L)", Objects.class, commaDelimitedFields);
        return Optional.of(hashCodeBuilder.build());
    }

    public static MethodSpec createToStringMethod(ClassName className, List<FieldSpec> fieldSpecs) {
        StringBuilder codeBlock;
        if (className.enclosingClassName() != null) {
            codeBlock = new StringBuilder(
                    "\"" + className.enclosingClassName().simpleName() + "." + className.simpleName() + "{\"");
        } else {
            codeBlock = new StringBuilder("\"" + className.simpleName() + "{\"");
        }
        for (int i = 0; i < fieldSpecs.size(); ++i) {
            FieldSpec fieldSpec = fieldSpecs.get(i);
            if (i == 0) {
                codeBlock
                        .append(" + \"")
                        .append(fieldSpec.name)
                        .append(": \" + ")
                        .append(fieldSpec.name);
            } else {
                codeBlock
                        .append(" + \", ")
                        .append(fieldSpec.name)
                        .append(": \" + ")
                        .append(fieldSpec.name);
            }
        }
        codeBlock.append(" + \"}\"");
        return MethodSpec.methodBuilder(ToStringConstants.TO_STRING_METHOD_NAME)
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return " + codeBlock)
                .build();
    }

    public static final class EqualsMethod {

        private final MethodSpec equalsMethodSpec;
        private final Optional<MethodSpec> equalToMethodSpec;

        public EqualsMethod(MethodSpec equalsMethodSpec, MethodSpec equalToMethodSpec) {
            this.equalsMethodSpec = equalsMethodSpec;
            this.equalToMethodSpec = Optional.of(equalToMethodSpec);
        }

        public EqualsMethod(MethodSpec equalsMethodSpec) {
            this.equalsMethodSpec = equalsMethodSpec;
            this.equalToMethodSpec = Optional.empty();
        }

        public MethodSpec getEqualsMethodSpec() {
            return equalsMethodSpec;
        }

        public Optional<MethodSpec> getEqualToMethodSpec() {
            return equalToMethodSpec;
        }
    }

    private static final class EqualsConstants {
        private static final String EQUALS_METHOD_NAME = "equals";
        private static final String EQUAL_TO_METHOD_NAME = "equalTo";
        private static final String OTHER_PARAMETER = "other";
    }

    private static final class HashCodeConstants {
        private static final String HASHCODE_METHOD_NAME = "hashCode";
    }

    private static final class ToStringConstants {
        private static final String TO_STRING_METHOD_NAME = "toString";
    }
}
