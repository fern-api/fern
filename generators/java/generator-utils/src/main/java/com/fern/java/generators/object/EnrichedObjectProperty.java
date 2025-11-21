package com.fern.java.generators.object;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.utils.JavaDocUtils;
import com.fern.java.utils.KeyWordUtils;
import com.fern.java.utils.NullableAnnotationUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface EnrichedObjectProperty {

    Optional<String> wireKey();

    String camelCaseKey();

    String pascalCaseKey();

    TypeName poetTypeName();

    boolean fromInterface();

    boolean inline();

    boolean wrappedAliases();

    Optional<String> docs();

    Optional<Literal> literal();

    ObjectProperty objectProperty();

    Optional<TypeDeclaration> typeDeclaration();

    ClassName nullableNonemptyFilterClassName();

    AbstractGeneratorContext.GeneratorType generator();

    boolean allowMultiple();

    boolean useNullableAnnotation();

    @Value.Lazy
    default Optional<FieldSpec> fieldSpec() {
        if (literal().isPresent()) {
            return Optional.empty();
        }
        FieldSpec.Builder fieldBuilder = FieldSpec.builder(
                poetTypeName(),
                KeyWordUtils.getKeyWordCompatibleName(camelCaseKey()),
                Modifier.PRIVATE,
                Modifier.FINAL);

        boolean shouldUseNullableAnnotation =
                useNullableAnnotation() && isNullable(objectProperty().getValueType());
        if (shouldUseNullableAnnotation && !poetTypeName().isPrimitive()) {
            fieldBuilder.addAnnotation(NullableAnnotationUtils.getNullableAnnotation());
        }

        return Optional.of(fieldBuilder.build());
    }

    @Value.Lazy
    default MethodSpec getterProperty() {
        MethodSpec.Builder getterBuilder = MethodSpec.methodBuilder(
                        KeyWordUtils.getKeyWordCompatibleMethodName("get" + pascalCaseKey()))
                .addModifiers(Modifier.PUBLIC)
                .returns(poetTypeName());

        boolean shouldUseNullableAnnotation =
                useNullableAnnotation() && isNullable(objectProperty().getValueType());
        if (shouldUseNullableAnnotation) {
            getterBuilder.addAnnotation(NullableAnnotationUtils.getNullableAnnotation());
        }

        if (nullable() && !shouldUseNullableAnnotation) {
            if (isOptionalNullableField()) {
                // For OptionalNullable fields, return OptionalNullable.absent() when null
                com.squareup.javapoet.ParameterizedTypeName paramTypeName =
                        (com.squareup.javapoet.ParameterizedTypeName) poetTypeName();
                com.squareup.javapoet.ClassName optionalNullableClassName = paramTypeName.rawType;
                getterBuilder
                        .beginControlFlow("if ($L == null)", fieldSpec().get().name)
                        .addStatement("return $T.absent()", optionalNullableClassName)
                        .endControlFlow();
            } else {
                // For regular Optional fields, return Optional.empty() when null
                getterBuilder
                        .beginControlFlow("if ($L == null)", fieldSpec().get().name)
                        .addStatement("return $T.empty()", Optional.class)
                        .endControlFlow();
            }
        } else if (aliasOfNullable() && wrappedAliases()) {
            getterBuilder
                    .beginControlFlow("if ($L == null)", fieldSpec().get().name)
                    .addStatement("return $T.of($T.empty())", poetTypeName(), Optional.class)
                    .endControlFlow();
        }
        if (literal().isPresent()) {
            literal().get().visit(new Literal.Visitor<Void>() {
                @Override
                public Void visitString(String string) {
                    getterBuilder.addStatement("return $S", string);
                    return null;
                }

                @Override
                public Void visitBoolean(boolean boolean_) {
                    getterBuilder.addStatement("return $L", boolean_);
                    return null;
                }

                @Override
                public Void _visitUnknown(Object unknownType) {
                    return null;
                }
            });
        } else {
            getterBuilder.addStatement("return $L", fieldSpec().get().name);
        }
        // Headers have empty wireKey to avoid JSON serialization
        boolean hasWireKey = wireKey().isPresent() && !wireKey().get().isEmpty();
        if (hasWireKey && !nullable() && !aliasOfNullable() && !isOptionalNullableField()) {
            getterBuilder.addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                    .addMember("value", "$S", wireKey().get())
                    .build());
        } else {
            // Check if this is an OptionalNullable field - if so, add @JsonInclude + @JsonProperty
            if (hasWireKey && isOptionalNullableField()) {
                getterBuilder.addAnnotation(AnnotationSpec.builder(JsonInclude.class)
                        .addMember("value", "$T.Include.CUSTOM", JsonInclude.class)
                        .addMember("valueFilter", "$T.class", nullableNonemptyFilterClassName())
                        .build());
                getterBuilder.addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                        .addMember("value", "$S", wireKey().get())
                        .build());
            } else {
                getterBuilder.addAnnotation(AnnotationSpec.builder(JsonIgnore.class).build());
            }
        }
        if (fromInterface() && !inline()) {
            getterBuilder.addAnnotation(ClassName.get("", "java.lang.Override"));
        }
        if (docs().isPresent()) {
            getterBuilder.addJavadoc(JavaDocUtils.getReturnDocs(docs().get()));
        }
        return getterBuilder.build();
    }

    @Value.Lazy
    default Optional<MethodSpec> getterForSerialization() {
        // Headers have empty wireKey and should not have serialization getter
        boolean hasWireKey = wireKey().isPresent() && !wireKey().get().isEmpty();
        if (!hasWireKey || (!nullable() && !aliasOfNullable())) {
            return Optional.empty();
        }

        MethodSpec.Builder getterBuilder = MethodSpec.methodBuilder(
                        KeyWordUtils.getKeyWordCompatibleMethodName("_get" + pascalCaseKey()))
                .addModifiers(Modifier.PRIVATE)
                .returns(poetTypeName());
        getterBuilder.addAnnotation(AnnotationSpec.builder(JsonInclude.class)
                .addMember("value", "$T.Include.CUSTOM", JsonInclude.class)
                .addMember("valueFilter", "$T.class", nullableNonemptyFilterClassName())
                .build());
        getterBuilder.addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                .addMember("value", "$S", wireKey().get())
                .build());
        getterBuilder.addStatement("return $L", fieldSpec().get().name);
        return Optional.of(getterBuilder.build());
    }

    @Value.Lazy
    default boolean nullable() {
        boolean nullable = (generator().equals(AbstractGeneratorContext.GeneratorType.SDK)
                        || generator().equals(AbstractGeneratorContext.GeneratorType.SPRING))
                && isNullable(objectProperty().getValueType());
        return nullable || optionalNullable();
    }

    @Value.Lazy
    default boolean aliasOfNullable() {
        boolean aliasOfNullable = typeDeclaration().isPresent()
                && typeDeclaration().get().getShape().isAlias()
                && typeDeclaration()
                        .get()
                        .getShape()
                        .getAlias()
                        .get()
                        .getResolvedType()
                        .isContainer()
                && typeDeclaration()
                        .get()
                        .getShape()
                        .getAlias()
                        .get()
                        .getResolvedType()
                        .getContainer()
                        .get()
                        .isNullable();
        return (generator().equals(AbstractGeneratorContext.GeneratorType.SDK)
                        || generator().equals(AbstractGeneratorContext.GeneratorType.SPRING))
                && aliasOfNullable;
    }

    @Value.Lazy
    default boolean optionalNullable() {
        return generator().equals(AbstractGeneratorContext.GeneratorType.SDK)
                && isOptional(objectProperty().getValueType())
                && isNullable(objectProperty()
                        .getValueType()
                        .getContainer()
                        .get()
                        .getOptional()
                        .get());
    }

    static boolean isOptional(TypeReference reference) {
        return reference.isContainer() && reference.getContainer().get().isOptional();
    }

    static boolean isNullable(TypeReference reference) {
        return reference.isContainer() && reference.getContainer().get().isNullable();
    }

    default boolean isOptionalNullableField() {
        // Check if the field type is OptionalNullable<T>
        TypeName typeName = poetTypeName();
        if (typeName instanceof com.squareup.javapoet.ParameterizedTypeName) {
            com.squareup.javapoet.ParameterizedTypeName paramTypeName =
                    (com.squareup.javapoet.ParameterizedTypeName) typeName;
            // OptionalNullable is in the same package as Nullable
            com.squareup.javapoet.ClassName optionalNullableClassName =
                    com.squareup.javapoet.ClassName.get(paramTypeName.rawType.packageName(), "OptionalNullable");
            return paramTypeName.rawType.equals(optionalNullableClassName);
        }
        return false;
    }

    static ImmutableEnrichedObjectProperty.CamelCaseKeyBuildStage builder() {
        return ImmutableEnrichedObjectProperty.builder();
    }

    static EnrichedObjectProperty of(
            ObjectProperty objectProperty,
            AbstractGeneratorContext.GeneratorType generator,
            Optional<TypeDeclaration> typeDeclaration,
            ClassName nullableNonemptyFilterClassName,
            boolean fromInterface,
            boolean inline,
            boolean wrappedAliases,
            TypeName poetTypeName,
            boolean allowMultiple,
            boolean useNullableAnnotation) {
        Name name = objectProperty.getName().getName();
        Optional<Literal> maybeLiteral =
                objectProperty.getValueType().getContainer().flatMap(ContainerType::getLiteral);
        return EnrichedObjectProperty.builder()
                .camelCaseKey(name.getCamelCase().getSafeName())
                .pascalCaseKey(name.getPascalCase().getSafeName())
                .poetTypeName(poetTypeName)
                .fromInterface(fromInterface)
                .inline(inline)
                .wrappedAliases(wrappedAliases)
                .objectProperty(objectProperty)
                .nullableNonemptyFilterClassName(nullableNonemptyFilterClassName)
                .generator(generator)
                .allowMultiple(allowMultiple)
                .useNullableAnnotation(useNullableAnnotation)
                .wireKey(objectProperty.getName().getWireValue())
                .docs(objectProperty.getDocs())
                .literal(maybeLiteral)
                .typeDeclaration(typeDeclaration)
                .build();
    }
}
