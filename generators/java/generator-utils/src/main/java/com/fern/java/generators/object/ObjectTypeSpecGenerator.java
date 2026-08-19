package com.fern.java.generators.object;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.java.ICustomConfig;
import com.fern.java.ObjectMethodFactory;
import com.fern.java.ObjectMethodFactory.EqualsMethod;
import com.fern.java.PoetTypeWithClassName;
import com.fern.java.generators.ObjectMappersGenerator;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class ObjectTypeSpecGenerator {

    /**
     * The JVM limits constructors to 255 parameter slots, where {@code this} occupies one slot and each parameter
     * consumes one slot (two for {@code long} and {@code double}). We reserve one slot for {@code this}, leaving 254
     * usable slots.
     */
    private static final int MAX_CONSTRUCTOR_PARAM_SLOTS = 254;

    private final ClassName objectClassName;
    private final ClassName generatedObjectMapperClassName;
    private final ClassName nullableClassName;
    private final List<EnrichedObjectProperty> allEnrichedProperties = new ArrayList<>();
    private final List<ImplementsInterface> interfaces;
    private final ICustomConfig.JsonInclude jsonInclude;
    private final boolean isSerialized;
    private final boolean publicConstructorsEnabled;
    private final boolean supportAdditionalProperties;
    private final boolean disableRequiredPropertyBuilderChecks;
    private final boolean builderNotNullChecks;
    private final boolean useBuilderConstructor;

    public ObjectTypeSpecGenerator(
            ClassName objectClassName,
            ClassName generatedObjectMapperClassName,
            ClassName nullableClassName,
            List<EnrichedObjectProperty> enrichedObjectProperties,
            List<ImplementsInterface> interfaces,
            boolean isSerialized,
            boolean publicConstructorsEnabled,
            boolean supportAdditionalProperties,
            ICustomConfig.JsonInclude jsonInclude,
            Boolean disableRequiredPropertyBuilderChecks,
            boolean builderNotNullChecks) {
        this.objectClassName = objectClassName;
        this.generatedObjectMapperClassName = generatedObjectMapperClassName;
        this.nullableClassName = nullableClassName;
        this.interfaces = interfaces;
        this.jsonInclude = jsonInclude;
        this.builderNotNullChecks = builderNotNullChecks;
        for (ImplementsInterface implementsInterface : interfaces) {
            allEnrichedProperties.addAll(implementsInterface.interfaceProperties());
        }
        allEnrichedProperties.addAll(enrichedObjectProperties);
        this.isSerialized = isSerialized;
        this.publicConstructorsEnabled = publicConstructorsEnabled;
        this.supportAdditionalProperties = supportAdditionalProperties;
        this.disableRequiredPropertyBuilderChecks = disableRequiredPropertyBuilderChecks;
        long paramSlots = allEnrichedProperties.stream()
                .filter(p -> p.fieldSpec().isPresent())
                .mapToLong(p -> jvmSlots(p.fieldSpec().get().type))
                .sum();
        if (supportAdditionalProperties) {
            // Map<String, Object> is a reference type, takes one slot
            paramSlots += 1;
        }
        this.useBuilderConstructor = paramSlots > MAX_CONSTRUCTOR_PARAM_SLOTS;
    }

    public TypeSpec generate() {
        EqualsMethod equalsMethod = generateEqualsMethod();
        Optional<ObjectBuilder> maybeObjectBuilder = generateBuilder();
        TypeSpec.Builder typeSpecBuilder = TypeSpec.classBuilder(objectClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addFields(allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::fieldSpec)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toList()))
                .addSuperinterfaces(interfaces.stream()
                        .map(ImplementsInterface::interfaceClassName)
                        .collect(Collectors.toList()))
                .addMethod(generateConstructor())
                .addMethods(allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::getterProperty)
                        .collect(Collectors.toList()))
                .addMethods(allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::getterForSerialization)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toList()))
                .addMethod(equalsMethod.getEqualsMethodSpec());

        if (supportAdditionalProperties) {
            typeSpecBuilder.addField(FieldSpec.builder(
                            ParameterizedTypeName.get(Map.class, String.class, Object.class),
                            getAdditionalPropertiesFieldName())
                    .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                    .build());
            typeSpecBuilder.addMethod(getAdditionalPropertiesMethodSpec());
        }

        equalsMethod.getEqualToMethodSpec().ifPresent(typeSpecBuilder::addMethod);
        generateHashCode().ifPresent(typeSpecBuilder::addMethod);
        typeSpecBuilder.addMethod(generateToString());
        if (maybeObjectBuilder.isPresent()) {
            ObjectBuilder objectBuilder = maybeObjectBuilder.get();
            typeSpecBuilder.addMethod(objectBuilder.getBuilderStaticMethod());
            typeSpecBuilder.addTypes(objectBuilder.getGeneratedTypes().stream()
                    .map(PoetTypeWithClassName::typeSpec)
                    .collect(Collectors.toList()));
            if (isSerialized) {
                typeSpecBuilder.addAnnotation(AnnotationSpec.builder(JsonInclude.class)
                        .addMember(
                                "value",
                                "$T.Include.$L",
                                JsonInclude.class,
                                jsonInclude == ICustomConfig.JsonInclude.NON_ABSENT ? "NON_ABSENT" : "NON_EMPTY")
                        .build());
                typeSpecBuilder.addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("builder", "$T.class", objectBuilder.getBuilderImplClassName())
                        .build());
            }
        }
        if (objectClassName.enclosingClassName() != null) {
            typeSpecBuilder.addModifiers(Modifier.STATIC);
        }
        return typeSpecBuilder.build();
    }

    private MethodSpec generateConstructor() {
        if (useBuilderConstructor) {
            return generateBuilderBasedConstructor();
        }
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(publicConstructorsEnabled ? Modifier.PUBLIC : Modifier.PRIVATE);
        allEnrichedProperties.stream()
                .map(enrichedProperty -> {
                    Optional<FieldSpec> maybeFieldSpec = enrichedProperty.fieldSpec();
                    if (maybeFieldSpec.isEmpty()) {
                        return Optional.<ParameterSpec>empty();
                    }
                    FieldSpec fieldSpec = maybeFieldSpec.get();
                    ParameterSpec.Builder paramBuilder = ParameterSpec.builder(fieldSpec.type, fieldSpec.name);

                    boolean shouldUseNullableAnnotation = enrichedProperty.useNullableAnnotation()
                            && EnrichedObjectProperty.isNullable(
                                    enrichedProperty.objectProperty().getValueType());
                    if (shouldUseNullableAnnotation && !fieldSpec.type.isPrimitive()) {
                        paramBuilder.addAnnotation(com.fern.java.utils.NullableAnnotationUtils.getNullableAnnotation());
                    }

                    return Optional.of(paramBuilder.build());
                })
                .flatMap(Optional::stream)
                .forEach(parameterSpec -> {
                    constructorBuilder.addParameter(parameterSpec);
                    constructorBuilder.addStatement("this.$L = $L", parameterSpec.name, parameterSpec.name);
                });
        if (supportAdditionalProperties) {
            String additionalPropertiesFieldName = getAdditionalPropertiesFieldName();
            ParameterSpec parameterSpec = ParameterSpec.builder(
                            ParameterizedTypeName.get(Map.class, String.class, Object.class),
                            additionalPropertiesFieldName)
                    .build();
            constructorBuilder.addParameter(parameterSpec);
            constructorBuilder.addStatement(
                    "this.$L = $L", additionalPropertiesFieldName, additionalPropertiesFieldName);
        }
        return constructorBuilder.build();
    }

    /**
     * Generates a constructor that accepts the Builder as a single parameter, copying each field from the builder
     * instance. This avoids the JVM 255-parameter-slot limit for objects with a very large number of properties.
     */
    private MethodSpec generateBuilderBasedConstructor() {
        ClassName builderClassName = objectClassName.nestedClass("Builder");
        MethodSpec.Builder constructorBuilder = MethodSpec.constructorBuilder()
                .addModifiers(publicConstructorsEnabled ? Modifier.PUBLIC : Modifier.PRIVATE)
                .addParameter(builderClassName, "builder");
        allEnrichedProperties.stream()
                .map(EnrichedObjectProperty::fieldSpec)
                .flatMap(Optional::stream)
                .forEach(fieldSpec -> {
                    constructorBuilder.addStatement("this.$L = builder.$L", fieldSpec.name, fieldSpec.name);
                });
        if (supportAdditionalProperties) {
            String additionalPropertiesFieldName = getAdditionalPropertiesFieldName();
            constructorBuilder.addStatement(
                    "this.$L = builder.$L", additionalPropertiesFieldName, additionalPropertiesFieldName);
        }
        return constructorBuilder.build();
    }

    private String getAdditionalPropertiesFieldName() {
        boolean hasConflict = allEnrichedProperties.stream()
                .anyMatch(enrichedObjectProperty ->
                        enrichedObjectProperty.camelCaseKey().equals("additionalProperties"));
        return hasConflict ? "_additionalProperties" : "additionalProperties";
    }

    private MethodSpec getAdditionalPropertiesMethodSpec() {
        boolean hasConflict = allEnrichedProperties.stream()
                .anyMatch(enrichedObjectProperty ->
                        enrichedObjectProperty.camelCaseKey().equals("additionalProperties"));
        String methodName = hasConflict ? "_getAdditionalProperties" : "getAdditionalProperties";
        return MethodSpec.methodBuilder(methodName)
                .addModifiers(Modifier.PUBLIC)
                .returns(ParameterizedTypeName.get(Map.class, String.class, Object.class))
                .addAnnotation(JsonAnyGetter.class)
                .addStatement("return this.$L", getAdditionalPropertiesFieldName())
                .build();
    }

    private EqualsMethod generateEqualsMethod() {
        return ObjectMethodFactory.createEqualsMethod(
                objectClassName,
                allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::fieldSpec)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toList()));
    }

    private Optional<MethodSpec> generateHashCode() {
        return ObjectMethodFactory.createHashCodeMethod(allEnrichedProperties.stream()
                .map(EnrichedObjectProperty::fieldSpec)
                .flatMap(Optional::stream)
                .collect(Collectors.toList()));
    }

    private MethodSpec generateToString() {
        if (isSerialized) {
            return MethodSpec.methodBuilder("toString")
                    .addAnnotation(ClassName.get("", "java.lang.Override"))
                    .addModifiers(Modifier.PUBLIC)
                    .returns(String.class)
                    .addStatement(
                            "return $T.$L(this)",
                            generatedObjectMapperClassName,
                            ObjectMappersGenerator.STRINGIFY_METHOD_NAME)
                    .build();
        }
        return ObjectMethodFactory.createToStringMethodFromFieldSpecs(
                objectClassName,
                allEnrichedProperties.stream()
                        .map(EnrichedObjectProperty::fieldSpec)
                        .flatMap(Optional::stream)
                        .collect(Collectors.toList()));
    }

    /**
     * Returns the number of JVM parameter slots consumed by a given type. {@code long} and {@code double} occupy two
     * slots; all other types occupy one.
     */
    private static long jvmSlots(TypeName typeName) {
        if (typeName.equals(TypeName.LONG) || typeName.equals(TypeName.DOUBLE)) {
            return 2;
        }
        return 1;
    }

    private Optional<ObjectBuilder> generateBuilder() {
        BuilderGenerator builderGenerator = new BuilderGenerator(
                objectClassName,
                nullableClassName,
                allEnrichedProperties,
                isSerialized,
                supportAdditionalProperties,
                disableRequiredPropertyBuilderChecks,
                builderNotNullChecks,
                useBuilderConstructor);
        return builderGenerator.generate();
    }
}
