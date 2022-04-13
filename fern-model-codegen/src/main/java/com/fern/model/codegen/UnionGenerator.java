package com.fern.model.codegen;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.NamedTypeReference;
import com.fern.SingleUnionType;
import com.fern.TypeDefinition;
import com.fern.UnionTypeDefinition;
import com.fern.model.codegen.utils.ClassNameUtils;
import com.fern.model.codegen.utils.KeyWordUtils;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class UnionGenerator {

    private static final String BASE_CLASS_NAME = "Base";
    private static final String UNKNOWN_CLASS_NAME = "Unknown";
    private static final String VISITOR_CLASS_NAME = "Visitor";

    private static final String VALUE_FIELD_NAME = "value";

    private static final String GET_VALUE_METHOD_NAME = "getValue";
    private static final String ACCEPT_METHOD_NAME = "accept";

    private UnionGenerator() {}

    @SuppressWarnings("MethodLength")
    public static GeneratedUnion generate(
            NamedTypeReference name,
            UnionTypeDefinition unionTypeDefinition,
            Map<NamedTypeReference, TypeDefinition> typeDefinitionsByName) {
        ClassName generatedUnionClass = ClassNameUtils.getClassName(name);
        TypeSpec.Builder unionBuilder = TypeSpec.classBuilder(name.name())
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addAnnotation(Value.Enclosing.class);

        ClassName visitorInterface = generatedUnionClass.nestedClass(VISITOR_CLASS_NAME);
        TypeVariableName visitorReturnType = TypeVariableName.get("T");
        TypeSpec.Builder visitorBuilder =
                TypeSpec.interfaceBuilder(visitorInterface).addTypeVariable(visitorReturnType);
        unionTypeDefinition.types().forEach(singleUnionType -> {
            String methodName = "visit" + StringUtils.capitalize(singleUnionType.discriminantValue());
            visitorBuilder.addMethod(MethodSpec.methodBuilder(methodName)
                    .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                    .addParameter(
                            singleUnionType.valueType().accept(TypeReferenceToTypeNameConverter.INSTANCE), "value")
                    .returns(visitorReturnType)
                    .build());
        });
        visitorBuilder.addMethod(MethodSpec.methodBuilder("visitUnknown")
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .returns(visitorReturnType)
                .addParameter(String.class, "unknownType")
                .build());
        unionBuilder.addType(visitorBuilder.build());

        Map<SingleUnionType, ClassName> unionTypesToClassName = unionTypeDefinition.types().stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        singleUnionType -> generatedUnionClass.nestedClass(
                                StringUtils.capitalize(singleUnionType.discriminantValue()))));
        ClassName unknownInterfaceClass = generatedUnionClass.nestedClass(UNKNOWN_CLASS_NAME);

        ClassName baseInterface = generatedUnionClass.nestedClass(BASE_CLASS_NAME);
        TypeVariableName acceptReturnType = TypeVariableName.get("T");
        TypeSpec.Builder baseInterfaceBuilder = TypeSpec.interfaceBuilder(baseInterface)
                .addModifiers(Modifier.PRIVATE)
                .addMethod(MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                        .addParameter(ParameterSpec.builder(
                                        ParameterizedTypeName.get(visitorInterface, acceptReturnType), "visitor")
                                .build())
                        .returns(acceptReturnType)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PRIVATE)
                        .build())
                .addAnnotation(AnnotationSpec.builder(JsonTypeInfo.class)
                        .addMember("use", "$T.$L", ClassName.get(JsonTypeInfo.Id.class), JsonTypeInfo.Id.NAME.name())
                        .addMember(
                                "include",
                                "$T.$L",
                                ClassName.get(JsonTypeInfo.As.class),
                                JsonTypeInfo.As.EXISTING_PROPERTY.name())
                        .addMember("property", "type")
                        .addMember("visible", "true")
                        .addMember("defaultImpl", "$T.class", unknownInterfaceClass)
                        .build());
        AnnotationSpec.Builder jsonSubTypeAnnotationBuilder = AnnotationSpec.builder(JsonSubTypes.class);
        KeyedStream.stream(unionTypesToClassName).forEach((singleUnionType, unionTypeClassName) -> {
            AnnotationSpec subTypeAnnotation = AnnotationSpec.builder(JsonSubTypes.Type.class)
                    .addMember("value", "$T.class", unionTypeClassName)
                    .addMember("name", "$S", singleUnionType.discriminantValue())
                    .build();
            jsonSubTypeAnnotationBuilder.addMember("value", "$L", subTypeAnnotation);
        });
        baseInterfaceBuilder
                .addAnnotation(jsonSubTypeAnnotationBuilder.build())
                .addAnnotation(AnnotationSpec.builder(JsonIgnoreProperties.class)
                        .addMember("ignoreUnknown", "true")
                        .build());
        TypeSpec baseInterfaceTypeSpec = baseInterfaceBuilder.build();
        unionBuilder.addType(baseInterfaceTypeSpec);

        unionBuilder.addField(FieldSpec.builder(baseInterface, VALUE_FIELD_NAME)
                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                .build());

        unionBuilder.addMethod(MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(baseInterface, VALUE_FIELD_NAME)
                .addStatement("this.value = value")
                .addAnnotation(AnnotationSpec.builder(JsonCreator.class)
                        .addMember(
                                "mode",
                                "$T.$L",
                                ClassName.get(JsonCreator.Mode.class),
                                JsonCreator.Mode.DELEGATING.name())
                        .build())
                .build());

        unionBuilder.addMethod(MethodSpec.methodBuilder(GET_VALUE_METHOD_NAME)
                .returns(baseInterface)
                .addStatement("return value")
                .addAnnotation(JsonValue.class)
                .build());

        unionTypeDefinition.types().forEach(singleUnionType -> {
            String keyWordCompatibleName = KeyWordUtils.getKeyWordCompatibleName(singleUnionType.discriminantValue());
            MethodSpec staticBuilder = MethodSpec.methodBuilder(keyWordCompatibleName)
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .addParameter(
                            singleUnionType.valueType().accept(TypeReferenceToTypeNameConverter.INSTANCE), "value")
                    .returns(generatedUnionClass)
                    .addStatement(
                            "return new $T($T.of(value))",
                            generatedUnionClass,
                            unionTypesToClassName.get(singleUnionType))
                    .build();
            unionBuilder.addMethod(staticBuilder);
        });

        unionTypeDefinition.types().forEach(singleUnionType -> {
            MethodSpec isType = MethodSpec.methodBuilder(
                            "is" + StringUtils.capitalize(singleUnionType.discriminantValue()))
                    .addModifiers(Modifier.PUBLIC)
                    .returns(boolean.class)
                    .addStatement("return value instanceof $T", unionTypesToClassName.get(singleUnionType))
                    .build();
            unionBuilder.addMethod(isType);
        });

        unionTypeDefinition.types().forEach(singleUnionType -> {
            TypeName typeName = singleUnionType.valueType().accept(TypeReferenceToTypeNameConverter.NESTED_INSTANCE);
            String capitalizedDiscriminantValue = StringUtils.capitalize(singleUnionType.discriminantValue());
            MethodSpec getType = MethodSpec.methodBuilder("get" + capitalizedDiscriminantValue)
                    .addModifiers(Modifier.PUBLIC)
                    .returns(ParameterizedTypeName.get(ClassName.get(Optional.class), typeName))
                    .beginControlFlow("if (is$L())", capitalizedDiscriminantValue)
                    .addStatement(
                            "return $T.of((($T) value).$L())",
                            ClassName.get(Optional.class),
                            unionTypesToClassName.get(singleUnionType),
                            singleUnionType.discriminantValue())
                    .endControlFlow()
                    .addStatement("return $T.empty()", ClassName.get(Optional.class))
                    .build();
            unionBuilder.addMethod(getType);
        });

        MethodSpec acceptMethod = MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterizedTypeName.get(visitorInterface, visitorReturnType), "visitor")
                .returns(visitorReturnType)
                .addStatement("return value.accept(visitor)")
                .build();
        unionBuilder.addMethod(acceptMethod);

        unionTypeDefinition.types().forEach(singleUnionType -> {
            boolean unionIsObject = singleUnionType.valueType().isNamed()
                    && typeDefinitionsByName
                            .get(singleUnionType.valueType().getNamed().get())
                            .shape()
                            .isObject();
            MethodSpec.Builder discriminantMethod = MethodSpec.methodBuilder(singleUnionType.discriminantValue())
                    .returns(singleUnionType.valueType().accept(TypeReferenceToTypeNameConverter.INSTANCE))
                    .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC);
            if (unionIsObject) {
                discriminantMethod.addAnnotation(JsonValue.class);
            }
            String capitalizedDiscriminantValue = StringUtils.capitalize(singleUnionType.discriminantValue());
            TypeSpec nestedUnion = TypeSpec.interfaceBuilder(capitalizedDiscriminantValue)
                    .addAnnotation(Value.Immutable.class)
                    .addAnnotation(AnnotationSpec.builder(JsonTypeName.class)
                            .addMember("value", "$S", singleUnionType.discriminantValue())
                            .build())
                    .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                            .addMember(
                                    "as",
                                    "Immutable$L.$L.class",
                                    generatedUnionClass.simpleName(),
                                    unionTypesToClassName.get(singleUnionType).simpleName())
                            .build())
                    .addSuperinterface(baseInterface)
                    .addMethod(discriminantMethod.build())
                    .addMethod(MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                            .returns(visitorReturnType)
                            .addParameter(ParameterizedTypeName.get(visitorInterface, visitorReturnType), "visitor")
                            .addAnnotation(Override.class)
                            .addStatement(
                                    "visitor.visit$L($L())",
                                    capitalizedDiscriminantValue,
                                    singleUnionType.discriminantValue())
                            .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                            .build())
                    .addMethod(MethodSpec.methodBuilder("of")
                            .addModifiers(Modifier.STATIC, Modifier.PUBLIC)
                            .returns(unionTypesToClassName.get(singleUnionType))
                            .addParameter(
                                    singleUnionType.valueType().accept(TypeReferenceToTypeNameConverter.INSTANCE),
                                    "value")
                            .addStatement(
                                    "return Immutable$L.$L.builder().$L(value).build()",
                                    generatedUnionClass.simpleName(),
                                    unionTypesToClassName.get(singleUnionType).simpleName(),
                                    singleUnionType.discriminantValue())
                            .build())
                    .build();
            unionBuilder.addType(nestedUnion);
        });

        TypeSpec unknownType = TypeSpec.interfaceBuilder(UNKNOWN_CLASS_NAME)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("as", "Immutable$L.$L.class", generatedUnionClass.simpleName(), UNKNOWN_CLASS_NAME)
                        .build())
                .addMethod(MethodSpec.methodBuilder("value")
                        .returns(ParameterizedTypeName.get(
                                ClassName.get(Map.class), ClassName.get(String.class), ClassName.get(Object.class)))
                        .addAnnotation(JsonValue.class)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .build())
                .addMethod(MethodSpec.methodBuilder("type")
                        .returns(String.class)
                        .addStatement("return value().get(\"type\").toString()")
                        .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                        .build())
                .addMethod(MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                        .returns(visitorReturnType)
                        .addParameter(ParameterizedTypeName.get(visitorInterface, visitorReturnType), "visitor")
                        .addAnnotation(Override.class)
                        .addStatement("visitor.visitUnknown(type())")
                        .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                        .build())
                .build();
        unionBuilder.addType(unknownType);

        JavaFile unionFile = JavaFile.builder(generatedUnionClass.packageName(), unionBuilder.build())
                .build();
        return GeneratedUnion.builder()
                .file(unionFile)
                .definition(unionTypeDefinition)
                .build();
    }
}
