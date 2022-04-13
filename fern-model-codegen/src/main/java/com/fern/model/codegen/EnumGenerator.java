package com.fern.model.codegen;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.EnumTypeDefinition;
import com.fern.NamedTypeReference;
import com.fern.model.codegen.utils.ClassNameUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.stream.Collectors;
import javax.annotation.Nonnull;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;

public class EnumGenerator {

    private static final String VALUE_TYPE_NAME = "Value";
    private static final String VALUE_FIELD_NAME = "value";

    private static final String STRING_FIELD_NAME = "string";
    private static final ClassName STRING_TYPE_NAME = ClassName.get(String.class);

    private static final String VISITOR_TYPE_NAME = "Visitor";
    private static final String VISITOR_VISIT_UNKNOWN_METHOD_NAME = "visitUnknown";

    private static final String UNKNOWN_ENUM_CONSTANT = "UNKNOWN";

    private static final String GET_ENUM_VALUE_METHOD_NAME = "getEnumValue";
    private static final String TO_STRING_METHOD_NAME = "toString";
    private static final String EQUALS_METHOD_NAME = "equals";
    private static final String HASHCODE_METHOD_NAME = "hashCode";
    private static final String ACCEPT_METHOD_NAME = "accept";
    private static final String VALUE_OF_METHOD_NAME = "valueOf";

    private EnumGenerator() {}

