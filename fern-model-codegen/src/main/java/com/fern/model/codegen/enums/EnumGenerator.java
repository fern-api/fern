package com.fern.model.codegen.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.EnumTypeDefinition;
import com.fern.EnumValue;
import com.fern.NamedType;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.GeneratorContext;
import com.fern.model.codegen.utils.VisitorUtils;
import com.fern.model.codegen.utils.VisitorUtils.GeneratedVisitor;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.annotation.Nonnull;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;

public final class EnumGenerator extends Generator<EnumTypeDefinition> {

    private static final Modifier[] ENUM_CLASS_MODIFIERS = new Modifier[] {Modifier.PUBLIC, Modifier.FINAL};

    private static final String VALUE_TYPE_NAME = "Value";
    private static final String VALUE_FIELD_NAME = "value";

    private static final String STRING_FIELD_NAME = "string";

    private static final String UNKNOWN_ENUM_CONSTANT = "UNKNOWN";

    private static final String GET_ENUM_VALUE_METHOD_NAME = "getEnumValue";
    private static final String TO_STRING_METHOD_NAME = "toString";
    private static final String EQUALS_METHOD_NAME = "equals";
    private static final String HASHCODE_METHOD_NAME = "hashCode";
    private static final String ACCEPT_METHOD_NAME = "accept";
    private static final String VALUE_OF_METHOD_NAME = "valueOf";

    private final NamedType namedType;
    private final EnumTypeDefinition enumTypeDefinition;
    private final ClassName generatedEnumClassName;
    private final ClassName valueFieldClassName;

    public EnumGenerator(
            NamedType namedType, EnumTypeDefinition enumTypeDefinition, GeneratorContext generatorContext) {
        super(generatorContext);
        this.namedType = namedType;
        this.enumTypeDefinition = EnumTypeDefinition.builder()
                .addAllValues(enumTypeDefinition.values().stream()
                        .map(EnumValue::value)
                        .map(StringUtils::upperCase)
                        .map(upperCasedEnum ->
                                EnumValue.builder().value(upperCasedEnum).build())
                        .collect(Collectors.toList()))
                .build();
        this.generatedEnumClassName = generatorContext.getClassNameUtils().getClassNameForNamedType(namedType);
        this.valueFieldClassName = generatedEnumClassName.nestedClass(VALUE_TYPE_NAME);
    }

    @Override
    public GeneratedEnum generate() {
        Map<EnumValue, FieldSpec> enumConstants = getConstants();
        VisitorUtils.GeneratedVisitor generatedVisitor = getVisitor();
        TypeSpec enumTypeSpec = TypeSpec.classBuilder(namedType.name())
                .addModifiers(ENUM_CLASS_MODIFIERS)
                .addFields(enumConstants.values())
                .addFields(getPrivateMembers())
                .addMethod(getConstructor())
                .addMethod(getEnumValueMethod())
                .addMethod(getToStringMethod())
                .addMethod(getEqualsMethod())
                .addMethod(getHashCodeMethod())
                .addMethod(getAcceptMethod(generatedVisitor))
                .addMethod(getValueOfMethod(enumConstants))
                .addType(getNestedValueEnum())
                .addType(generatedVisitor.typeSpec())
                .build();
        JavaFile enumFile = JavaFile.builder(generatedEnumClassName.packageName(), enumTypeSpec)
                .build();
        return GeneratedEnum.builder()
                .file(enumFile)
                .definition(enumTypeDefinition)
                .className(generatedEnumClassName)
                .build();
    }

