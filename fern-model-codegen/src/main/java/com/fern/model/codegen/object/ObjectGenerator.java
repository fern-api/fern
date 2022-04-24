package com.fern.model.codegen.object;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedFileWithDefinition;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.GeneratorContext;
import com.fern.model.codegen.interfaces.GeneratedInterface;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.types.NamedType;
import com.types.ObjectProperty;
import com.types.ObjectTypeDefinition;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class ObjectGenerator extends Generator<ObjectTypeDefinition> {

    private static final Modifier[] OBJECT_INTERFACE_MODIFIERS = new Modifier[] {Modifier.PUBLIC};

    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String BUILD_STAGE_SUFFIX = "BuildStage";

    private final NamedType namedType;
    private final ObjectTypeDefinition objectTypeDefinition;
    private final List<GeneratedInterface> extendedInterfaces;
    private final Optional<GeneratedInterface> selfInterface;
    private final ClassName generatedObjectClassName;
    private final ClassName generatedObjectImmutablesClassName;

    public ObjectGenerator(
            NamedType namedType,
            ObjectTypeDefinition objectTypeDefinition,
            List<GeneratedInterface> extendedInterfaces,
            Optional<GeneratedInterface> selfInterface,
            GeneratorContext generatorContext) {
        super(generatorContext);
        this.namedType = namedType;
        this.objectTypeDefinition = objectTypeDefinition;
        this.extendedInterfaces = extendedInterfaces;
        this.selfInterface = selfInterface;
        this.generatedObjectClassName = generatorContext.getClassNameUtils().getClassNameForNamedType(namedType);
        this.generatedObjectImmutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(generatedObjectClassName);
    }

    @Override
    public GeneratedObject generate() {
        TypeSpec.Builder objectTypeSpecBuilder = TypeSpec.interfaceBuilder(namedType.name())
                .addModifiers(OBJECT_INTERFACE_MODIFIERS)
                .addAnnotations(getAnnotations())
                .addSuperinterfaces(getSuperInterfaces());
        Map<ObjectProperty, MethodSpec> methodSpecsByProperty = new HashMap<>();
        if (selfInterface.isEmpty()) {
            methodSpecsByProperty.putAll(
                    generatorContext.getImmutablesUtils().getImmutablesPropertyMethods(objectTypeDefinition));
        }
        objectTypeSpecBuilder.addMethods(methodSpecsByProperty.values()).addMethod(generateStaticBuilder());
        TypeSpec objectTypeSpec = objectTypeSpecBuilder.build();
        JavaFile objectFile = JavaFile.builder(generatedObjectClassName.packageName(), objectTypeSpec)
                .build();
        return GeneratedObject.builder()
                .file(objectFile)
                .className(generatedObjectClassName)
                .definition(objectTypeDefinition)
                .build();
    }

    private List<AnnotationSpec> getAnnotations() {
        List<AnnotationSpec> annotationSpecs = new ArrayList<>();
        annotationSpecs.add(AnnotationSpec.builder(Value.Immutable.class).build());
        annotationSpecs.add(AnnotationSpec.builder(generatorContext.getStagedImmutablesBuilderClassname())
                .build());
        annotationSpecs.add(AnnotationSpec.builder(JsonDeserialize.class)
                .addMember("as", "$T.class", generatedObjectImmutablesClassName)
                .build());
        annotationSpecs.add(AnnotationSpec.builder(JsonIgnoreProperties.class)
                .addMember("ignoreUnknown", "$L", Boolean.TRUE.toString())
                .build());
        return annotationSpecs;
    }

    private List<TypeName> getSuperInterfaces() {
        List<TypeName> superInterfaces = new ArrayList<>();
        superInterfaces.addAll(extendedInterfaces.stream()
                .map(GeneratedFileWithDefinition::className)
                .collect(Collectors.toList()));
        selfInterface.ifPresent(generatedInterface -> superInterfaces.add(generatedInterface.className()));
        return superInterfaces;
    }

    private MethodSpec generateStaticBuilder() {
        Optional<String> firstMandatoryFieldName =
                getFirstRequiredFieldName(extendedInterfaces, objectTypeDefinition.properties());
        ClassName builderClassName = firstMandatoryFieldName.isEmpty()
                ? generatedObjectImmutablesClassName.nestedClass("Builder")
                : generatedObjectImmutablesClassName.nestedClass(
                        StringUtils.capitalize(firstMandatoryFieldName.get()) + BUILD_STAGE_SUFFIX);
        return MethodSpec.methodBuilder(STATIC_BUILDER_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(builderClassName)
                .addCode("return $T.builder();", generatedObjectImmutablesClassName)
                .build();
    }

    private static Optional<String> getFirstRequiredFieldName(
            List<GeneratedInterface> superInterfaces, List<ObjectProperty> properties) {
        // Required field from super interfaces take priority
        for (GeneratedInterface superInterface : superInterfaces) {
            Optional<String> firstMandatoryFieldName =
                    getFirstRequiredFieldName(superInterface.definition().properties());
            if (firstMandatoryFieldName.isPresent()) {
                return firstMandatoryFieldName;
            }
        }
        return getFirstRequiredFieldName(properties);
    }

    private static Optional<String> getFirstRequiredFieldName(List<ObjectProperty> properties) {
        for (ObjectProperty property : properties) {
            if (property.valueType().isPrimitive() || property.valueType().isNamed()) {
                return Optional.of(property.key());
            }
        }
        return Optional.empty();
    }
}