    @SuppressWarnings("MethodLength")
    public static GeneratedEnum generate(NamedTypeReference name, EnumTypeDefinition enumTypeDefinition) {
        ClassName generatedEnumClassName = ClassNameUtils.getClassName(name);
        TypeSpec.Builder enumBuilder = TypeSpec.classBuilder(name.name()).addModifiers(Modifier.PUBLIC, Modifier.FINAL);

        // Generate public static final constant for each enum value
        enumTypeDefinition.values().forEach(enumValue -> {
            enumBuilder.addField(FieldSpec.builder(
                            generatedEnumClassName, enumValue.value(), Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                    .build());
        });

        // Add private Value Field
        ClassName valueFieldClassName = generatedEnumClassName.nestedClass(VALUE_TYPE_NAME);
        enumBuilder.addField(FieldSpec.builder(valueFieldClassName, VALUE_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                .build());
        // Add private String Field
        enumBuilder.addField(FieldSpec.builder(STRING_TYPE_NAME, STRING_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                .build());
        // Add constructor
        enumBuilder.addMethod(MethodSpec.constructorBuilder()
                .addParameter(valueFieldClassName, VALUE_FIELD_NAME)
                .addParameter(STRING_TYPE_NAME, STRING_FIELD_NAME)
                .addStatement("this.value = value")
                .addStatement("this.string = string")
                .build());

        // Generate nested enum with UNKNOWN constant
        TypeSpec.Builder nestedEnumBuilder =
                TypeSpec.enumBuilder(VALUE_TYPE_NAME).addModifiers(Modifier.PUBLIC);
        enumTypeDefinition.values().forEach(enumValue -> {
            nestedEnumBuilder.addEnumConstant(enumValue.value());
        });
        nestedEnumBuilder.addEnumConstant(UNKNOWN_ENUM_CONSTANT);
        TypeSpec nestedEnum = nestedEnumBuilder.build();
        enumBuilder.addType(nestedEnum);

        MethodSpec getEnumValue = MethodSpec.methodBuilder(GET_ENUM_VALUE_METHOD_NAME)
                .addCode("return value;")
                .returns(valueFieldClassName)
                .build();
        enumBuilder.addMethod(getEnumValue);

        MethodSpec toString = MethodSpec.methodBuilder(TO_STRING_METHOD_NAME)
                .addAnnotation(Override.class)
                .addAnnotation(JsonValue.class)
                .addCode("return this.string;")
                .returns(ClassName.get(String.class))
                .build();
        enumBuilder.addMethod(toString);

        MethodSpec equals = MethodSpec.methodBuilder(EQUALS_METHOD_NAME)
                .addAnnotation(Override.class)
                .addParameter(ClassName.get(Object.class), "other")
                .addCode(CodeBlock.builder()
                        .add(
                                "return (this == other) || (other instanceof $T && this.string.equals((($T)"
                                        + " other).string));",
                                generatedEnumClassName,
                                generatedEnumClassName)
                        .build())
                .returns(boolean.class)
                .build();
        enumBuilder.addMethod(equals);

        MethodSpec hashcode = MethodSpec.methodBuilder(HASHCODE_METHOD_NAME)
                .addAnnotation(Override.class)
                .addCode("return this.string.hashCode();")
                .returns(int.class)
                .build();
        enumBuilder.addMethod(hashcode);

        TypeVariableName visitorReturnType = TypeVariableName.get("T");
        TypeSpec visitorInterface = TypeSpec.interfaceBuilder(VISITOR_TYPE_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addTypeVariable(visitorReturnType)
                .addMethods(enumTypeDefinition.values().stream()
                        .map(enumValue -> MethodSpec.methodBuilder("visit"
                                        + StringUtils.capitalize(
                                                enumValue.value().toLowerCase()))
                                .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                                .returns(visitorReturnType)
                                .build())
                        .collect(Collectors.toList()))
                .addMethod(MethodSpec.methodBuilder(VISITOR_VISIT_UNKNOWN_METHOD_NAME)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .returns(visitorReturnType)
                        .build())
                .build();
        enumBuilder.addType(visitorInterface);
        ClassName nestedVisitor = generatedEnumClassName.nestedClass(VISITOR_TYPE_NAME);

        TypeVariableName acceptReturnType = TypeVariableName.get("T");
        CodeBlock.Builder acceptMethodImplementation = CodeBlock.builder().beginControlFlow("switch (value)");
        enumTypeDefinition.values().forEach(enumValue -> {
            acceptMethodImplementation
                    .add("case $L:\n", enumValue.value())
                    .indent()
                    .addStatement(
                            "return visitor.$L",
                            "visit" + StringUtils.capitalize(enumValue.value().toLowerCase()) + "()")
                    .unindent();
        });
        CodeBlock acceptCodeBlock = acceptMethodImplementation
                .add("case UNKNOWN:\n")
                .add("default:\n")
                .indent()
                .addStatement("return visitor.visitUnknown(string)")
                .unindent()
                .endControlFlow()
                .build();
        MethodSpec accept = MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                .addParameter(ParameterizedTypeName.get(nestedVisitor, acceptReturnType), "visitor")
                .addCode(acceptCodeBlock)
                .returns(acceptReturnType)
                .build();
        enumBuilder.addMethod(accept);

        CodeBlock.Builder valueOfCodeBlockBuilder = CodeBlock.builder()
                .addStatement("String upperCasedValue = value.toUpperCase(Locale.ROOT)")
                .beginControlFlow("switch (upperCasedValue)");
        enumTypeDefinition.values().forEach(enumValue -> {
            valueOfCodeBlockBuilder
                    .add("case $S:\n", enumValue.value())
                    .indent()
                    .addStatement("return $L", enumValue.value())
                    .unindent();
        });
        CodeBlock valueOfCodeBlock = valueOfCodeBlockBuilder
                .add("default:\n")
                .indent()
                .addStatement("return new $T(Value.UNKNOWN, upperCasedValue)", generatedEnumClassName)
                .unindent()
                .endControlFlow()
                .build();
        MethodSpec.Builder valueOfBuilder = MethodSpec.methodBuilder(VALUE_OF_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addAnnotation(AnnotationSpec.builder(JsonCreator.class)
                        .addMember(
                                "mode",
                                "$T.$L",
                                ClassName.get(JsonCreator.Mode.class),
                                JsonCreator.Mode.DELEGATING.name())
                        .build())
                .addParameter(ParameterSpec.builder(ClassName.get(String.class), "value")
                        .addAnnotation(Nonnull.class)
                        .build())
                .addCode(valueOfCodeBlock)
                .returns(generatedEnumClassName);
        enumBuilder.addMethod(valueOfBuilder.build());

        JavaFile enumFile = JavaFile.builder(generatedEnumClassName.packageName(), enumBuilder.build())
                .build();
        return GeneratedEnum.builder()
                .file(enumFile)
                .definition(enumTypeDefinition)
                .build();
    }
}
