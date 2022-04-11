package com.fern.model.codegen;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.NamedTypeReference;
import com.fern.ObjectField;
import com.fern.ObjectTypeDefinition;
import com.fern.immutables.StagedBuilderStyle;
import com.squareup.javapoet.*;
import org.immutables.value.Value;

import javax.lang.model.element.Modifier;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public final class ObjectGenerator {

    private static final String IMMUTABLE_PREFIX = "Immutable";
    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String BUILD_STAGE_SUFFIX = "BuildStage";

    public static GeneratedObject generate(
            List<GeneratedInterface> superInterfaces,
            NamedTypeReference name,
            ObjectTypeDefinition objectTypeDefinition,
            boolean ignoreOwnFields) {
        TypeSpec.Builder objectTypeBuilder = TypeSpec.interfaceBuilder(name.name());
        objectTypeBuilder
                .addModifiers(Modifier.PUBLIC)
                .addSuperinterfaces(superInterfaces.stream().map(
                        superInterface -> ClassName.get(superInterface.packageName(), superInterface.className()))
                        .collect(Collectors.toList()));
        if (!ignoreOwnFields) {
            objectTypeBuilder.addMethods(objectTypeDefinition.fields().stream().map(objectField -> MethodSpec.methodBuilder(objectField.key())
                    .returns(objectField.valueType().accept(TypeReferenceToTypeNameConverter.INSTANCE))
                    .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT).build())
                    .collect(Collectors.toList()));
        }
        TypeSpec objectType = objectTypeBuilder
                .addMethod(generateStaticBuilder(superInterfaces, name, objectTypeDefinition))
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(StagedBuilderStyle.class)
                .addAnnotation(AnnotationSpec
                        .builder(JsonDeserialize.class)
                        .addMember("as", "$T.class",
                                ClassName.get(name._package().orElse(""), getImmutableClassName(name.name())))
                        .build())
                .build();
        JavaFile objectFile = JavaFile.builder(name._package().orElse(""), objectType)
                .build();
        return GeneratedObject.builder()
                .file(objectFile)
                .definition(objectTypeDefinition)
                .build();
    }

    private static String getImmutableClassName(String name) {
        return IMMUTABLE_PREFIX + name;
    }

    private static MethodSpec generateStaticBuilder(
            List<GeneratedInterface> superInterfaces,
            NamedTypeReference name,
            ObjectTypeDefinition objectTypeDefinition) {
        Optional<String> firstMandatoryFieldName = getFirstRequiredFieldName(superInterfaces, objectTypeDefinition.fields());
        ClassName immutableClassName = ClassName.get(name._package().orElse(""), getImmutableClassName(name.name()));
        ClassName builderClassName = firstMandatoryFieldName.isEmpty()
                ? immutableClassName.nestedClass("Builder")
                : immutableClassName.nestedClass(firstMandatoryFieldName.get() + BUILD_STAGE_SUFFIX);
        return MethodSpec.methodBuilder(STATIC_BUILDER_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(builderClassName)
                .addCode("returns $T.builder();", immutableClassName)
                .build();
    }

    private static Optional<String> getFirstRequiredFieldName(
            List<GeneratedInterface> superInterfaces, List<ObjectField> fields) {
        // Required field from super interfaces take priority
        for (GeneratedInterface superInterface : superInterfaces) {
            Optional<String> firstMandatoryFieldName = superInterface.definition().shape().getObject()
                    .flatMap(objectTypeDefinition -> getFirstRequiredFieldName(objectTypeDefinition.fields()));
            if (firstMandatoryFieldName.isPresent()) {
                return firstMandatoryFieldName;
            }
        }
        return getFirstRequiredFieldName(fields);
    }

    private static Optional<String> getFirstRequiredFieldName(List<ObjectField> fields) {
        for (ObjectField field : fields) {
            if (field.valueType().isPrimitive() || field.valueType().isNamed()) {
                return Optional.of(field.key());
            }
        }
        return Optional.empty();
    }
}