    private Map<EnumValue, FieldSpec> getConstants() {
        // Generate public static final constant for each enum value
        return enumTypeDefinition.values().stream()
                .collect(Collectors.toMap(Function.identity(), enumValue -> FieldSpec.builder(
                                generatedEnumClassName,
                                enumValue.value(),
                                Modifier.PUBLIC,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer(
                                "new $T($T.$L, $S)",
                                generatedEnumClassName,
                                valueFieldClassName,
                                enumValue.value(),
                                enumValue.value())
                        .build()));
    }

    private List<FieldSpec> getPrivateMembers() {
        List<FieldSpec> privateMembers = new ArrayList<>();
        // Add private Value Field
        FieldSpec valueField = FieldSpec.builder(
                        valueFieldClassName, VALUE_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                .build();
        privateMembers.add(valueField);
        // Add private String Field
        FieldSpec stringField = FieldSpec.builder(
                        ClassNameUtils.STRING_CLASS_NAME, STRING_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                .build();
        privateMembers.add(stringField);
        return privateMembers;
    }

    private MethodSpec getConstructor() {
        return MethodSpec.constructorBuilder()
                .addParameter(valueFieldClassName, VALUE_FIELD_NAME)
                .addParameter(ClassNameUtils.STRING_CLASS_NAME, STRING_FIELD_NAME)
                .addStatement("this.value = value")
                .addStatement("this.string = string")
                .build();
    }

    private MethodSpec getEnumValueMethod() {
        return MethodSpec.methodBuilder(GET_ENUM_VALUE_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addCode("return value;")
                .returns(valueFieldClassName)
                .build();
    }

    private MethodSpec getToStringMethod() {
        return MethodSpec.methodBuilder(TO_STRING_METHOD_NAME)
                .addAnnotation(Override.class)
                .addAnnotation(JsonValue.class)
                .addModifiers(Modifier.PUBLIC)
                .addCode("return this.string;")
                .returns(ClassName.get(String.class))
                .build();
    }

    private MethodSpec getEqualsMethod() {
        return MethodSpec.methodBuilder(EQUALS_METHOD_NAME)
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ClassName.get(Object.class), "other")
                .addCode(CodeBlock.builder()
                        .add(
                                "return (this == other) \n"
                                        + "  || (other instanceof $T && this.string.equals((($T) other).string));",
                                generatedEnumClassName,
                                generatedEnumClassName)
                        .build())
                .returns(boolean.class)
                .build();
    }

    private MethodSpec getHashCodeMethod() {
        return MethodSpec.methodBuilder(HASHCODE_METHOD_NAME)
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .addCode("return this.string.hashCode();")
                .returns(int.class)
                .build();
    }

    /*
     * Generates an accept method that visits the enum as shown below.
     * public <T> T accept(Visitor<T> visitor) {
     *     switch (value) {
     *         case ON:
     *             return visitor.visitOn();
     *         case OFF:
     *             return visitor.visitOff();
     *         case UNKNOWN:
     *         default:
     *             return visitor.visitUnknown(string);
     *     }
     * }
     */
    private MethodSpec getAcceptMethod(GeneratedVisitor generatedVisitor) {
        CodeBlock.Builder acceptMethodImplementation = CodeBlock.builder().beginControlFlow("switch (value)");
        generatedVisitor.visitMethodsByKeyName().forEach((keyName, visitMethod) -> {
            acceptMethodImplementation
                    .add("case $L:\n", keyName)
                    .indent()
                    .addStatement("return visitor.$L()", visitMethod.name)
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
        return MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addTypeVariable(VisitorUtils.VISITOR_RETURN_TYPE)
                .addParameter(generatorContext.getVisitorUtils().getVisitorTypeName(generatedEnumClassName), "visitor")
                .addCode(acceptCodeBlock)
                .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                .build();
    }

    /**
     * Generates an accept method that visits the enum as shown below.
     * public static Status valueOf(@Nonnull value) {
     *     String upperCasedValue = value.toUpperCase(Locale.ROOT);
     *     switch (upperCasedValue) {
     *         case "ON":
     *             return ON;
     *         case "OFF":
     *             return OFF;
     *         case "UNKNOWN":
     *         default:
     *             return  new Status(Status.Value.UNKNOWN, upperCasedValue);
     *     }
     * }
     */
    private MethodSpec getValueOfMethod(Map<EnumValue, FieldSpec> constants) {
        CodeBlock.Builder valueOfCodeBlockBuilder = CodeBlock.builder()
                .addStatement("String upperCasedValue = value.toUpperCase($T.ROOT)", Locale.class)
                .beginControlFlow("switch (upperCasedValue)");
        constants.forEach((enumValue, constantField) -> {
            valueOfCodeBlockBuilder
                    .add("case $S:\n", enumValue.value())
                    .indent()
                    .addStatement("return $L", constantField.name)
                    .unindent();
        });
        CodeBlock valueOfCodeBlock = valueOfCodeBlockBuilder
                .add("default:\n")
                .indent()
                .addStatement("return new $T(Value.UNKNOWN, upperCasedValue)", generatedEnumClassName)
                .unindent()
                .endControlFlow()
                .build();
        return MethodSpec.methodBuilder(VALUE_OF_METHOD_NAME)
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
                .returns(generatedEnumClassName)
                .build();
    }

    /**
     * Generates a nested enum called Value.
     * The nested enum has an UNKNOWN value in addition to configured values.
     * Example:
     * enum Value {
     *     ON,
     *     OFF,
     *     UNKNOWN
     * }
     */
    private TypeSpec getNestedValueEnum() {
        TypeSpec.Builder nestedValueEnumBuilder =
                TypeSpec.enumBuilder(VALUE_TYPE_NAME).addModifiers(Modifier.PUBLIC);
        enumTypeDefinition.values().forEach(enumValue -> nestedValueEnumBuilder.addEnumConstant(enumValue.value()));
        nestedValueEnumBuilder.addEnumConstant(UNKNOWN_ENUM_CONSTANT);
        return nestedValueEnumBuilder.build();
    }

    /*
     * Generates a nested interface to visit all types of the enum as shown below.
     * interface Visitor<T> {
     *     T visitOn();
     *     T visitOff();
     *     T visitUnknownType(String unknownType);
     * }
     */
    private GeneratedVisitor getVisitor() {
        List<VisitorUtils.VisitMethodArgs> visitMethodArgs = enumTypeDefinition.values().stream()
                .map(enumValue -> VisitorUtils.VisitMethodArgs.builder()
                        // TODO(dsinghvi): Should we handle underscores in enum values by removing them and camelCasing?
                        .keyName(enumValue.value())
                        .build())
                .collect(Collectors.toList());
        return generatorContext.getVisitorUtils().buildVisitorInterface(visitMethodArgs);
    }
}
