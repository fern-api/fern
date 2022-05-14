package com.fern.model.codegen;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.KeyWordUtils;
import com.fern.codegen.utils.VisitorUtils;
import com.fern.codegen.utils.VisitorUtils.GeneratedVisitor;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.types.NamedType;
import com.fern.types.types.SingleUnionType;
import com.fern.types.types.TypeDefinition;
import com.fern.types.types.TypeReference;
import com.fern.types.types.UnionTypeDefinition;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class UnionGenerator extends Generator {

    private static final Modifier[] UNION_CLASS_MODIFIERS = new Modifier[] {Modifier.PUBLIC, Modifier.FINAL};

    private static final String INTERNAL_VALUE_INTERFACE_NAME = "InternalValue";
    private static final String INTERNAL_CLASS_NAME_PREFIX = "Internal";
    private static final String INTERNAL_CLASS_NAME_SUFFIX = "Value";

    private static final String UNKNOWN_INTERNAL_VALUE_INTERFACE_NAME = "Unknown";

    private static final String VALUE_FIELD_NAME = "value";
    private static final String IS_METHOD_NAME_PREFIX = "is";
    private static final String GET_INTERNAL_VALUE_METHOD_NAME = "getInternalValue";
    private static final String VISIT_METHOD_NAME = "visit";

    private final NamedType namedType;
    private final UnionTypeDefinition unionTypeDefinition;
    private final Map<NamedType, TypeDefinition> typeDefinitionsByName;
    private final ClassName generatedUnionClassName;
    private final ClassName generatedUnionImmutablesClassName;
    private final Map<SingleUnionType, ClassName> internalValueClassNames;
    private final ClassName unknownInternalValueClassName;
    private final ClassName internalValueInterfaceClassName;

    public UnionGenerator(
            NamedType namedType,
            PackageType packageType,
            UnionTypeDefinition unionTypeDefinition,
            GeneratorContext generatorContext) {
        super(generatorContext, packageType);
        this.namedType = namedType;
        this.unionTypeDefinition = unionTypeDefinition;
        this.typeDefinitionsByName = generatorContext.getTypeDefinitionsByName();
        this.generatedUnionClassName =
                generatorContext.getClassNameUtils().getClassNameForNamedType(namedType, packageType);
        this.generatedUnionImmutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(generatedUnionClassName);
        this.internalValueClassNames = unionTypeDefinition.types().stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        singleUnionType -> generatedUnionClassName.nestedClass(INTERNAL_CLASS_NAME_PREFIX
                                + StringUtils.capitalize(singleUnionType.discriminantValue())
                                + INTERNAL_CLASS_NAME_SUFFIX)));
        this.unknownInternalValueClassName = generatedUnionClassName.nestedClass(UNKNOWN_INTERNAL_VALUE_INTERFACE_NAME);
        this.internalValueInterfaceClassName = generatedUnionClassName.nestedClass(INTERNAL_VALUE_INTERFACE_NAME);
    }

    @Override
    public GeneratedUnion generate() {
        Map<SingleUnionType, MethodSpec> isTypeMethods = getIsTypeMethods();
        GeneratedVisitor<SingleUnionType> visitor = getVisitor();
        Map<SingleUnionType, GeneratedInternalValueTypeSpec> internalValueTypeSpecs =
                getInternalValueTypeSpecs(visitor);
        TypeSpec unionTypeSpec = TypeSpec.classBuilder(generatedUnionClassName)
                .addModifiers(UNION_CLASS_MODIFIERS)
                .addAnnotations(getAnnotations())
                .addFields(getFields())
                .addMethod(getConstructor())
                .addMethod(getInternalValueMethod())
                .addMethods(getStaticBuilderMethods())
                .addMethods(isTypeMethods.values())
                .addMethods(getSingleUnionTypeGetterMethods(isTypeMethods, internalValueTypeSpecs))
                .addMethod(getVisitMethod())
                .addType(visitor.typeSpec())
                .addType(getInternalValueInterface())
                .addTypes(internalValueTypeSpecs.values().stream()
                        .map(GeneratedInternalValueTypeSpec::typeSpec)
                        .collect(Collectors.toList()))
                .addType(getUnknownInternalValueTypeSpec())
                .build();
        JavaFile unionFile = JavaFile.builder(generatedUnionClassName.packageName(), unionTypeSpec)
                .build();
        return GeneratedUnion.builder()
                .file(unionFile)
                .className(generatedUnionClassName)
                .unionTypeDefinition(unionTypeDefinition)
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
                .addParameter(internalValueInterfaceClassName, VALUE_FIELD_NAME)
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
                    String keyWordCompatibleName =
                            KeyWordUtils.getKeyWordCompatibleName(singleUnionType.discriminantValue());
                    MethodSpec.Builder staticBuilder = MethodSpec.methodBuilder(keyWordCompatibleName)
                            .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                            .returns(generatedUnionClassName);
                    // static builders for void types should have no parameters
                    if (!singleUnionType.valueType().isVoid()) {
                        return staticBuilder
                                .addParameter(
                                        generatorContext
                                                .getClassNameUtils()
                                                .getTypeNameFromTypeReference(true, singleUnionType.valueType()),
                                        "value")
                                .addStatement(
                                        "return new $T($T.of(value))",
                                        generatedUnionClassName,
                                        internalValueClassNames.get(singleUnionType))
                                .build();
                    } else {
                        return staticBuilder
                                .addStatement(
                                        "return new $T($T.of())",
                                        generatedUnionClassName,
                                        internalValueClassNames.get(singleUnionType))
                                .build();
                    }
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

    private List<MethodSpec> getSingleUnionTypeGetterMethods(
            Map<SingleUnionType, MethodSpec> isTypeMethods,
            Map<SingleUnionType, GeneratedInternalValueTypeSpec> internalValueTypeSpecs) {
        return unionTypeDefinition.types().stream()
                // Only non void single union types have getter methods
                .filter(singleUnionType -> internalValueTypeSpecs
                        .get(singleUnionType)
                        .internalValueImmutablesProperty()
                        .isPresent())
                .map(singleUnionType -> {
                    TypeName singleUnionTypeName = generatorContext
                            .getClassNameUtils()
                            .getTypeNameFromTypeReference(false, singleUnionType.valueType());
                    String capitalizedDiscriminantValue = StringUtils.capitalize(singleUnionType.discriminantValue());
                    return MethodSpec.methodBuilder("get" + capitalizedDiscriminantValue)
                            .addModifiers(Modifier.PUBLIC)
                            .returns(ParameterizedTypeName.get(ClassNameUtils.OPTIONAL_CLASS_NAME, singleUnionTypeName))
                            .beginControlFlow("if ($L())", isTypeMethods.get(singleUnionType).name)
                            .addStatement(
                                    "return $T.of((($T) value).$L())",
                                    ClassNameUtils.OPTIONAL_CLASS_NAME,
                                    internalValueClassNames.get(singleUnionType),
                                    internalValueTypeSpecs
                                            .get(singleUnionType)
                                            .internalValueImmutablesProperty()
                                            .get()
                                            .name)
                            .endControlFlow()
                            .addStatement("return $T.empty()", ClassNameUtils.OPTIONAL_CLASS_NAME)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private MethodSpec getVisitMethod() {
        return MethodSpec.methodBuilder(VISIT_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .addTypeVariable(VisitorUtils.VISITOR_RETURN_TYPE)
                .addParameter(generatorContext.getVisitorUtils().getVisitorTypeName(generatedUnionClassName), "visitor")
                .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                .addStatement("return value.visit(visitor)")
                .build();
    }

    private GeneratedVisitor<SingleUnionType> getVisitor() {
        List<VisitorUtils.VisitMethodArgs<SingleUnionType>> visitMethodArgsList = unionTypeDefinition.types().stream()
                .map(this::getVisitMethodArgs)
                .collect(Collectors.toList());
        return generatorContext.getVisitorUtils().buildVisitorInterface(visitMethodArgsList);
    }

    private VisitorUtils.VisitMethodArgs<SingleUnionType> getVisitMethodArgs(SingleUnionType singleUnionType) {
        if (singleUnionType.valueType().isVoid()) {
            return VisitorUtils.VisitMethodArgs.<SingleUnionType>builder()
                    .key(singleUnionType)
                    .keyName(singleUnionType.discriminantValue())
                    .build();
        } else {
            return VisitorUtils.VisitMethodArgs.<SingleUnionType>builder()
                    .key(singleUnionType)
                    .keyName(singleUnionType.discriminantValue())
                    .visitorType(generatorContext
                            .getClassNameUtils()
                            .getTypeNameFromTypeReference(true, singleUnionType.valueType()))
                    .build();
        }
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
        TypeSpec.Builder baseInterfaceTypeSpecBuilder = TypeSpec.interfaceBuilder(internalValueInterfaceClassName)
                .addModifiers(Modifier.PRIVATE)
                .addMethod(MethodSpec.methodBuilder(VISIT_METHOD_NAME)
                        .addParameter(ParameterSpec.builder(
                                        generatorContext.getVisitorUtils().getVisitorTypeName(generatedUnionClassName),
                                        "visitor")
                                .build())
                        .addTypeVariable(VisitorUtils.VISITOR_RETURN_TYPE)
                        .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .build())
                .addAnnotation(AnnotationSpec.builder(JsonTypeInfo.class)
                        .addMember("use", "$T.$L", ClassName.get(JsonTypeInfo.Id.class), JsonTypeInfo.Id.NAME.name())
                        .addMember(
                                "include",
                                "$T.$L",
                                ClassName.get(JsonTypeInfo.As.class),
                                JsonTypeInfo.As.EXISTING_PROPERTY.name())
                        .addMember("property", "$S", unionTypeDefinition.discriminant())
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

    private Map<SingleUnionType, GeneratedInternalValueTypeSpec> getInternalValueTypeSpecs(
            GeneratedVisitor<SingleUnionType> generatedVisitor) {
        return unionTypeDefinition.types().stream().collect(Collectors.toMap(Function.identity(), singleUnionType -> {
            String capitalizedDiscriminantValue = StringUtils.capitalize(singleUnionType.discriminantValue());
            ClassName internalValueClassName = internalValueClassNames.get(singleUnionType);
            MethodSpec visitorMethodName =
                    generatedVisitor.visitMethodsByKeyName().get(singleUnionType);

            TypeSpec.Builder typeSpecBuilder = TypeSpec.interfaceBuilder(internalValueClassName)
                    .addAnnotation(Value.Immutable.class)
                    .addAnnotation(AnnotationSpec.builder(JsonTypeName.class)
                            .addMember("value", "$S", singleUnionType.discriminantValue())
                            .build())
                    .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                            .addMember(
                                    "as",
                                    "$T.$L.class",
                                    generatedUnionImmutablesClassName,
                                    internalValueClassName.simpleName())
                            .build())
                    .addSuperinterface(internalValueInterfaceClassName);

            // No immutables properties for nested void types
            if (!singleUnionType.valueType().isVoid()) {
                MethodSpec internalValueImmutablesProperty = getInternalValueImmutablesProperty(singleUnionType);
                TypeSpec typeSpec = typeSpecBuilder
                        .addMethod(internalValueImmutablesProperty)
                        .addMethod(MethodSpec.methodBuilder(VISIT_METHOD_NAME)
                                .addTypeVariable(VisitorUtils.VISITOR_RETURN_TYPE)
                                .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                                .addParameter(
                                        generatorContext.getVisitorUtils().getVisitorTypeName(generatedUnionClassName),
                                        "visitor")
                                .addAnnotation(Override.class)
                                .addStatement(
                                        "return visitor.$L($L())",
                                        visitorMethodName.name,
                                        internalValueImmutablesProperty.name)
                                .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                                .build())
                        .addMethod(MethodSpec.methodBuilder("of")
                                .addModifiers(Modifier.STATIC, Modifier.PUBLIC)
                                .returns(internalValueClassName)
                                .addParameter(
                                        generatorContext
                                                .getClassNameUtils()
                                                .getTypeNameFromTypeReference(true, singleUnionType.valueType()),
                                        "value")
                                .addStatement(
                                        "return Immutable$L.$L.builder().$L(value).build()",
                                        generatedUnionClassName.simpleName(),
                                        internalValueClassName.simpleName(),
                                        internalValueImmutablesProperty.name)
                                .build())
                        .build();
                return GeneratedInternalValueTypeSpec.builder()
                        .typeSpec(typeSpec)
                        .internalValueImmutablesProperty(internalValueImmutablesProperty)
                        .build();
            } else {
                TypeSpec typeSpec = typeSpecBuilder
                        .addMethod(MethodSpec.methodBuilder(VISIT_METHOD_NAME)
                                .addTypeVariable(VisitorUtils.VISITOR_RETURN_TYPE)
                                .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                                .addParameter(
                                        generatorContext.getVisitorUtils().getVisitorTypeName(generatedUnionClassName),
                                        "visitor")
                                .addAnnotation(Override.class)
                                .addStatement("return visitor.visit$L()", capitalizedDiscriminantValue)
                                .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                                .build())
                        .addMethod(MethodSpec.methodBuilder("of")
                                .addModifiers(Modifier.STATIC, Modifier.PUBLIC)
                                .returns(internalValueClassName)
                                .addStatement(
                                        "return Immutable$L.$L.builder().build()",
                                        generatedUnionClassName.simpleName(),
                                        internalValueClassName.simpleName())
                                .build())
                        .build();
                return GeneratedInternalValueTypeSpec.builder()
                        .typeSpec(typeSpec)
                        .build();
            }
        }));
    }

    private TypeSpec getUnknownInternalValueTypeSpec() {
        return TypeSpec.interfaceBuilder(UNKNOWN_INTERNAL_VALUE_INTERFACE_NAME)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember(
                                "as",
                                "$T.$L.class",
                                generatedUnionImmutablesClassName,
                                UNKNOWN_INTERNAL_VALUE_INTERFACE_NAME)
                        .build())
                .addSuperinterface(internalValueInterfaceClassName)
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
                .addMethod(MethodSpec.methodBuilder(VISIT_METHOD_NAME)
                        .addTypeVariable(VisitorUtils.VISITOR_RETURN_TYPE)
                        .returns(VisitorUtils.VISITOR_RETURN_TYPE)
                        .addParameter(
                                generatorContext.getVisitorUtils().getVisitorTypeName(generatedUnionClassName),
                                "visitor")
                        .addAnnotation(Override.class)
                        .addStatement("return visitor.visitUnknown(type())")
                        .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                        .build())
                .build();
    }

    private MethodSpec getInternalValueImmutablesProperty(SingleUnionType singleUnionType) {
        TypeName returnTypeName =
                generatorContext.getClassNameUtils().getTypeNameFromTypeReference(true, singleUnionType.valueType());
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

    @Value.Immutable
    @StagedBuilderStyle
    interface GeneratedInternalValueTypeSpec {

        TypeSpec typeSpec();

        Optional<MethodSpec> internalValueImmutablesProperty();

        static ImmutableGeneratedInternalValueTypeSpec.TypeSpecBuildStage builder() {
            return ImmutableGeneratedInternalValueTypeSpec.builder();
        }
    }
}
