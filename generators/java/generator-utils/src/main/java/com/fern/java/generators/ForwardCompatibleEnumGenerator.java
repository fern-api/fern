package com.fern.java.generators;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.ir.model.types.EnumTypeDeclaration;
import com.fern.ir.model.types.EnumValue;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.FernJavaAnnotations;
import com.fern.java.VisitorFactory;
import com.fern.java.VisitorFactory.GeneratedVisitor;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class ForwardCompatibleEnumGenerator extends AbstractTypeGenerator {

    private static final String VALUE_TYPE_NAME = "Value";
    private static final String VALUE_FIELD_NAME = "value";

    private static final String STRING_FIELD_NAME = "string";

    private static final String UNKNOWN_ENUM_CONSTANT = "UNKNOWN";

    private static final String GET_ENUM_VALUE_METHOD_NAME = "getEnumValue";
    private static final String TO_STRING_METHOD_NAME = "toString";
    private static final String EQUALS_METHOD_NAME = "equals";
    private static final String HASHCODE_METHOD_NAME = "hashCode";
    private static final String VISIT_METHOD_NAME = "visit";
    private static final String VALUE_OF_METHOD_NAME = "valueOf";

    private final EnumTypeDeclaration enumTypeDeclaration;
    private final ClassName valueFieldClassName;

    public ForwardCompatibleEnumGenerator(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            EnumTypeDeclaration enumTypeDeclaration,
            Set<String> reservedTypeNames,
            boolean isTopLevelClass) {
        super(className, generatorContext, reservedTypeNames, isTopLevelClass);
        this.enumTypeDeclaration = enumTypeDeclaration;
        this.valueFieldClassName = this.className.nestedClass(VALUE_TYPE_NAME);
    }

    @Override
    public List<TypeDeclaration> getInlineTypeDeclarations() {
        return List.of();
    }

    @Override
    protected TypeSpec getTypeSpecWithoutInlineTypes() {
        Map<EnumValue, FieldSpec> enumConstants = getConstants();
        VisitorFactory.GeneratedVisitor<EnumValue> generatedVisitor = getVisitor();
        return TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addFields(enumConstants.values())
                .addFields(getPrivateMembers())
                .addMethod(getConstructor())
                .addMethod(getEnumValueMethod())
                .addMethod(getToStringMethod())
                .addMethod(getEqualsMethod())
                .addMethod(getHashCodeMethod())
                .addMethod(getVisitMethod(generatedVisitor))
                .addMethod(getValueOfMethod(enumConstants))
                .addType(getNestedValueEnum())
                .addType(generatedVisitor.typeSpec())
                .build();
    }

    private Map<EnumValue, FieldSpec> getConstants() {
        // Generate public static final constant for each enum value
        return enumTypeDeclaration.getValues().stream()
                .collect(Collectors.toMap(Function.identity(), enumValue -> FieldSpec.builder(
                                className,
                                enumValue
                                        .getName()
                                        .getName()
                                        .getScreamingSnakeCase()
                                        .getSafeName(),
                                Modifier.PUBLIC,
                                Modifier.STATIC,
                                Modifier.FINAL)
                        .initializer(
                                "new $T($T.$L, $S)",
                                className,
                                valueFieldClassName,
                                enumValue
                                        .getName()
                                        .getName()
                                        .getScreamingSnakeCase()
                                        .getSafeName(),
                                enumValue.getName().getWireValue())
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
        FieldSpec stringField = FieldSpec.builder(String.class, STRING_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                .build();
        privateMembers.add(stringField);
        return privateMembers;
    }

    private MethodSpec getConstructor() {
        return MethodSpec.constructorBuilder()
                .addParameter(valueFieldClassName, VALUE_FIELD_NAME)
                .addParameter(String.class, STRING_FIELD_NAME)
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
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addAnnotation(JsonValue.class)
                .addModifiers(Modifier.PUBLIC)
                .addCode("return this.string;")
                .returns(ClassName.get(String.class))
                .build();
    }

    private MethodSpec getEqualsMethod() {
        return MethodSpec.methodBuilder(EQUALS_METHOD_NAME)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ClassName.get(Object.class), "other")
                .addCode(CodeBlock.builder()
                        .add(
                                "return (this == other) \n"
                                        + "  || (other instanceof $T && this.string.equals((($T) other).string));",
                                className,
                                className)
                        .build())
                .returns(boolean.class)
                .build();
    }

    private MethodSpec getHashCodeMethod() {
        return MethodSpec.methodBuilder(HASHCODE_METHOD_NAME)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addModifiers(Modifier.PUBLIC)
                .addCode("return this.string.hashCode();")
                .returns(int.class)
                .build();
    }

    private MethodSpec getVisitMethod(GeneratedVisitor<EnumValue> generatedVisitor) {
        CodeBlock.Builder acceptMethodImplementation = CodeBlock.builder().beginControlFlow("switch (value)");
        generatedVisitor.visitMethodsByKey().forEach((enumValue, visitMethod) -> {
            acceptMethodImplementation
                    .add(
                            "case $L:\n",
                            enumValue
                                    .getName()
                                    .getName()
                                    .getScreamingSnakeCase()
                                    .getSafeName())
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
        return MethodSpec.methodBuilder(VISIT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addTypeVariable(VisitorFactory.VISITOR_RETURN_TYPE)
                .addParameter(VisitorFactory.getVisitorTypeName(className), "visitor")
                .addCode(acceptCodeBlock)
                .returns(VisitorFactory.VISITOR_RETURN_TYPE)
                .build();
    }

    private MethodSpec getValueOfMethod(Map<EnumValue, FieldSpec> constants) {
        CodeBlock.Builder valueOfCodeBlockBuilder =
                CodeBlock.builder().beginControlFlow("switch ($L)", VALUE_FIELD_NAME);
        constants.forEach((enumValue, constantField) -> {
            valueOfCodeBlockBuilder
                    .add("case $S:\n", enumValue.getName().getWireValue())
                    .indent()
                    .addStatement("return $L", constantField.name)
                    .unindent();
        });
        CodeBlock valueOfCodeBlock = valueOfCodeBlockBuilder
                .add("default:\n")
                .indent()
                .addStatement("return new $T(Value.UNKNOWN, $L)", className, VALUE_FIELD_NAME)
                .unindent()
                .endControlFlow()
                .build();
        return MethodSpec.methodBuilder(VALUE_OF_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addAnnotation(FernJavaAnnotations.jacksonDelegatingCreator())
                .addCode(valueOfCodeBlock)
                .returns(className)
                .addParameter(ParameterSpec.builder(ClassName.get(String.class), VALUE_FIELD_NAME)
                        .build())
                .build();
    }

    private TypeSpec getNestedValueEnum() {
        TypeSpec.Builder nestedValueEnumBuilder =
                TypeSpec.enumBuilder(VALUE_TYPE_NAME).addModifiers(Modifier.PUBLIC);
        enumTypeDeclaration
                .getValues()
                .forEach(enumValue -> nestedValueEnumBuilder.addEnumConstant(
                        enumValue.getName().getName().getScreamingSnakeCase().getSafeName()));
        nestedValueEnumBuilder.addEnumConstant(UNKNOWN_ENUM_CONSTANT);
        return nestedValueEnumBuilder.build();
    }

    private GeneratedVisitor<EnumValue> getVisitor() {
        List<VisitorFactory.VisitMethodArgs<EnumValue>> visitMethodArgs = enumTypeDeclaration.getValues().stream()
                .map(enumValue -> {
                    return VisitorFactory.VisitMethodArgs.<EnumValue>builder()
                            .key(enumValue)
                            .pascalCaseName(enumValue
                                    .getName()
                                    .getName()
                                    .getPascalCase()
                                    .getSafeName())
                            .build();
                })
                .collect(Collectors.toList());
        return VisitorFactory.buildVisitorInterface(visitMethodArgs);
    }
}
