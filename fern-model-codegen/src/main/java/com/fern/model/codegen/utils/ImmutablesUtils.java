package com.fern.model.codegen.utils;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.NamedType;
import com.fern.ObjectTypeDefinition;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.KeyWordUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import java.util.List;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class ImmutablesUtils {

    private static final String IMMUTABLE_PREFIX = "Immutable";

    private final ClassNameUtils classNameUtils;

    public ImmutablesUtils(ClassNameUtils classNameUtils) {
        this.classNameUtils = classNameUtils;
    }

    public List<MethodSpec> getImmutablesPropertyMethods(ObjectTypeDefinition objectTypeDefinition) {
        return objectTypeDefinition.properties().stream()
                .map(objectField -> {
                    TypeName returnType = classNameUtils.getTypeNameFromTypeReference(true, objectField.valueType());
                    return getKeyWordCompatibleImmutablesPropertyMethod(objectField.key(), returnType);
                })
                .collect(Collectors.toList());
    }

    public MethodSpec getKeyWordCompatibleImmutablesPropertyMethod(String methodName, TypeName returnType) {
        MethodSpec.Builder methodBuilder;
        if (KeyWordUtils.isReserved(methodName)) {
            methodBuilder = MethodSpec.methodBuilder("_" + methodName)
                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                            .addMember("value", "$S", methodName)
                            .build());

        } else {
            methodBuilder = MethodSpec.methodBuilder(methodName);
        }
        return methodBuilder
                .returns(returnType)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .build();
    }

    public ClassName getImmutablesClassName(NamedType namedType) {
        return ClassName.get(
                classNameUtils.getPackageFromFilepath(namedType.fernFilepath()), IMMUTABLE_PREFIX + namedType.name());
    }
}
