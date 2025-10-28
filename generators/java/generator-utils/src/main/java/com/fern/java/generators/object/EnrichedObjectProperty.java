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
            // Determine the correct empty type based on the field's actual type
            TypeName emptyType;
            if (poetTypeName() instanceof com.squareup.javapoet.ParameterizedTypeName) {
                com.squareup.javapoet.ParameterizedTypeName paramType =
                        (com.squareup.javapoet.ParameterizedTypeName) poetTypeName();
                // Check if this is a Nullable type by comparing the class name
                if (paramType.rawType.simpleName().equals("Nullable")) {
                    // Use the actual Nullable class from the field type
                    emptyType = paramType.rawType;
                } else {
                    emptyType = ClassName.get(Optional.class);
                }
            } else {
                emptyType = ClassName.get(Optional.class);
            }
            getterBuilder
                    .beginControlFlow("if ($L == null)", fieldSpec().get().name)
                    .addStatement("return $T.empty()", emptyType)
                    .endControlFlow();
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
        if (wireKey().isPresent() && !nullable() && !aliasOfNullable()) {
            getterBuilder.addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                    .addMember("value", "$S", wireKey().get())
                    .build());
        } else {
            getterBuilder.addAnnotation(AnnotationSpec.builder(JsonIgnore.class).build());
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
        if (wireKey().isEmpty() || (!nullable() && !aliasOfNullable())) {
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
