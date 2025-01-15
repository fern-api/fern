package com.fern.java.generators;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.constants.Constants;
import com.fern.ir.model.types.*;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.FernJavaAnnotations;
import com.fern.java.PoetTypeNameMapper;
import com.fern.java.generators.union.UnionSubType;
import com.fern.java.generators.union.UnionTypeSpecGenerator;
import com.fern.java.utils.NamedTypeId;
import com.fern.java.utils.NamedTypeIdResolver;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class UnionGenerator extends AbstractTypeGenerator {

    private final UnionTypeDeclaration unionTypeDeclaration;
    private final Map<TypeId, TypeDeclaration> overriddenTypeDeclarations;

    public UnionGenerator(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            UnionTypeDeclaration unionTypeDeclaration,
            Set<String> reservedTypeNames,
            boolean isTopLevelClass) {
        super(className, generatorContext, reservedTypeNames, isTopLevelClass);
        this.unionTypeDeclaration = unionTypeDeclaration;
        this.overriddenTypeDeclarations =
                overriddenTypeDeclarations(generatorContext, unionTypeDeclaration, reservedTypeNames);
    }

    @Override
    public List<TypeDeclaration> getInlineTypeDeclarations() {
        return new ArrayList<>(overriddenTypeDeclarations(generatorContext, unionTypeDeclaration, reservedTypeNames)
                .values());
    }

    @Override
    protected TypeSpec getTypeSpecWithoutInlineTypes() {
        PoetTypeNameMapper poetTypeNameMapper;
        if (generatorContext.getCustomConfig().enableInlineTypes()) {
            poetTypeNameMapper = overriddenTypeNameMapper(className, generatorContext, overriddenTypeDeclarations);
        } else {
            poetTypeNameMapper = generatorContext.getPoetTypeNameMapper();
        }
        List<ModelUnionSubTypes> unionSubTypes = unionTypeDeclaration.getTypes().stream()
                .map(singleUnionType -> new ModelUnionSubTypes(className, singleUnionType, poetTypeNameMapper))
                .collect(Collectors.toList());
        ModelUnionUnknownSubType unknownSubType = new ModelUnionUnknownSubType(className, poetTypeNameMapper);
        ModelUnionTypeSpecGenerator unionTypeSpecGenerator = new ModelUnionTypeSpecGenerator(
                className,
                unionSubTypes,
                unknownSubType,
                generatorContext.getIr().getConstants());
        return unionTypeSpecGenerator.generateUnionTypeSpec();
    }

    private static PoetTypeNameMapper overriddenTypeNameMapper(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            Map<TypeId, TypeDeclaration> overriddenTypeDeclarations) {
        Map<DeclaredTypeName, ClassName> enclosingMappings = new HashMap<>();

        for (TypeDeclaration override : overriddenTypeDeclarations.values()) {
            enclosingMappings.put(override.getName(), className);
        }

        Map<TypeId, TypeDeclaration> declarationsWithOverrides = new HashMap<>(generatorContext.getTypeDeclarations());
        declarationsWithOverrides.putAll(overriddenTypeDeclarations);

        return new PoetTypeNameMapper(
                generatorContext.getPoetClassNameFactory(),
                generatorContext.getCustomConfig(),
                declarationsWithOverrides,
                enclosingMappings);
    }

    private static Map<TypeId, TypeDeclaration> overriddenTypeDeclarations(
            AbstractGeneratorContext<?, ?> generatorContext,
            UnionTypeDeclaration unionTypeDeclaration,
            Set<String> reservedTypeNames) {
        if (!generatorContext.getCustomConfig().enableInlineTypes()) {
            return Map.of();
        }

        Map<TypeId, TypeDeclaration> overriddenTypeDeclarations = new HashMap<>();
        Set<String> propertyNames = new HashSet<>();
        Set<String> allReservedTypeNames = new HashSet<>(reservedTypeNames);

        List<ObjectProperty> objectProperties = unionTypeDeclaration.getBaseProperties();

        for (ObjectProperty objectProperty : objectProperties) {
            propertyNames.add(objectProperty.getName().getName().getPascalCase().getSafeName());
        }

        List<SingleUnionType> variants = unionTypeDeclaration.getTypes();

        for (SingleUnionType variant : variants) {
            propertyNames.add(
                    variant.getDiscriminantValue().getName().getPascalCase().getSafeName());
        }

        List<NamedTypeId> allResolvedIds = new ArrayList<>();

        for (ObjectProperty objectProperty : objectProperties) {
            List<NamedTypeId> resolvedIds = objectProperty
                    .getValueType()
                    .visit(new NamedTypeIdResolver(
                            objectProperty.getName().getName().getPascalCase().getSafeName(),
                            objectProperty.getValueType()));
            allResolvedIds.addAll(resolvedIds);
        }

        for (SingleUnionType variant : variants) {
            List<NamedTypeId> resolvedIds =
                    variant.getShape().visit(new VariantTypeIdGetter(generatorContext, variant));
            allResolvedIds.addAll(resolvedIds);
        }

        for (NamedTypeId resolvedId : allResolvedIds) {
            String name = resolvedId.name();
            Optional<TypeDeclaration> maybeRawTypeDeclaration =
                    Optional.ofNullable(generatorContext.getTypeDeclarations().get(resolvedId.typeId()));

            if (maybeRawTypeDeclaration.isEmpty()) {
                continue;
            }

            TypeDeclaration rawTypeDeclaration = maybeRawTypeDeclaration.get();

            // Don't override non-inline types
            if (!rawTypeDeclaration.getInline().orElse(false)) {
                continue;
            }

            boolean valid;
            do {
                // Prevent something like "Bar_" generated from resolution on a property name called "bar"
                // colliding with "Bar_" generated from a property name called "bar_"
                boolean newNameCollides = propertyNames.contains(name) && !name.equals(resolvedId.name());
                valid = !allReservedTypeNames.contains(name) && !newNameCollides;

                if (!valid) {
                    name += "_";
                }
            } while (!valid);

            allReservedTypeNames.add(name);
            TypeDeclaration overriddenTypeDeclaration = overrideTypeDeclarationName(rawTypeDeclaration, name);
            overriddenTypeDeclarations.put(resolvedId.typeId(), overriddenTypeDeclaration);
        }

        return overriddenTypeDeclarations;
    }

    private final class ModelUnionTypeSpecGenerator extends UnionTypeSpecGenerator {

        private ModelUnionTypeSpecGenerator(
                ClassName unionClassName,
                List<? extends UnionSubType> subTypes,
                UnionSubType unionSubType,
                Constants fernConstants) {
            super(
                    unionClassName,
                    subTypes,
                    unionSubType,
                    fernConstants,
                    true,
                    unionTypeDeclaration.getDiscriminant().getWireValue());
        }

        @Override
        public List<FieldSpec> getAdditionalFieldSpecs() {
            return Collections.emptyList();
        }

        @Override
        public TypeSpec build(TypeSpec.Builder unionBuilder) {
            return unionBuilder
                    .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                    .addMethod(MethodSpec.methodBuilder("getValue")
                            .addAnnotation(JsonValue.class)
                            .addModifiers(Modifier.PRIVATE)
                            .returns(getValueInterfaceClassName())
                            .addStatement("return this.$L", getValueFieldName())
                            .build())
                    .build();
        }
    }

    private static final class ModelUnionSubTypes extends UnionSubType {

        private final SingleUnionType singleUnionType;
        private final Optional<TypeName> unionSubTypeTypeName;
        private final Optional<FieldSpec> valueFieldSpec;

        private ModelUnionSubTypes(
                ClassName unionClassName, SingleUnionType singleUnionType, PoetTypeNameMapper poetTypeNameMapper) {
            super(unionClassName, poetTypeNameMapper);
            this.singleUnionType = singleUnionType;
            this.valueFieldSpec = getValueField();
            this.unionSubTypeTypeName = valueFieldSpec.map(fieldSpec -> fieldSpec.type);
        }

        @Override
        public Optional<NameAndWireValue> getDiscriminant() {
            return Optional.of(this.singleUnionType.getDiscriminantValue());
        }

        @Override
        public String getVisitMethodName() {
            return "visit"
                    + this.singleUnionType
                            .getDiscriminantValue()
                            .getName()
                            .getPascalCase()
                            .getUnsafeName();
        }

        @Override
        public String getIsMethodName() {
            return "is"
                    + this.singleUnionType
                            .getDiscriminantValue()
                            .getName()
                            .getPascalCase()
                            .getUnsafeName();
        }

        @Override
        public String getGetMethodName() {
            return "get"
                    + this.singleUnionType
                            .getDiscriminantValue()
                            .getName()
                            .getPascalCase()
                            .getUnsafeName();
        }

        @Override
        public String getVisitorParameterName() {
            return this.singleUnionType
                    .getDiscriminantValue()
                    .getName()
                    .getCamelCase()
                    .getSafeName();
        }

        @Override
        public Optional<TypeName> getUnionSubTypeTypeName() {
            return unionSubTypeTypeName;
        }

        @Override
        public ClassName getUnionSubTypeWrapperClass() {
            return getUnionClassName()
                    .nestedClass(singleUnionType
                                    .getDiscriminantValue()
                                    .getName()
                                    .getPascalCase()
                                    .getSafeName() + "Value");
        }

        @Override
        public List<FieldSpec> getFieldSpecs() {
            return valueFieldSpec.map(Collections::singletonList).orElseGet(Collections::emptyList);
        }

        @Override
        public List<MethodSpec> getConstructors() {
            List<MethodSpec> constructors = new ArrayList<>();
            singleUnionType.getShape().visit(new SingleUnionTypeProperties.Visitor<Void>() {

                @Override
                public Void visitSamePropertiesAsObject(DeclaredTypeName samePropertiesAsObject) {
                    constructors.add(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PRIVATE)
                            .addAnnotation(FernJavaAnnotations.jacksonPropertiesCreator())
                            .build());
                    constructors.add(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PRIVATE)
                            .addParameter(ParameterSpec.builder(
                                            poetTypeNameMapper.convertToTypeName(
                                                    true,
                                                    TypeReference.named(NamedType.builder()
                                                            .typeId(samePropertiesAsObject.getTypeId())
                                                            .fernFilepath(samePropertiesAsObject.getFernFilepath())
                                                            .name(samePropertiesAsObject.getName())
                                                            .build())),
                                            "value")
                                    .build())
                            .addStatement("this.$L = $L", "value", "value")
                            .build());
                    return null;
                }

                @Override
                public Void visitSingleProperty(SingleUnionTypeProperty singleProperty) {
                    String parameterName =
                            singleProperty.getName().getName().getCamelCase().getSafeName();
                    constructors.add(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PRIVATE)
                            .addAnnotation(FernJavaAnnotations.jacksonPropertiesCreator())
                            .addParameter(ParameterSpec.builder(
                                            poetTypeNameMapper.convertToTypeName(true, singleProperty.getType()),
                                            parameterName)
                                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                            .addMember(
                                                    "value",
                                                    "$S",
                                                    singleProperty.getName().getWireValue())
                                            .build())
                                    .build())
                            .addStatement("this.$L = $L", parameterName, parameterName)
                            .build());
                    return null;
                }

                @Override
                public Void visitNoProperties() {
                    constructors.add(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PRIVATE)
                            .addAnnotation(FernJavaAnnotations.jacksonPropertiesCreator())
                            .build());
                    return null;
                }

                @Override
                public Void _visitUnknown(Object unknown) {
                    return null;
                }
            });

            return constructors;
        }

        @Override
        public String getValueFieldName() {
            return valueFieldSpec.map(fieldSpec -> fieldSpec.name).orElse("value");
        }

        @Override
        public Optional<MethodSpec> getStaticFactory() {
            MethodSpec.Builder staticFactoryBuilder = MethodSpec.methodBuilder(getVisitorParameterName())
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .returns(getUnionClassName());
            if (getUnionSubTypeTypeName().isPresent()) {
                staticFactoryBuilder
                        .addParameter(getUnionSubTypeTypeName().get(), getValueFieldName())
                        .addStatement(
                                "return new $T(new $T($L))",
                                getUnionClassName(),
                                getUnionSubTypeWrapperClass(),
                                getValueFieldName());
            } else {
                staticFactoryBuilder.addStatement(
                        "return new $T(new $T())", getUnionClassName(), getUnionSubTypeWrapperClass());
            }
            return Optional.of(staticFactoryBuilder.build());
        }

        private Optional<FieldSpec> getValueField() {
            return singleUnionType.getShape().visit(new SingleUnionTypeProperties.Visitor<>() {

                @Override
                public Optional<FieldSpec> visitSamePropertiesAsObject(DeclaredTypeName samePropertiesAsObject) {
                    return Optional.of(FieldSpec.builder(
                                    poetTypeNameMapper.convertToTypeName(
                                            true,
                                            TypeReference.named(NamedType.builder()
                                                    .typeId(samePropertiesAsObject.getTypeId())
                                                    .fernFilepath(samePropertiesAsObject.getFernFilepath())
                                                    .name(samePropertiesAsObject.getName())
                                                    .build())),
                                    "value",
                                    Modifier.PRIVATE)
                            .addAnnotation(JsonUnwrapped.class)
                            .build());
                }

                @Override
                public Optional<FieldSpec> visitSingleProperty(SingleUnionTypeProperty singleProperty) {
                    String fieldName =
                            singleProperty.getName().getName().getCamelCase().getSafeName();
                    return Optional.of(FieldSpec.builder(
                                    poetTypeNameMapper.convertToTypeName(true, singleProperty.getType()),
                                    fieldName,
                                    Modifier.PRIVATE)
                            .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                    .addMember(
                                            "value",
                                            "$S",
                                            singleProperty.getName().getWireValue())
                                    .build())
                            .build());
                }

                @Override
                public Optional<FieldSpec> visitNoProperties() {
                    return Optional.empty();
                }

                @Override
                public Optional<FieldSpec> _visitUnknown(Object unknown) {
                    return Optional.empty();
                }
            });
        }
    }

    private static final class ModelUnionUnknownSubType extends UnionSubType {

        private ModelUnionUnknownSubType(ClassName unionClassName, PoetTypeNameMapper poetTypeNameMapper) {
            super(unionClassName, poetTypeNameMapper);
        }

        @Override
        public Optional<NameAndWireValue> getDiscriminant() {
            return Optional.empty();
        }

        @Override
        public String getVisitMethodName() {
            return "_visitUnknown";
        }

        @Override
        public String getIsMethodName() {
            return "_isUnknown";
        }

        @Override
        public String getGetMethodName() {
            return "_getUnknown";
        }

        @Override
        public String getVisitorParameterName() {
            return "unknownType";
        }

        @Override
        public Optional<TypeName> getUnionSubTypeTypeName() {
            return Optional.of(ClassName.get(Object.class));
        }

        @Override
        public ClassName getUnionSubTypeWrapperClass() {
            return getUnionClassName().nestedClass("_UnknownValue");
        }

        @Override
        public List<FieldSpec> getFieldSpecs() {
            return List.of(
                    FieldSpec.builder(String.class, "type", Modifier.PRIVATE).build(),
                    FieldSpec.builder(Object.class, getValueFieldName(), Modifier.PRIVATE)
                            .addAnnotation(JsonValue.class)
                            .build());
        }

        @Override
        public List<MethodSpec> getConstructors() {
            MethodSpec.Builder fromJsonConstructorBuilder = MethodSpec.constructorBuilder()
                    .addModifiers(Modifier.PRIVATE)
                    .addAnnotation(FernJavaAnnotations.jacksonPropertiesCreator());
            List<ParameterSpec> parameterSpecs = new ArrayList<>();
            parameterSpecs.add(ParameterSpec.builder(getUnionSubTypeTypeName().get(), getValueFieldName())
                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                            .addMember("value", "$S", getValueFieldName())
                            .build())
                    .build());
            return Collections.singletonList(
                    fromJsonConstructorBuilder.addParameters(parameterSpecs).build());
        }

        @Override
        public Optional<MethodSpec> getStaticFactory() {
            return Optional.empty();
        }
    }

    private static final class VariantTypeIdGetter implements SingleUnionTypeProperties.Visitor<List<NamedTypeId>> {

        AbstractGeneratorContext<?, ?> generatorContext;
        SingleUnionType variant;

        public VariantTypeIdGetter(AbstractGeneratorContext<?, ?> generatorContext, SingleUnionType variant) {
            this.generatorContext = generatorContext;
            this.variant = variant;
        }

        @Override
        public List<NamedTypeId> visitSamePropertiesAsObject(DeclaredTypeName declaredTypeName) {
            Optional<TypeDeclaration> maybeExisting =
                    Optional.ofNullable(generatorContext.getTypeDeclarations().get(declaredTypeName.getTypeId()));
            if (maybeExisting.isEmpty()) {
                return List.of();
            }

            return List.of(NamedTypeId.builder()
                    .name(variant.getDiscriminantValue()
                            .getName()
                            .getPascalCase()
                            .getSafeName())
                    .typeId(maybeExisting.get().getName().getTypeId())
                    .build());
        }

        @Override
        public List<NamedTypeId> visitSingleProperty(SingleUnionTypeProperty singleUnionTypeProperty) {
            return singleUnionTypeProperty
                    .getType()
                    .visit(new NamedTypeIdResolver(
                            variant.getDiscriminantValue()
                                    .getName()
                                    .getPascalCase()
                                    .getSafeName(),
                            singleUnionTypeProperty.getType()));
        }

        @Override
        public List<NamedTypeId> visitNoProperties() {
            return List.of();
        }

        @Override
        public List<NamedTypeId> _visitUnknown(Object o) {
            return List.of();
        }
    }
}
