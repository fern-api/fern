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
                    .addAnnotation(ClassName.get("", "java.lang.Override"))
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
                .addAnnotation(ClassName.get("", "java.lang.Override"))
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
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addModifiers(Modifier.PUBLIC)
                .returns(int.class);
        hashCodeBuilder.addStatement("return $T.hash($L)", Objects.class, commaDelimitedFields);
        return Optional.of(hashCodeBuilder.build());
    }

    public static MethodSpec createToStringMethodFromFieldSpecs(ClassName className, List<FieldSpec> fieldSpecs) {
        return createToStringMethod(
                className, fieldSpecs.stream().map(ToStringSpec::of).collect(Collectors.toList()));
    }

    public static MethodSpec createToStringMethod(ClassName className, List<ToStringSpec> toStringSpecs) {
        StringBuilder codeBlock;
        if (className.enclosingClassName() != null) {
            codeBlock = new StringBuilder(
                    "\"" + className.enclosingClassName().simpleName() + "." + className.simpleName() + "{\"");
        } else {
            codeBlock = new StringBuilder("\"" + className.simpleName() + "{\"");
        }
        for (int i = 0; i < toStringSpecs.size(); ++i) {
            ToStringSpec fieldSpec = toStringSpecs.get(i);
            if (i == 0) {
                codeBlock
                        .append(" + \"")
                        .append(fieldSpec.fieldName)
                        .append(": \" + ")
                        .append(fieldSpec.fieldValue);
            } else {
                codeBlock
                        .append(" + \", ")
                        .append(fieldSpec.fieldName)
                        .append(": \" + ")
                        .append(fieldSpec.fieldValue);
            }
        }
        codeBlock.append(" + \"}\"");
        return MethodSpec.methodBuilder(ToStringConstants.TO_STRING_METHOD_NAME)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return " + codeBlock)
                .build();
    }

    public static final class ToStringSpec {
        private final String fieldName;
        private final String fieldValue;

        private ToStringSpec(String fieldName, String fieldValue) {
            this.fieldName = fieldName;
            this.fieldValue = fieldValue;
        }

        public static ToStringSpec of(FieldSpec fieldSpec) {
            return new ToStringSpec(fieldSpec.name, fieldSpec.name);
        }

        public static ToStringSpec of(String fieldName, String getterMethodName) {
            return new ToStringSpec(fieldName, getterMethodName + "()");
        }
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
