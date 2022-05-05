package com.fern.codegen.stateless.generator;

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.utils.ClassNameUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class ImmutablesStyleGenerator {

    private static final String STAGED_BUILDER_ANNOTATION_CLASS_NAME = "StagedBuilderStyle";
    private static final String PACKAGE_PRIVATE_STYLE_ANNOTATION_CLASS_NAME = "PackagePrivateStyle";

    private ImmutablesStyleGenerator() {}

    public static GeneratedFile generateStagedBuilderImmutablesStyle(ClassNameUtils classNameUtils) {
        ClassName stagedBuilderClassName =
                classNameUtils.getClassName(STAGED_BUILDER_ANNOTATION_CLASS_NAME, Optional.empty(), Optional.empty());
        TypeSpec stagedBuilderTypeSpec = TypeSpec.annotationBuilder(stagedBuilderClassName)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(Target.class)
                        .addMember(
                                "value",
                                "{$T.$L, $T.$L}",
                                ElementType.class,
                                ElementType.PACKAGE.name(),
                                ElementType.class,
                                ElementType.TYPE.name())
                        .build())
                .addAnnotation(AnnotationSpec.builder(Retention.class)
                        .addMember("value", "$T.$L", RetentionPolicy.class, RetentionPolicy.SOURCE.name())
                        .build())
                .addAnnotation(AnnotationSpec.builder(Value.Style.class)
                        .addMember("jdkOnly", "$L", Boolean.TRUE.toString())
                        .addMember("stagedBuilder", "$L", Boolean.TRUE.toString())
                        .addMember(
                                "visibility",
                                "$T.$L.$L",
                                Value.Style.class,
                                "ImplementationVisibility",
                                Value.Style.ImplementationVisibility.PACKAGE.name())
                        .addMember("overshadowImplementation", "$L", Boolean.TRUE.toString())
                        .build())
                .build();
        JavaFile stagedBuilderFile = JavaFile.builder(stagedBuilderClassName.packageName(), stagedBuilderTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(stagedBuilderFile)
                .className(stagedBuilderClassName)
                .build();
    }

    public static GeneratedFile generatePackagePrivateImmutablesStyle(ClassNameUtils classNameUtils) {
        ClassName packagePrivateStyleClassName = classNameUtils.getClassName(
                PACKAGE_PRIVATE_STYLE_ANNOTATION_CLASS_NAME, Optional.empty(), Optional.empty());
        TypeSpec packagePrivateStyleTypeSpec = TypeSpec.annotationBuilder(packagePrivateStyleClassName)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(Target.class)
                        .addMember(
                                "value",
                                "{$T.$L, $T.$L}",
                                ElementType.class,
                                ElementType.PACKAGE.name(),
                                ElementType.class,
                                ElementType.TYPE.name())
                        .build())
                .addAnnotation(AnnotationSpec.builder(Retention.class)
                        .addMember("value", "$T.$L", RetentionPolicy.class, RetentionPolicy.SOURCE.name())
                        .build())
                .addAnnotation(AnnotationSpec.builder(Value.Style.class)
                        .addMember("jdkOnly", "$L", Boolean.TRUE.toString())
                        .addMember(
                                "visibility",
                                "$T.$L.$L",
                                Value.Style.class,
                                "ImplementationVisibility",
                                Value.Style.ImplementationVisibility.PACKAGE.name())
                        .addMember("overshadowImplementation", "$L", Boolean.TRUE.toString())
                        .build())
                .build();
        JavaFile packagePrivateStyleFile = JavaFile.builder(
                        packagePrivateStyleClassName.packageName(), packagePrivateStyleTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(packagePrivateStyleFile)
                .className(packagePrivateStyleClassName)
                .build();
    }
}
