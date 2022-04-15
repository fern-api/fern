package com.fern.model.codegen.union;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.NamedType;
import com.fern.SingleUnionType;
import com.fern.TypeDefinition;
import com.fern.TypeReference;
import com.fern.UnionTypeDefinition;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.GeneratorContext;
import com.fern.model.codegen.utils.ClassNameUtils;
import com.fern.model.codegen.utils.VisitorUtils;
import com.fern.model.codegen.utils.VisitorUtils.GeneratedVisitor;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class UnionGenerator extends Generator<UnionTypeDefinition> {

    public static final String UNION_DISCRIMINATOR_PROPERTY_NAME = "_type";

    private static final Modifier[] UNION_CLASS_MODIFIERS = new Modifier[] {Modifier.PUBLIC, Modifier.FINAL};

    private static final String INTERNAL_VALUE_INTERFACE_NAME = "InternalValue";
    private static final String UNKNOWN_INTERNAL_VALUE_INTERFACE_NAME = "Unknown";

    private static final String VALUE_FIELD_NAME = "value";

    private static final String IS_METHOD_NAME_PREFIX = "is";
    private static final String GET_INTERNAL_VALUE_METHOD_NAME = "getInternalValue";
    private static final String ACCEPT_METHOD_NAME = "accept";

    private final NamedType namedType;
    private final UnionTypeDefinition unionTypeDefinition;
    private final Map<NamedType, TypeDefinition> typeDefinitionsByName;
    private final ClassName generatedUnionClassName;
    private final Map<SingleUnionType, ClassName> internalValueClassNames;
    private final ClassName unknownInternalValueClassName;
    private final ClassName internalValueInterfaceClassName;

    public UnionGenerator(
            NamedType namedType, UnionTypeDefinition unionTypeDefinition, GeneratorContext generatorContext) {
        super(generatorContext);
        this.namedType = namedType;
        this.unionTypeDefinition = unionTypeDefinition;
        this.typeDefinitionsByName = generatorContext.getTypeDefinitionsByName();
        this.generatedUnionClassName = generatorContext.getClassNameUtils().getClassName(namedType);
        this.internalValueClassNames = unionTypeDefinition.types().stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        singleUnionType -> generatedUnionClassName.nestedClass(
                                StringUtils.capitalize(singleUnionType.discriminantValue()))));
        this.unknownInternalValueClassName = generatedUnionClassName.nestedClass(UNKNOWN_INTERNAL_VALUE_INTERFACE_NAME);
        this.internalValueInterfaceClassName = generatedUnionClassName.nestedClass(INTERNAL_VALUE_INTERFACE_NAME);
    }

    public GeneratedUnion generate() {
        Map<SingleUnionType, MethodSpec> isTypeMethods = getIsTypeMethods();
        TypeSpec unionTypeSpec = TypeSpec.classBuilder(generatedUnionClassName)
                .addModifiers(UNION_CLASS_MODIFIERS)
                .addAnnotations(getAnnotations())
                .addFields(getFields())
                .addMethod(getConstructor())
                .addMethod(getInternalValueMethod())
                .addMethods(getStaticBuilderMethods())
                .addMethods(isTypeMethods.values())
                .addMethods(getSingleUnionTypeGetterMethods(isTypeMethods))
                .addMethod(getAcceptMethod())
                .addType(getVisitor().typeSpec())
                .addType(getInternalValueInterface())
                .addTypes(getInternalValueTypeSpecs())
                .addType(getUnknownInternalValueTypeSpec())
                .build();
        JavaFile unionFile = JavaFile.builder(generatedUnionClassName.packageName(), unionTypeSpec)
                .build();
        return GeneratedUnion.builder()
                .file(unionFile)
                .definition(unionTypeDefinition)
                .className(generatedUnionClassName)
                .build();
    }

    private List<AnnotationSpec> getAnnotations() {
        return Collections.singletonList(
                AnnotationSpec.builder(Value.Enclosing.class).build());
    }

    private List<FieldSpec> getFields() {
        return Collections.singletonList(FieldSpec.builder(internalValueInterfaceClassName, VALUE_FIELD_NAME)
                .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                .build());
    }

    private MethodSpec getConstructor() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(generatedUnionClassName, VALUE_FIELD_NAME)
                .addStatement("this.$L = $L", VALUE_FIELD_NAME, VALUE_FIELD_NAME)
                .addAnnotation(AnnotationSpec.builder(JsonCreator.class)
                        .addMember(
                                "mode",
                                "$T.$L",
                                ClassName.get(JsonCreator.Mode.class),
                                JsonCreator.Mode.DELEGATING.name())
                        .build())
                .build();
    }

    private MethodSpec getInternalValueMethod() {
        return MethodSpec.methodBuilder(GET_INTERNAL_VALUE_METHOD_NAME)
                .returns(internalValueInterfaceClassName)
                .addStatement("return value")
                .addAnnotation(JsonValue.class)
                .build();
    }

    private List<MethodSpec> getStaticBuilderMethods() {
        return unionTypeDefinition.types().stream()
                .map(singleUnionType -> {
                    String keyWordCompatibleName = generatorContext
                            .getKeyWordUtils()
                            .getKeyWordCompatibleName(singleUnionType.discriminantValue());
                    return MethodSpec.methodBuilder(keyWordCompatibleName)
                            .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                            .addParameter(
                                    generatorContext
                                            .getTypeReferenceUtils()
                                            .convertToTypeName(true, singleUnionType.valueType()),
                                    "value")
                            .returns(generatedUnionClassName)
                            .addStatement(
                                    "return new $T($T.of(value))",
                                    generatedUnionClassName,
                                    internalValueClassNames.get(singleUnionType))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private Map<SingleUnionType, MethodSpec> getIsTypeMethods() {
        return unionTypeDefinition.types().stream()
                .collect(Collectors.toMap(Function.identity(), singleUnionType -> MethodSpec.methodBuilder(
                                IS_METHOD_NAME_PREFIX + StringUtils.capitalize(singleUnionType.discriminantValue()))
                        .addModifiers(Modifier.PUBLIC)
                        .returns(boolean.class)
                        .addStatement("return value instanceof $T", internalValueClassNames.get(singleUnionType))
                        .build()));
    }

    private List<MethodSpec> getSingleUnionTypeGetterMethods(Map<SingleUnionType, MethodSpec> isTypeMethods) {
        return unionTypeDefinition.types().stream()
                .map(singleUnionType -> {
                    TypeName singleUnionTypeName = generatorContext
                            .getTypeReferenceUtils()
                            .convertToTypeName(false, singleUnionType.valueType());
                    String capitalizedDiscriminantValue = StringUtils.capitalize(singleUnionType.discriminantValue());
                    return MethodSpec.methodBuilder("get" + capitalizedDiscriminantValue)
                            .addModifiers(Modifier.PUBLIC)
                            .returns(ParameterizedTypeName.get(ClassNameUtils.OPTIONAL_CLASS_NAME, singleUnionTypeName))
                            .beginControlFlow("if ($L())", isTypeMethods.get(singleUnionType).name)
                            .addStatement(
                                    "return $T.of((($T) value).$L())",
                                    ClassNameUtils.OPTIONAL_CLASS_NAME,
                                    internalValueClassNames.get(singleUnionType),
                                    singleUnionType.discriminantValue())
                            // TODO(dsinghvi): want to get direct methodspec and name
                            .endControlFlow()
                            .addStatement("return $T.empty()", ClassNameUtils.OPTIONAL_CLASS_NAME)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private MethodSpec getAcceptMethod() {
        return MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(generatorContext.getVisitorUtils().getVisitorTypeName(generatedUnionClassName), "visitor")
                .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                .addStatement("return value.accept(visitor)")
                .build();
    }

    private GeneratedVisitor getVisitor() {
        List<VisitorUtils.VisitMethodArgs> visitMethodArgs = unionTypeDefinition.types().stream()
                .map(singleUnionType -> VisitorUtils.VisitMethodArgs.builder()
                        .keyName(singleUnionType.discriminantValue())
                        .visitorType(generatorContext
                                .getTypeReferenceUtils()
                                .convertToTypeName(true, singleUnionType.valueType()))
                        .build())
                .collect(Collectors.toList());
        return generatorContext.getVisitorUtils().buildVisitorInterface(visitMethodArgs);
    }

    /*
     * Example of an InternalValue code generation below.
     * @JsonTypeInfo(
     *         use = JsonTypeInfo.Id.NAME,
     *         include = JsonTypeInfo.As.PROPERTY,
     *         property = "_type",
     *         visible = true,
     *         defaultImpl = Unknown.class)
     * @JsonSubTypes({
     *         @JsonSubTypes.Type(value = On.class, name = "on"),
     *         @JsonSubTypes.Type(value = Off.class, name = "off")
     * })
     * @JsonIgnoreProperties(ignoreUnknown = true)
     * private interface InternalValue {
     *     <T> T accept(Visitor<T> visitor);
     * }
     */
    private TypeSpec getInternalValueInterface() {
        TypeVariableName acceptReturnType = TypeVariableName.get("T");
        TypeSpec.Builder baseInterfaceTypeSpecBuilder = TypeSpec.interfaceBuilder(internalValueInterfaceClassName)
                .addModifiers(Modifier.PRIVATE)
                .addMethod(MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                        .addParameter(ParameterSpec.builder(
                                        generatorContext.getVisitorUtils().getVisitorTypeName(generatedUnionClassName),
                                        "visitor")
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
                        .addMember("property", "$S", UNION_DISCRIMINATOR_PROPERTY_NAME)
                        .addMember("visible", "true")
                        .addMember("defaultImpl", "$T.class", unknownInternalValueClassName)
                        .build());
        AnnotationSpec.Builder jsonSubTypeAnnotationBuilder = AnnotationSpec.builder(JsonSubTypes.class);
        KeyedStream.stream(internalValueClassNames).forEach((singleUnionType, unionTypeClassName) -> {
            AnnotationSpec subTypeAnnotation = AnnotationSpec.builder(JsonSubTypes.Type.class)
                    .addMember("value", "$T.class", unionTypeClassName)
                    .addMember("name", "$S", singleUnionType.discriminantValue())
                    .build();
            jsonSubTypeAnnotationBuilder.addMember("value", "$L", subTypeAnnotation);
        });
        baseInterfaceTypeSpecBuilder
                .addAnnotation(jsonSubTypeAnnotationBuilder.build())
                .addAnnotation(AnnotationSpec.builder(JsonIgnoreProperties.class)
                        .addMember("ignoreUnknown", "true")
                        .build());
        return baseInterfaceTypeSpecBuilder.build();
    }

    private List<TypeSpec> getInternalValueTypeSpecs() {
        return unionTypeDefinition.types().stream()
                .map(singleUnionType -> {
                    String capitalizedDiscriminantValue = StringUtils.capitalize(singleUnionType.discriminantValue());
                    ClassName internalValueClassName = internalValueClassNames.get(singleUnionType);
                    return TypeSpec.interfaceBuilder(capitalizedDiscriminantValue)
                            .addAnnotation(Value.Immutable.class)
                            .addAnnotation(AnnotationSpec.builder(JsonTypeName.class)
                                    .addMember("value", "$S", singleUnionType.discriminantValue())
                                    .build())
                            .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                                    .addMember(
                                            "as",
                                            "$T.$L.class",
                                            generatorContext
                                                    .getImmutablesUtils()
                                                    .getImmutablesClassName(namedType),
                                            internalValueClassName.simpleName())
                                    .build())
                            .addSuperinterface(internalValueInterfaceClassName)
                            .addMethod(getInternalValueImmutablesProperty(singleUnionType))
                            .addMethod(MethodSpec.methodBuilder(ACCEPT_METHOD_NAME)
                                    .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                                    .addParameter(
                                            generatorContext
                                                    .getVisitorUtils()
                                                    .getVisitorTypeName(generatedUnionClassName),
                                            "visitor")
                                    .addAnnotation(Override.class)
                                    .addStatement(
                                            "visitor.visit$L($L())",
                                            capitalizedDiscriminantValue,
                                            singleUnionType.discriminantValue())
                                    .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                                    .build())
                            .addMethod(MethodSpec.methodBuilder("of")
                                    .addModifiers(Modifier.STATIC, Modifier.PUBLIC)
                                    .returns(internalValueClassName)
                                    .addParameter(
                                            generatorContext
                                                    .getTypeReferenceUtils()
                                                    .convertToTypeName(true, singleUnionType.valueType()),
                                            "value")
                                    .addStatement(
                                            "return Immutable$L.$L.builder().$L(value).build()",
                                            generatedUnionClassName.simpleName(),
                                            internalValueClassName.simpleName(),
                                            singleUnionType.discriminantValue())
                                    .build())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private TypeSpec getUnknownInternalValueTypeSpec() {
        return TypeSpec.interfaceBuilder(UNKNOWN_INTERNAL_VALUE_INTERFACE_NAME)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember(
                                "as",
                                "$T.$L.class",
                                generatorContext.getImmutablesUtils().getImmutablesClassName(namedType),
                                UNKNOWN_INTERNAL_VALUE_INTERFACE_NAME)
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
                        .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                        .addParameter(
                                generatorContext.getVisitorUtils().getVisitorTypeName(generatedUnionClassName),
                                "visitor")
                        .addAnnotation(Override.class)
                        .addStatement("visitor.visitUnknown(type())")
                        .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                        .build())
                .build();
    }

    private MethodSpec getInternalValueImmutablesProperty(SingleUnionType singleUnionType) {
        TypeName returnTypeName =
                generatorContext.getTypeReferenceUtils().convertToTypeName(true, singleUnionType.valueType());
        MethodSpec internalValueImmutablesProperty = generatorContext
                .getImmutablesUtils()
                .getKeyWordCompatibleImmutablesPropertyMethod(singleUnionType.discriminantValue(), returnTypeName);
        // Add @JsonValue annotation on object type reference because properties are collapsed one level
        if (isTypeReferenceAnObject(singleUnionType.valueType())) {
            return MethodSpec.methodBuilder(internalValueImmutablesProperty.name)
                    .addModifiers(internalValueImmutablesProperty.modifiers)
                    .addAnnotations(internalValueImmutablesProperty.annotations)
                    .addAnnotation(JsonValue.class)
                    .returns(internalValueImmutablesProperty.returnType)
                    .build();
        }
        return internalValueImmutablesProperty;
    }

    private boolean isTypeReferenceAnObject(TypeReference typeReference) {
        Optional<NamedType> maybeNamedType = typeReference.getNamed();
        if (maybeNamedType.isPresent()) {
            TypeDefinition typeDefinition = typeDefinitionsByName.get(maybeNamedType.get());
            if (typeDefinition.shape().isObject()) {
                return true;
            } else if (typeDefinition.shape().isAlias()) {
                return isTypeReferenceAnObject(
                        typeDefinition.shape().getAlias().get().aliasOf());
            }
        }
        return false;
    }
}
