package com.fern.jersey;

import com.errors.ErrorDefinition;
import com.errors.ErrorProperty;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedException;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.Generator;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class ExceptionGenerator extends Generator {

    private static final ClassName WEB_APPLICATION_EXCEPTION_CLASS_NAME = ClassName.get(WebApplicationException.class);

    private static final String STATUS_CODE_FIELD_NAME = "STATUS_CODE";

    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String BUILD_STAGE_SUFFIX = "BuildStage";

    private final GeneratorContext generatorContext;
    private final ErrorDefinition errorDefinition;
    private final ClassName generatedExceptionClassName;
    private final boolean isServerException;

    public ExceptionGenerator(
            GeneratorContext generatorContext, ErrorDefinition errorDefinition, boolean isServerException) {
        super(generatorContext, PackageType.ERRORS);
        this.generatorContext = generatorContext;
        this.errorDefinition = errorDefinition;
        this.generatedExceptionClassName = generatorContext
                .getClassNameUtils()
                .getClassNameForNamedType(errorDefinition.name(), PackageType.ERRORS);
        this.isServerException = isServerException;
    }

    @Override
    public GeneratedException generate() {
        TypeSpec.Builder errorExceptionTypeSpec = TypeSpec.classBuilder(generatorContext
                        .getClassNameUtils()
                        .getClassNameForNamedType(errorDefinition.name(), packageType))
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(Value.Immutable.class)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember(
                                "as",
                                "$T.class",
                                generatorContext
                                        .getImmutablesUtils()
                                        .getImmutablesClassName(generatedExceptionClassName))
                        .build())
                .addAnnotation(generatorContext.getStagedImmutablesFile().className())
                .addSuperinterface(getParentExceptionClassName())
                .addSuperinterface(generatorContext.getApiExceptionFile().className());
        boolean isHttpError = errorDefinition.http().isPresent();
        if (isHttpError) {
            errorExceptionTypeSpec
                    .addSuperinterface(
                            generatorContext.getHttpApiExceptionFile().className())
                    .addField(FieldSpec.builder(TypeName.INT, STATUS_CODE_FIELD_NAME)
                            .addModifiers(Modifier.PUBLIC, Modifier.STATIC, Modifier.FINAL)
                            .initializer("$L", errorDefinition.http().get().statusCode())
                            .build());
        }
        Map<ErrorProperty, MethodSpec> methodSpecsByProperty =
                generatorContext.getImmutablesUtils().getImmutablesPropertyMethods(errorDefinition);
        errorExceptionTypeSpec.addAnnotation((getJsonIncludePropertiesAnnotationSpec(methodSpecsByProperty)));
        errorExceptionTypeSpec.addMethods(methodSpecsByProperty.values());
        errorExceptionTypeSpec.addMethod(generateStaticBuilder(methodSpecsByProperty));

        if (isServerException && isHttpError) {
            errorExceptionTypeSpec.addMethod(getResponseMethodSpec());
        }

        TypeSpec errorExceptionTypeSPec = errorExceptionTypeSpec.build();
        JavaFile objectFile = JavaFile.builder(generatedExceptionClassName.packageName(), errorExceptionTypeSPec)
                .build();
        return GeneratedException.builder()
                .file(objectFile)
                .className(generatedExceptionClassName)
                .errorDefinition(errorDefinition)
                .build();
    }

    private MethodSpec getResponseMethodSpec() {
        return MethodSpec.methodBuilder("getResponse")
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .returns(Response.class)
                .addAnnotation(Override.class)
                .addStatement("return $T.status($L).entity(this).build()", Response.class, STATUS_CODE_FIELD_NAME)
                .build();
    }

    private ClassName getParentExceptionClassName() {
        if (isServerException) {
            return WEB_APPLICATION_EXCEPTION_CLASS_NAME;
        }
        return ClassNameUtils.EXCEPTION_CLASS_NAME;
    }

    private AnnotationSpec getJsonIncludePropertiesAnnotationSpec(
            Map<ErrorProperty, MethodSpec> methodSpecsByProperty) {
        List<String> jsonIncludeProperties = methodSpecsByProperty.values().stream()
                .map(methodSpec -> methodSpec.name)
                .collect(Collectors.toList());
        String includedPropertiesFormat =
                jsonIncludeProperties.stream().map(_unused -> "$S").collect(Collectors.joining(","));
        return AnnotationSpec.builder(JsonIncludeProperties.class)
                .addMember("value", "{" + includedPropertiesFormat + "}", jsonIncludeProperties.toArray())
                .build();
    }

    private MethodSpec generateStaticBuilder(Map<ErrorProperty, MethodSpec> methodSpecsByProperty) {
        Optional<String> firstMandatoryFieldName = getFirstRequiredFieldName(methodSpecsByProperty);
        ClassName builderClassName = firstMandatoryFieldName.isEmpty()
                ? generatedExceptionClassName.nestedClass("Builder")
                : generatedExceptionClassName.nestedClass(
                        StringUtils.capitalize(firstMandatoryFieldName.get()) + BUILD_STAGE_SUFFIX);
        return MethodSpec.methodBuilder(STATIC_BUILDER_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .returns(builderClassName)
                .addCode("return $T.builder();", generatedExceptionClassName)
                .build();
    }

    private static Optional<String> getFirstRequiredFieldName(Map<ErrorProperty, MethodSpec> methodSpecsByProperty) {
        for (Map.Entry<ErrorProperty, MethodSpec> entry : methodSpecsByProperty.entrySet()) {
            ErrorProperty property = entry.getKey();
            if (property.type().isPrimitive() || property.type().isNamed()) {
                return Optional.of(entry.getValue().name);
            }
        }
        return Optional.empty();
    }
}
