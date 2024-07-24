package com.fern.java.generators.object;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fern.java.PoetTypeWithClassName;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.utils.JavaDocUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class BuilderGenerator {

    private static final String CHAINED_RETURN_DOCS =
            "Reference to {@code this} so that method calls can be chained together.";

    private static final String NESTED_BUILDER_CLASS_NAME = "Builder";

    private static final String STATIC_BUILDER_METHOD_NAME = "builder";

    private final ClassName objectClassName;
    private final ClassName nestedBuilderClassName;
    private final String additionalPropertiesFieldName;
    private final List<EnrichedObjectPropertyWithField> objectPropertyWithFields;
    private final List<String> buildMethodArguments = new ArrayList<>();

    private final boolean isSerialized;
    private final boolean supportAdditionalProperties;

    public BuilderGenerator(
            ClassName objectClassName,
            List<EnrichedObjectProperty> objectPropertyWithFields,
            boolean isSerialized,
            boolean supportAdditionalProperties) {
        this.objectClassName = objectClassName;
        this.objectPropertyWithFields = objectPropertyWithFields.stream()
                .map(BuilderGenerator::maybeGetEnrichedObjectPropertyWithField)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
        buildMethodArguments.addAll(this.objectPropertyWithFields.stream()
                .map(enrichedObjectProperty -> enrichedObjectProperty.fieldSpec.name)
                .collect(Collectors.toList()));
        this.additionalPropertiesFieldName = buildMethodArguments.contains("additionalProperties")
                ? "_additionalProperties"
                : "additionalProperties";
        if (supportAdditionalProperties) {
            buildMethodArguments.add(additionalPropertiesFieldName);
        }
        this.nestedBuilderClassName = objectClassName.nestedClass(NESTED_BUILDER_CLASS_NAME);
        this.isSerialized = isSerialized;
        this.supportAdditionalProperties = supportAdditionalProperties;
    }

    public Optional<ObjectBuilder> generate() {
        Optional<BuilderConfig> maybeBuilderConfig = getBuilderConfig();
        if (maybeBuilderConfig.isEmpty()) {
            return Optional.empty();
        }
        BuilderConfig builderConfig = maybeBuilderConfig.get();
        if (builderConfig instanceof DefaultBuilderConfig) {
            DefaultBuilderConfig defaultBuilderConfig = (DefaultBuilderConfig) builderConfig;
            PoetTypeWithClassName defaultBuilderType = getDefaultBuilderImplementation(defaultBuilderConfig);
            return Optional.of(new ObjectBuilder(
                    Collections.singletonList(defaultBuilderType),
                    MethodSpec.methodBuilder(STATIC_BUILDER_METHOD_NAME)
                            .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                            .returns(nestedBuilderClassName)
                            .addStatement("return new $T()", nestedBuilderClassName)
                            .build(),
                    nestedBuilderClassName));
        } else if (builderConfig instanceof StagedBuilderConfig) {
            StagedBuilderConfig stagedBuilderConfig = (StagedBuilderConfig) builderConfig;
            List<PoetTypeWithClassName> stageBuilderTypes = getStagedBuilderImplementation(stagedBuilderConfig);
            return Optional.of(new ObjectBuilder(
                    stageBuilderTypes,
                    MethodSpec.methodBuilder(STATIC_BUILDER_METHOD_NAME)
                            .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                            .returns(stageBuilderTypes.get(0).className())
                            .addStatement("return new $T()", nestedBuilderClassName)
                            .build(),
                    nestedBuilderClassName));
        }
        throw new RuntimeException("Encountered unexpected builderConfig: "
                + builderConfig.getClass().getSimpleName());
    }

    private List<PoetTypeWithClassName> getStagedBuilderImplementation(StagedBuilderConfig stagedBuilderConfig) {
        TypeSpec.Builder builderImplTypeSpec = TypeSpec.classBuilder(nestedBuilderClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build());
        if (isSerialized) {
            builderImplTypeSpec.addAnnotation(AnnotationSpec.builder(JsonIgnoreProperties.class)
                    .addMember("ignoreUnknown", "true")
                    .build());
        }
        ImmutableBuilderImplBuilder.Builder builderImpl = ImmutableBuilderImplBuilder.builder();

        List<PoetTypeWithClassName> interfaces = buildStagedBuilder(stagedBuilderConfig, builderImpl);
        BuilderImplBuilder builderImplValue = builderImpl.build();
        builderImplTypeSpec.addMethods(reverse(builderImplValue.reversedMethods()));
        builderImplTypeSpec.addFields(reverse(builderImplValue.reversedFields()));
        builderImplTypeSpec.addSuperinterfaces(
                interfaces.stream().map(PoetTypeWithClassName::className).collect(Collectors.toList()));
        if (this.supportAdditionalProperties) {
            builderImplTypeSpec.addField(FieldSpec.builder(
                            ParameterizedTypeName.get(Map.class, String.class, Object.class),
                            additionalPropertiesFieldName)
                    .addModifiers(Modifier.PRIVATE)
                    .addAnnotation(JsonAnySetter.class)
                    .initializer("new $T<>()", HashMap.class)
                    .build());
        }

        List<PoetTypeWithClassName> stagedBuilderTypes = new ArrayList<>();
        stagedBuilderTypes.addAll(interfaces);
        stagedBuilderTypes.add(PoetTypeWithClassName.of(nestedBuilderClassName, builderImplTypeSpec.build()));
        return stagedBuilderTypes;
    }

    private PoetTypeWithClassName getDefaultBuilderImplementation(DefaultBuilderConfig defaultBuilderConfig) {
        TypeSpec.Builder builderImplTypeSpec = TypeSpec.classBuilder(nestedBuilderClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PRIVATE)
                        .build());

        if (isSerialized) {
            builderImplTypeSpec.addAnnotation(AnnotationSpec.builder(JsonIgnoreProperties.class)
                    .addMember("ignoreUnknown", "true")
                    .build());
        }

        MethodSpec.Builder fromSetterImpl = getFromSetter();
        objectPropertyWithFields.forEach(objectProperty -> {
            fromSetterImpl.addStatement(
                    "$L($L.$N())",
                    objectProperty.fieldSpec.name,
                    StageBuilderConstants.FROM_METHOD_OTHER_PARAMETER_NAME,
                    objectProperty.enrichedObjectProperty.getterProperty());
        });
        builderImplTypeSpec.addMethod(fromSetterImpl.addStatement("return this").build());

        for (EnrichedObjectPropertyWithField enrichedProperty : defaultBuilderConfig.properties()) {
            TypeName poetTypeName = enrichedProperty.enrichedObjectProperty.poetTypeName();
            if (poetTypeName instanceof ParameterizedTypeName) {
                addAdditionalSetters(
                        (ParameterizedTypeName) poetTypeName,
                        enrichedProperty,
                        nestedBuilderClassName,
                        _unused -> {},
                        builderImplTypeSpec::addField,
                        builderImplTypeSpec::addMethod,
                        false);
            } else {
                throw new RuntimeException("Encountered final stage property that is not a ParameterizedTypeName: "
                        + poetTypeName.getClass().getSimpleName());
            }
        }

        builderImplTypeSpec.addMethod(getBaseBuildMethod()
                .addStatement("return new $T($L)", objectClassName, String.join(", ", buildMethodArguments))
                .build());

        if (this.supportAdditionalProperties) {
            builderImplTypeSpec.addField(FieldSpec.builder(
                            ParameterizedTypeName.get(Map.class, String.class, Object.class),
                            additionalPropertiesFieldName)
                    .addModifiers(Modifier.PRIVATE)
                    .addAnnotation(JsonAnySetter.class)
                    .initializer("new $T<>()", HashMap.class)
                    .build());
        }

        return PoetTypeWithClassName.of(nestedBuilderClassName, builderImplTypeSpec.build());
    }

    private List<PoetTypeWithClassName> buildStagedBuilder(
            StagedBuilderConfig stagedBuilderConfig, ImmutableBuilderImplBuilder.Builder builderImpl) {

        List<PoetTypeWithClassName> reverseStageInterfaces = new ArrayList<>();
        PoetTypeWithClassName finalStage = buildFinal(stagedBuilderConfig, builderImpl);
        reverseStageInterfaces.add(finalStage);

        for (int i = stagedBuilderConfig.stages().size() - 1; i >= 0; i--) {
            EnrichedObjectPropertyWithField enrichedObjectProperty =
                    stagedBuilderConfig.stages().get(i);
            PoetTypeWithClassName previousStage = reverseStageInterfaces.get(reverseStageInterfaces.size() - 1);
            String stageInterfaceName =
                    enrichedObjectProperty.enrichedObjectProperty.pascalCaseKey() + StageBuilderConstants.STAGE_SUFFIX;
            ClassName stageInterfaceClassName = objectClassName.nestedClass(stageInterfaceName);

            TypeSpec.Builder stageInterfaceBuilder = TypeSpec.interfaceBuilder(stageInterfaceClassName)
                    .addModifiers(Modifier.PUBLIC)
                    .addMethod(getRequiredFieldSetter(enrichedObjectProperty, previousStage.className())
                            .addModifiers(Modifier.ABSTRACT)
                            .build());

            builderImpl.addReversedFields(FieldSpec.builder(
                            enrichedObjectProperty.fieldSpec.type,
                            enrichedObjectProperty.fieldSpec.name,
                            Modifier.PRIVATE)
                    .build());
            builderImpl.addReversedMethods(
                    getRequiredFieldSetterWithImpl(enrichedObjectProperty, previousStage.className()));

            if (i == 0) {
                stageInterfaceBuilder.addMethod(
                        getFromSetter().addModifiers(Modifier.ABSTRACT).build());

                MethodSpec.Builder fromSetterImpl = getFromSetter();
                objectPropertyWithFields.forEach(objectProperty -> {
                    fromSetterImpl.addStatement(
                            "$L($L.$N())",
                            objectProperty.fieldSpec.name,
                            StageBuilderConstants.FROM_METHOD_OTHER_PARAMETER_NAME,
                            objectProperty.enrichedObjectProperty.getterProperty());
                });
                builderImpl.addReversedMethods(fromSetterImpl
                        .addAnnotation(ClassName.get("", "java.lang.Override"))
                        .addStatement("return this")
                        .build());
            }
            reverseStageInterfaces.add(
                    PoetTypeWithClassName.of(stageInterfaceClassName, stageInterfaceBuilder.build()));
        }
        return reverse(reverseStageInterfaces);
    }

    private MethodSpec getRequiredFieldSetterWithImpl(
            EnrichedObjectPropertyWithField enrichedObjectProperty, ClassName returnClass) {
        MethodSpec.Builder methodBuilder = getRequiredFieldSetter(enrichedObjectProperty, returnClass)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addStatement(
                        "this.$L = $L", enrichedObjectProperty.fieldSpec.name, enrichedObjectProperty.fieldSpec.name)
                .addStatement("return this");
        if (enrichedObjectProperty.enrichedObjectProperty.docs().isPresent()) {
            methodBuilder.addJavadoc(JavaDocUtils.render(
                    enrichedObjectProperty.enrichedObjectProperty.docs().get()));
            methodBuilder.addJavadoc(JavaDocUtils.getReturnDocs(CHAINED_RETURN_DOCS));
        }
        if (enrichedObjectProperty.enrichedObjectProperty.wireKey().isPresent()) {
            methodBuilder.addAnnotation(AnnotationSpec.builder(JsonSetter.class)
                    .addMember(
                            "value",
                            "$S",
                            enrichedObjectProperty
                                    .enrichedObjectProperty
                                    .wireKey()
                                    .get())
                    .build());
        }
        return methodBuilder.build();
    }

    private MethodSpec.Builder getRequiredFieldSetter(
            EnrichedObjectPropertyWithField enrichedObjectProperty, ClassName returnClass) {
        MethodSpec.Builder setterBuilder = MethodSpec.methodBuilder(enrichedObjectProperty.fieldSpec.name)
                .addModifiers(Modifier.PUBLIC)
                .returns(returnClass)
                .addParameter(ParameterSpec.builder(
                                enrichedObjectProperty.enrichedObjectProperty.poetTypeName(),
                                enrichedObjectProperty.fieldSpec.name)
                        .build());
        return setterBuilder;
    }

    private MethodSpec.Builder getFromSetter() {
        return MethodSpec.methodBuilder(StageBuilderConstants.FROM_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .returns(nestedBuilderClassName)
                .addParameter(
                        ParameterSpec.builder(objectClassName, StageBuilderConstants.FROM_METHOD_OTHER_PARAMETER_NAME)
                                .build());
    }

    private PoetTypeWithClassName buildFinal(
            StagedBuilderConfig stagedBuilderConfig, ImmutableBuilderImplBuilder.Builder builderImpl) {
        builderImpl.addReversedMethods(getBaseBuildMethod()
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addStatement("return new $T($L)", objectClassName, String.join(", ", buildMethodArguments))
                .build());

        ClassName finalStageClassName = objectClassName.nestedClass(StageBuilderConstants.FINAL_STAGE_CLASS_NAME);
        TypeSpec.Builder finalStageBuilder = TypeSpec.interfaceBuilder(
                        objectClassName.nestedClass(StageBuilderConstants.FINAL_STAGE_CLASS_NAME))
                .addModifiers(Modifier.PUBLIC)
                .addMethod(getBaseBuildMethod().addModifiers(Modifier.ABSTRACT).build());

        List<EnrichedObjectPropertyWithField> finalStageProperties = stagedBuilderConfig.finalStage();
        for (EnrichedObjectPropertyWithField enrichedProperty : finalStageProperties) {
            TypeName poetTypeName = enrichedProperty.enrichedObjectProperty.poetTypeName();
            if (poetTypeName instanceof ParameterizedTypeName) {
                addAdditionalSetters(
                        (ParameterizedTypeName) poetTypeName,
                        enrichedProperty,
                        finalStageClassName,
                        finalStageBuilder::addMethod,
                        builderImpl::addReversedFields,
                        builderImpl::addReversedMethods,
                        true);
            } else {
                throw new RuntimeException("Encountered final stage property that is not a ParameterizedTypeName: "
                        + poetTypeName.toString());
            }
        }
        return PoetTypeWithClassName.of(finalStageClassName, finalStageBuilder.build());
    }

    private MethodSpec.Builder getBaseBuildMethod() {
        return MethodSpec.methodBuilder(StageBuilderConstants.BUILD_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC)
                .returns(objectClassName);
    }

    private MethodSpec.Builder getDefaultSetterForImpl(
            EnrichedObjectPropertyWithField enrichedObjectProperty, ClassName returnClass, boolean isOverriden) {
        MethodSpec.Builder methodBuilder = getDefaultSetter(enrichedObjectProperty, returnClass, isOverriden);
        if (enrichedObjectProperty.enrichedObjectProperty.wireKey().isPresent()) {
            methodBuilder.addAnnotation(AnnotationSpec.builder(JsonSetter.class)
                    .addMember(
                            "value",
                            "$S",
                            enrichedObjectProperty
                                    .enrichedObjectProperty
                                    .wireKey()
                                    .get())
                    .addMember("nulls", "$T.$L", Nulls.class, Nulls.SKIP.name())
                    .build());
        }
        return methodBuilder;
    }

    private MethodSpec.Builder getDefaultSetter(
            EnrichedObjectPropertyWithField enrichedProperty, ClassName returnClass, boolean isOverriden) {
        TypeName poetTypeName = enrichedProperty.enrichedObjectProperty.poetTypeName();
        FieldSpec fieldSpec = enrichedProperty.fieldSpec;
        MethodSpec.Builder setter = MethodSpec.methodBuilder(fieldSpec.name)
                .addParameter(
                        ParameterSpec.builder(poetTypeName, fieldSpec.name).build())
                .addModifiers(Modifier.PUBLIC)
                .returns(returnClass);
        if (isOverriden) {
            setter.addAnnotation(ClassName.get("", "java.lang.Override"));
        }
        return setter;
    }

    private void addAdditionalSetters(
            ParameterizedTypeName propertyTypeName,
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ClassName finalStageClassName,
            Consumer<MethodSpec> interfaceSetterConsumer,
            Consumer<FieldSpec> implFieldConsumer,
            Consumer<MethodSpec> implSetterConsumer,
            boolean implsOverride) {
        FieldSpec fieldSpec = enrichedObjectProperty.fieldSpec;
        FieldSpec.Builder implFieldSpecBuilder = FieldSpec.builder(fieldSpec.type, fieldSpec.name, Modifier.PRIVATE);

        interfaceSetterConsumer.accept(getDefaultSetter(enrichedObjectProperty, finalStageClassName, false)
                .addModifiers(Modifier.ABSTRACT)
                .build());
        MethodSpec.Builder defaultMethodImplBuilder =
                getDefaultSetterForImpl(enrichedObjectProperty, finalStageClassName, implsOverride);

        if (isEqual(propertyTypeName, ClassName.get(Optional.class))) {
            interfaceSetterConsumer.accept(
                    createOptionalItemTypeNameSetter(enrichedObjectProperty, propertyTypeName, finalStageClassName)
                            .addModifiers(Modifier.ABSTRACT)
                            .build());

            implFieldConsumer.accept(implFieldSpecBuilder
                    .initializer("$T.empty()", Optional.class)
                    .build());
            implSetterConsumer.accept(defaultMethodImplBuilder
                    .addStatement("this.$L = $L", fieldSpec.name, fieldSpec.name)
                    .addStatement("return this")
                    .build());
            implSetterConsumer.accept(createOptionalItemTypeNameSetter(
                            enrichedObjectProperty, propertyTypeName, finalStageClassName, implsOverride)
                    .addStatement("this.$L = $T.ofNullable($L)", fieldSpec.name, Optional.class, fieldSpec.name)
                    .addStatement("return this")
                    .build());
        } else if (isEqual(propertyTypeName, ClassName.get(Map.class))) {
            interfaceSetterConsumer.accept(
                    createMapPutAllSetter(enrichedObjectProperty, propertyTypeName, finalStageClassName)
                            .addModifiers(Modifier.ABSTRACT)
                            .build());
            interfaceSetterConsumer.accept(
                    createMapEntryAppender(enrichedObjectProperty, propertyTypeName, finalStageClassName)
                            .addModifiers(Modifier.ABSTRACT)
                            .build());

            implFieldConsumer.accept(implFieldSpecBuilder
                    .initializer("new $T<>()", LinkedHashMap.class)
                    .build());
            implSetterConsumer.accept(defaultMethodImplBuilder
                    .addStatement("this.$L.clear()", fieldSpec.name)
                    .addStatement("this.$L.putAll($L)", fieldSpec.name, fieldSpec.name)
                    .addStatement("return this")
                    .build());
            implSetterConsumer.accept(
                    createMapPutAllSetter(enrichedObjectProperty, propertyTypeName, finalStageClassName, implsOverride)
                            .addStatement("this.$L.putAll($L)", fieldSpec.name, fieldSpec.name)
                            .addStatement("return this")
                            .build());
            implSetterConsumer.accept(
                    createMapEntryAppender(enrichedObjectProperty, propertyTypeName, finalStageClassName, implsOverride)
                            .addStatement(
                                    "this.$L.put($L, $L)",
                                    fieldSpec.name,
                                    StageBuilderConstants.MAP_ITEM_APPENDER_KEY_PARAMETER_NAME,
                                    StageBuilderConstants.MAP_ITEM_APPENDER_VALUE_PARAMETER_NAME)
                            .addStatement("return this")
                            .build());
        } else if (isEqual(propertyTypeName, ClassName.get(List.class))) {
            interfaceSetterConsumer.accept(
                    createCollectionItemAppender(enrichedObjectProperty, propertyTypeName, finalStageClassName)
                            .addModifiers(Modifier.ABSTRACT)
                            .build());
            interfaceSetterConsumer.accept(
                    createCollectionAddAllSetter(enrichedObjectProperty, propertyTypeName, finalStageClassName)
                            .addModifiers(Modifier.ABSTRACT)
                            .build());

            implFieldConsumer.accept(implFieldSpecBuilder
                    .initializer("new $T<>()", ArrayList.class)
                    .build());
            implSetterConsumer.accept(defaultMethodImplBuilder
                    .addStatement("this.$L.clear()", fieldSpec.name)
                    .addStatement("this.$L.addAll($L)", fieldSpec.name, fieldSpec.name)
                    .addStatement("return this")
                    .build());
            implSetterConsumer.accept(createCollectionItemAppender(
                            enrichedObjectProperty, propertyTypeName, finalStageClassName, implsOverride)
                    .addStatement("this.$L.add($L)", fieldSpec.name, fieldSpec.name)
                    .addStatement("return this")
                    .build());
            implSetterConsumer.accept(createCollectionAddAllSetter(
                            enrichedObjectProperty, propertyTypeName, finalStageClassName, implsOverride)
                    .addStatement("this.$L.addAll($L)", fieldSpec.name, fieldSpec.name)
                    .addStatement("return this")
                    .build());
        } else if (isEqual(propertyTypeName, ClassName.get(Set.class))) {
            interfaceSetterConsumer.accept(
                    createCollectionItemAppender(enrichedObjectProperty, propertyTypeName, finalStageClassName)
                            .addModifiers(Modifier.ABSTRACT)
                            .build());
            interfaceSetterConsumer.accept(
                    createCollectionAddAllSetter(enrichedObjectProperty, propertyTypeName, finalStageClassName)
                            .addModifiers(Modifier.ABSTRACT)
                            .build());

            implFieldConsumer.accept(implFieldSpecBuilder
                    .initializer("new $T<>()", LinkedHashSet.class)
                    .build());
            implSetterConsumer.accept(defaultMethodImplBuilder
                    .addStatement("this.$L.clear()", fieldSpec.name)
                    .addStatement("this.$L.addAll($L)", fieldSpec.name, fieldSpec.name)
                    .addStatement("return this")
                    .build());
            implSetterConsumer.accept(createCollectionItemAppender(
                            enrichedObjectProperty, propertyTypeName, finalStageClassName, implsOverride)
                    .addStatement("this.$L.add($L)", fieldSpec.name, fieldSpec.name)
                    .addStatement("return this")
                    .build());
            implSetterConsumer.accept(createCollectionAddAllSetter(
                            enrichedObjectProperty, propertyTypeName, finalStageClassName, implsOverride)
                    .addStatement("this.$L.addAll($L)", fieldSpec.name, fieldSpec.name)
                    .addStatement("return this")
                    .build());
        }
    }

    private static MethodSpec.Builder createMapEntryAppender(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName mapTypeName,
            ClassName returnClass) {
        return createMapEntryAppender(enrichedObjectProperty, mapTypeName, returnClass, false);
    }

    private static MethodSpec.Builder createMapEntryAppender(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName mapTypeName,
            ClassName returnClass,
            boolean isOverriden) {
        String fieldName = enrichedObjectProperty.fieldSpec.name;
        TypeName keyTypeName = getIndexedTypeArgumentOrThrow(mapTypeName, 0);
        TypeName valueTypeName = getIndexedTypeArgumentOrThrow(mapTypeName, 1);
        MethodSpec.Builder setter = defaultSetter(fieldName, returnClass)
                .addParameter(keyTypeName, StageBuilderConstants.MAP_ITEM_APPENDER_KEY_PARAMETER_NAME)
                .addParameter(valueTypeName, StageBuilderConstants.MAP_ITEM_APPENDER_VALUE_PARAMETER_NAME);
        if (isOverriden) {
            setter.addAnnotation(ClassName.get("", "java.lang.Override"));
        }
        if (isOverriden && enrichedObjectProperty.enrichedObjectProperty.docs().isPresent()) {
            setter.addJavadoc(JavaDocUtils.render(
                    enrichedObjectProperty.enrichedObjectProperty.docs().get()));
            setter.addJavadoc(JavaDocUtils.getReturnDocs(CHAINED_RETURN_DOCS));
        }
        return setter;
    }

    private static MethodSpec.Builder createMapPutAllSetter(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName collectionTypeName,
            ClassName returnClass) {
        return createMapPutAllSetter(enrichedObjectProperty, collectionTypeName, returnClass, false);
    }

    private static MethodSpec.Builder createMapPutAllSetter(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName collectionTypeName,
            ClassName returnClass,
            boolean isOverridden) {
        String fieldName = enrichedObjectProperty.fieldSpec.name;
        MethodSpec.Builder setter = defaultSetter(
                        StageBuilderConstants.PUT_ALL_METHOD_PREFIX
                                + enrichedObjectProperty.enrichedObjectProperty.pascalCaseKey(),
                        returnClass)
                .addParameter(collectionTypeName, fieldName);
        if (isOverridden) {
            setter.addAnnotation(ClassName.get("", "java.lang.Override"));
        }
        if (isOverridden && enrichedObjectProperty.enrichedObjectProperty.docs().isPresent()) {
            setter.addJavadoc(JavaDocUtils.render(
                    enrichedObjectProperty.enrichedObjectProperty.docs().get()));
            setter.addJavadoc(JavaDocUtils.getReturnDocs(CHAINED_RETURN_DOCS));
        }
        return setter;
    }

    private static MethodSpec.Builder createCollectionItemAppender(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName collectionTypeName,
            ClassName returnClass) {
        return createCollectionItemAppender(enrichedObjectProperty, collectionTypeName, returnClass, false);
    }

    private static MethodSpec.Builder createCollectionItemAppender(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName collectionTypeName,
            ClassName returnClass,
            boolean isOverridden) {
        String fieldName = enrichedObjectProperty.fieldSpec.name;
        TypeName itemTypeName = getOnlyTypeArgumentOrThrow(collectionTypeName);
        MethodSpec.Builder setter = defaultSetter(
                        StageBuilderConstants.APPEND_METHOD_PREFIX
                                + enrichedObjectProperty.enrichedObjectProperty.pascalCaseKey(),
                        returnClass)
                .addParameter(itemTypeName, fieldName);
        if (isOverridden) {
            setter.addAnnotation(ClassName.get("", "java.lang.Override"));
        }
        if (isOverridden && enrichedObjectProperty.enrichedObjectProperty.docs().isPresent()) {
            setter.addJavadoc(JavaDocUtils.render(
                    enrichedObjectProperty.enrichedObjectProperty.docs().get()));
            setter.addJavadoc(JavaDocUtils.getReturnDocs(CHAINED_RETURN_DOCS));
        }
        return setter;
    }

    private static MethodSpec.Builder createCollectionAddAllSetter(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName collectionTypeName,
            ClassName returnClass) {
        return createCollectionAddAllSetter(enrichedObjectProperty, collectionTypeName, returnClass, false);
    }

    private static MethodSpec.Builder createCollectionAddAllSetter(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName collectionTypeName,
            ClassName returnClass,
            boolean isOverridden) {
        String fieldName = enrichedObjectProperty.fieldSpec.name;
        MethodSpec.Builder setter = defaultSetter(
                        StageBuilderConstants.ADD_ALL_METHOD_PREFIX
                                + enrichedObjectProperty.enrichedObjectProperty.pascalCaseKey(),
                        returnClass)
                .addParameter(collectionTypeName, fieldName);
        if (isOverridden) {
            setter.addAnnotation(ClassName.get("", "java.lang.Override"));
        }
        if (isOverridden && enrichedObjectProperty.enrichedObjectProperty.docs().isPresent()) {
            setter.addJavadoc(JavaDocUtils.render(
                    enrichedObjectProperty.enrichedObjectProperty.docs().get()));
            setter.addJavadoc(JavaDocUtils.getReturnDocs(CHAINED_RETURN_DOCS));
        }
        return setter;
    }

    private static MethodSpec.Builder createOptionalItemTypeNameSetter(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName optionalTypeName,
            ClassName returnClass) {
        return createOptionalItemTypeNameSetter(enrichedObjectProperty, optionalTypeName, returnClass, false);
    }

    private static MethodSpec.Builder createOptionalItemTypeNameSetter(
            EnrichedObjectPropertyWithField enrichedObjectProperty,
            ParameterizedTypeName optionalTypeName,
            ClassName returnClass,
            boolean isOverridden) {
        String fieldName = enrichedObjectProperty.fieldSpec.name;
        TypeName itemTypeName = getOnlyTypeArgumentOrThrow(optionalTypeName);
        MethodSpec.Builder setter = defaultSetter(fieldName, returnClass).addParameter(itemTypeName, fieldName);
        if (isOverridden) {
            setter.addAnnotation(ClassName.get("", "java.lang.Override"));
        }
        if (isOverridden && enrichedObjectProperty.enrichedObjectProperty.docs().isPresent()) {
            setter.addJavadoc(JavaDocUtils.render(
                    enrichedObjectProperty.enrichedObjectProperty.docs().get()));
            setter.addJavadoc(JavaDocUtils.getReturnDocs(CHAINED_RETURN_DOCS));
        }
        return setter;
    }

    private static MethodSpec.Builder defaultSetter(String methodName, ClassName returnClass) {
        return MethodSpec.methodBuilder(methodName)
                .addModifiers(Modifier.PUBLIC)
                .returns(returnClass);
    }

    private static TypeName getOnlyTypeArgumentOrThrow(ParameterizedTypeName parameterizedTypeName) {
        return getIndexedTypeArgumentOrThrow(parameterizedTypeName, 0);
    }

    private static TypeName getIndexedTypeArgumentOrThrow(ParameterizedTypeName parameterizedTypeName, int index) {
        if (parameterizedTypeName.typeArguments.size() <= index) {
            throw new RuntimeException("Expected parameterizedTypeName to have " + index + 1 + " type arguments. "
                    + "rawType=" + parameterizedTypeName.rawType);
        }
        return parameterizedTypeName.typeArguments.get(index);
    }

    private Optional<BuilderConfig> getBuilderConfig() {
        List<EnrichedObjectPropertyWithField> nonRequiredFields = new ArrayList<>();
        List<EnrichedObjectPropertyWithField> requiredFields = new ArrayList<>();
        for (EnrichedObjectPropertyWithField objectPropertyWithField : objectPropertyWithFields) {
            boolean isRequired = isRequired(objectPropertyWithField);
            if (isRequired) {
                requiredFields.add(objectPropertyWithField);
            } else {
                nonRequiredFields.add(objectPropertyWithField);
            }
        }

        if (requiredFields.isEmpty()) {
            return Optional.of(DefaultBuilderConfig.builder()
                    .addAllProperties(objectPropertyWithFields)
                    .build());
        } else {
            return Optional.of(StagedBuilderConfig.builder()
                    .addAllStages(requiredFields)
                    .addAllFinalStage(nonRequiredFields)
                    .build());
        }
    }

    private boolean isRequired(EnrichedObjectPropertyWithField enrichedObjectProperty) {
        TypeName poetTypeName = enrichedObjectProperty.enrichedObjectProperty.poetTypeName();
        if (poetTypeName instanceof ParameterizedTypeName) {
            ParameterizedTypeName poetParameterizedTypeName = (ParameterizedTypeName) poetTypeName;
            return !isEqual(poetParameterizedTypeName, ClassName.get(Optional.class))
                    && !isEqual(poetParameterizedTypeName, ClassName.get(Map.class))
                    && !isEqual(poetParameterizedTypeName, ClassName.get(List.class))
                    && !isEqual(poetParameterizedTypeName, ClassName.get(Set.class));
        }
        return true;
    }

    @SuppressWarnings("checkstyle:ParameterName")
    private boolean isEqual(ParameterizedTypeName a, ClassName b) {
        return a.rawType.compareTo(b) == 0;
    }

    private static <T> List<T> reverse(List<T> val) {
        List<T> reversed = new ArrayList<>();
        for (int i = val.size() - 1; i >= 0; --i) {
            reversed.add(val.get(i));
        }
        return reversed;
    }

    interface BuilderConfig {}

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface DefaultBuilderConfig extends BuilderConfig {
        List<EnrichedObjectPropertyWithField> properties();

        static ImmutableDefaultBuilderConfig.Builder builder() {
            return ImmutableDefaultBuilderConfig.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface StagedBuilderConfig extends BuilderConfig {
        List<EnrichedObjectPropertyWithField> stages();

        List<EnrichedObjectPropertyWithField> finalStage();

        static ImmutableStagedBuilderConfig.Builder builder() {
            return ImmutableStagedBuilderConfig.builder();
        }
    }

    private static final class StageBuilderConstants {
        private static final String FINAL_STAGE_CLASS_NAME = "_FinalStage";
        private static final String APPEND_METHOD_PREFIX = "add";
        private static final String ADD_ALL_METHOD_PREFIX = "addAll";
        private static final String PUT_ALL_METHOD_PREFIX = "putAll";
        private static final String MAP_ITEM_APPENDER_KEY_PARAMETER_NAME = "key";
        private static final String MAP_ITEM_APPENDER_VALUE_PARAMETER_NAME = "value";
        private static final String BUILD_METHOD_NAME = "build";
        private static final String FROM_METHOD_NAME = "from";
        private static final String FROM_METHOD_OTHER_PARAMETER_NAME = "other";
        private static final String STAGE_SUFFIX = "Stage";
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface BuilderImplBuilder {
        List<FieldSpec> reversedFields();

        List<MethodSpec> reversedMethods();

        static ImmutableBuilderImplBuilder.Builder builder() {
            return ImmutableBuilderImplBuilder.builder();
        }
    }

    private static Optional<EnrichedObjectPropertyWithField> maybeGetEnrichedObjectPropertyWithField(
            EnrichedObjectProperty enrichedObjectProperty) {
        if (enrichedObjectProperty.fieldSpec().isPresent()) {
            return Optional.of(new EnrichedObjectPropertyWithField(
                    enrichedObjectProperty, enrichedObjectProperty.fieldSpec().get()));
        }
        return Optional.empty();
    }

    public static class EnrichedObjectPropertyWithField {
        private final EnrichedObjectProperty enrichedObjectProperty;
        private final FieldSpec fieldSpec;

        private EnrichedObjectPropertyWithField(EnrichedObjectProperty enrichedObjectProperty, FieldSpec fieldSpec) {
            this.enrichedObjectProperty = enrichedObjectProperty;
            this.fieldSpec = fieldSpec;
        }
    }
}
