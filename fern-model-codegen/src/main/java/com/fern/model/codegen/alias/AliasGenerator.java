package com.fern.model.codegen.alias;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.GeneratorContext;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.types.AliasTypeDefinition;
import com.types.NamedType;
import java.util.List;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class AliasGenerator extends Generator {

    private static final Modifier[] ALIAS_CLASS_MODIFIERS = new Modifier[] {Modifier.PUBLIC};

    private static final String IMMUTABLES_VALUE_PROPERTY_NAME = "value";

    private static final String VALUE_OF_METHOD_NAME = "valueOf";

    private final AliasTypeDefinition aliasTypeDefinition;
    private final NamedType namedType;
    private final ClassName generatedAliasClassName;
    private final ClassName generatedAliasImmutablesClassName;

    public AliasGenerator(
            AliasTypeDefinition aliasTypeDefinition, NamedType namedType, GeneratorContext generatorContext) {
        super(generatorContext);
        this.aliasTypeDefinition = aliasTypeDefinition;
        this.namedType = namedType;
        this.generatedAliasClassName = generatorContext.getClassNameUtils().getClassNameForNamedType(namedType);
        this.generatedAliasImmutablesClassName =
                generatorContext.getImmutablesUtils().getImmutablesClassName(generatedAliasClassName);
    }

    @Override
    public GeneratedAlias generate() {
        TypeSpec.Builder aliasTypeSpecBuilder = TypeSpec.interfaceBuilder(generatedAliasClassName)
                .addModifiers(ALIAS_CLASS_MODIFIERS)
                .addAnnotations(getAnnotationSpecs());
        TypeSpec aliasTypeSpec;
        if (aliasTypeDefinition.aliasOf().isVoid()) {
            aliasTypeSpec = aliasTypeSpecBuilder.addMethod(getValueOfMethod()).build();
        } else {
            TypeName aliasTypeName = generatorContext
                    .getClassNameUtils()
                    .getTypeNameFromTypeReference(true, aliasTypeDefinition.aliasOf());
            aliasTypeSpec = aliasTypeSpecBuilder
                    .addMethod(getImmutablesValueProperty(aliasTypeName))
                    .addMethod(getValueOfMethod(aliasTypeName))
                    .build();
        }
        JavaFile aliasFile = JavaFile.builder(generatedAliasClassName.packageName(), aliasTypeSpec)
                .build();
        return GeneratedAlias.builder()
                .file(aliasFile)
                .className(generatedAliasClassName)
                .aliasTypeDefinition(aliasTypeDefinition)
                .build();
    }

    private List<AnnotationSpec> getAnnotationSpecs() {
        return List.of(
                AnnotationSpec.builder(Value.Immutable.class).build(),
                AnnotationSpec.builder(generatorContext.getStagedImmutablesBuilderClassname())
                        .build(),
                AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember("as", "$T.class", generatedAliasImmutablesClassName)
                        .build());
    }

    private MethodSpec getImmutablesValueProperty(TypeName aliasTypeName) {
        return MethodSpec.methodBuilder(IMMUTABLES_VALUE_PROPERTY_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(JsonValue.class)
                .returns(aliasTypeName)
                .build();
    }

    private MethodSpec getValueOfMethod(TypeName aliasTypeName) {
        return MethodSpec.methodBuilder(VALUE_OF_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(aliasTypeName, "value")
                .addStatement("return $T.builder().value($L).build()", generatedAliasImmutablesClassName, "value")
                .returns(generatedAliasClassName)
                .build();
    }

    private MethodSpec getValueOfMethod() {
        return MethodSpec.methodBuilder(VALUE_OF_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.DEFAULT)
                .addStatement("return $T.builder().build()", generatedAliasImmutablesClassName, "value")
                .returns(generatedAliasClassName)
                .build();
    }
}
