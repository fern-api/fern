package com.fern.codegen.utils;

import com.errors.ErrorDefinition;
import com.errors.ErrorProperty;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.types.ObjectProperty;
import com.types.ObjectTypeDefinition;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;

public final class ImmutablesUtils {

    private static final String IMMUTABLE_PREFIX = "Immutable";

    private final ClassNameUtils classNameUtils;

    public ImmutablesUtils(ClassNameUtils classNameUtils) {
        this.classNameUtils = classNameUtils;
    }

    public Map<ObjectProperty, MethodSpec> getImmutablesPropertyMethods(ObjectTypeDefinition objectTypeDefinition) {
        return objectTypeDefinition.properties().stream().collect(Collectors.toMap(Function.identity(), objectField -> {
            TypeName returnType = classNameUtils.getTypeNameFromTypeReference(true, objectField.valueType());
            return getKeyWordCompatibleImmutablesPropertyMethod(objectField.key(), returnType);
        }));
    }

    public Map<ErrorProperty, MethodSpec> getImmutablesPropertyMethods(ErrorDefinition errorDefinition) {
        return errorDefinition.properties().stream().collect(Collectors.toMap(Function.identity(), errorField -> {
            TypeName returnType = classNameUtils.getTypeNameFromTypeReference(true, errorField.type());
            return getKeyWordCompatibleImmutablesPropertyMethod(errorField.name(), returnType);
        }));
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

    public ClassName getImmutablesClassName(ClassName interfaceClassName) {
        return ClassName.get(
                interfaceClassName.packageName(),
                IMMUTABLE_PREFIX + StringUtils.capitalize(interfaceClassName.simpleName()));
    }
}
