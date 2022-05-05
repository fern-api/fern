package com.fern.model.codegen;

import com.errors.ErrorDefinition;
import com.errors.ErrorProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedException;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.Map;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;

public final class ExceptionGenerator extends Generator {

    private static final String STATUS_CODE_FIELD_NAME = "STATUS_CODE";

    private static final String STATIC_BUILDER_METHOD_NAME = "builder";
    private static final String BUILD_STAGE_SUFFIX = "BuildStage";

    private final ErrorDefinition errorDefinition;
    private final ClassName generatedExceptionClassName;

    public ExceptionGenerator(GeneratorContext generatorContext, ErrorDefinition errorDefinition) {
        super(generatorContext, PackageType.ERRORS);
        this.errorDefinition = errorDefinition;
        this.generatedExceptionClassName =
                generatorContext.getClassNameUtils().getClassNameForNamedType(errorDefinition.name(), packageType);
    }

    @Override
    public GeneratedException generate() {
        TypeSpec.Builder errorExceptionTypeSpec = TypeSpec.classBuilder(generatorContext
                        .getClassNameUtils()
                        .getClassNameForNamedType(errorDefinition.name(), packageType))
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember(
                                "as",
                                "$T.class",
                                generatorContext
                                        .getImmutablesUtils()
                                        .getImmutablesClassName(generatedExceptionClassName))
                        .build())
                .addAnnotation(generatorContext.getStagedImmutablesFile().className())
                .addSuperinterface(ClassNameUtils.EXCEPTION_CLASS_NAME)
                .addSuperinterface(generatorContext.getApiExceptionFile().className());
        if (errorDefinition.http().isPresent()) {
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
        errorExceptionTypeSpec.addMethods(methodSpecsByProperty.values());
        errorExceptionTypeSpec.addMethod(generateStaticBuilder(methodSpecsByProperty));
        TypeSpec errorExceptionTypeSPec = errorExceptionTypeSpec.build();
        JavaFile objectFile = JavaFile.builder(generatedExceptionClassName.packageName(), errorExceptionTypeSPec)
                .build();
        return GeneratedException.builder()
                .file(objectFile)
                .className(generatedExceptionClassName)
                .errorDefinition(errorDefinition)
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
