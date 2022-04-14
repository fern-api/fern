package com.fern.model.codegen.alias;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.AliasTypeDefinition;
import com.fern.NamedTypeReference;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.GeneratorContext;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

public final class AliasGenerator extends Generator<AliasTypeDefinition> {

    private static final Modifier[] ALIAS_CLASS_MODIFIERS = new Modifier[] {Modifier.PUBLIC};

    private static final String IMMUTABLES_VALUE_PROPERTY_NAME = "value";

    private static final String VALUE_OF_METHOD_NAME = "valueOf";

    private final AliasTypeDefinition aliasTypeDefinition;
    private final NamedTypeReference namedTypeReference;
    private final ClassName generatedAliasClassName;

    public AliasGenerator(
            AliasTypeDefinition aliasTypeDefinition,
            NamedTypeReference namedTypeReference,
            GeneratorContext generatorContext) {
        super(generatorContext);
        this.aliasTypeDefinition = aliasTypeDefinition;
        this.namedTypeReference = namedTypeReference;
        this.generatedAliasClassName = generatorContext.getClassNameUtils().getClassName(namedTypeReference);
    }

    public GeneratedAlias generate() {
        TypeName aliasTypeName =
                generatorContext.getTypeReferenceUtils().convertToTypeName(true, aliasTypeDefinition.aliasType());
        TypeSpec aliasTypeSpec = TypeSpec.interfaceBuilder(generatedAliasClassName)
                .addModifiers(ALIAS_CLASS_MODIFIERS)
                .addAnnotations(getAnnotationSpecs())
                .addMethod(getImmutablesValueProperty(aliasTypeName))
                .addMethod(getValueOfMethod(aliasTypeName))
                .build();
        JavaFile aliasFile = JavaFile.builder(generatedAliasClassName.packageName(), aliasTypeSpec)
                .build();
        return GeneratedAlias.builder()
                .file(aliasFile)
                .definition(aliasTypeDefinition)
                .className(generatedAliasClassName)
                .build();
    }

    private List<AnnotationSpec> getAnnotationSpecs() {
        return List.of(
                AnnotationSpec.builder(Value.Immutable.class).build(),
                AnnotationSpec.builder(StagedBuilderStyle.class).build(),
                AnnotationSpec.builder(JsonDeserialize.class)
                        .addMember(
                                "as",
                                "$T.class",
                                generatorContext.getImmutablesUtils().getImmutablesClassName(namedTypeReference))
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
                .addModifiers(Modifier.PUBLIC, Modifier.DEFAULT)
                .addParameter(aliasTypeName, "value")
                .addStatement(
                        "return $T.builder().value($L).build()",
                        generatorContext.getImmutablesUtils().getImmutablesClassName(namedTypeReference),
                        "value")
                .build();
    }
}
