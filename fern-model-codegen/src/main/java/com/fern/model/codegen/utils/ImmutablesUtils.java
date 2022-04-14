package com.fern.model.codegen.utils;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.NamedTypeReference;
import com.fern.ObjectTypeDefinition;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import java.util.List;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class ImmutablesUtils {

    private static final String IMMUTABLE_PREFIX = "Immutable";

    private ImmutablesUtils() {}

    public static List<MethodSpec> getImmutablesPropertyMethods(ObjectTypeDefinition objectTypeDefinition) {
        return objectTypeDefinition.fields().stream()
                .map(objectField -> {
                    TypeName returnType = TypeReferenceUtils.convertToTypeName(true, objectField.valueType());
                    return ImmutablesUtils.getKeyWordCompatibleImmutablesPropertyMethod(objectField.key(), returnType);
                })
                .collect(Collectors.toList());
    }

    public static MethodSpec getKeyWordCompatibleImmutablesPropertyMethod(String methodName, TypeName returnType) {
        MethodSpec.Builder methodBuilder;
        if (KeyWordUtils.isReserved(methodName)) {
            methodBuilder = MethodSpec.methodBuilder("_" + methodName)
                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                            .addMember("value", methodName)
                            .build());

        } else {
            methodBuilder = MethodSpec.methodBuilder(methodName);
        }
        return methodBuilder
                .returns(returnType)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .build();
    }

    public static ClassName getImmutablesClassName(NamedTypeReference namedTypeReference) {
        return ClassName.get(
                FilepathUtils.convertFilepathToPackage(namedTypeReference.filepath()),
                IMMUTABLE_PREFIX + namedTypeReference.name());
    }
}
