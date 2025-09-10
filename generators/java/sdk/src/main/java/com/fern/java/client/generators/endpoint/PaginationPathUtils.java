package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.FileUploadRequest;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.http.InlinedRequestBodyProperty;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.MapType;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class PaginationPathUtils {

    public static Optional<TypeReference> getPropertyTypeFromRequest(
            HttpEndpoint httpEndpoint, Name desiredPropertyName, AbstractGeneratorContext<?, ?> generatorContext) {
        if (httpEndpoint.getRequestBody().isEmpty()) {
            return Optional.empty();
        }

        HttpRequestBody body = httpEndpoint.getRequestBody().get();
        return body.visit(new TypeReferenceFinder(desiredPropertyName, generatorContext));
    }

    public static Optional<TypeReference> getPropertyFromProperty(
            TypeReference typeReference, Name desiredPropertyName, AbstractGeneratorContext<?, ?> generatorContext) {
        Optional<TypeDeclaration> maybeDeclaration = typeReference.visit(new TypeReferenceResolver(generatorContext));

        if (maybeDeclaration.isEmpty()) {
            return Optional.empty();
        }

        TypeDeclaration declaration = maybeDeclaration.get();
        Optional<ObjectTypeDeclaration> maybeObjectDeclaration =
                declaration.getShape().getObject();

        if (maybeObjectDeclaration.isEmpty()) {
            return Optional.empty();
        }

        ObjectTypeDeclaration objectDeclaration = maybeObjectDeclaration.get();

        Optional<TypeReference> maybeFoundExtended = objectDeclaration.getExtendedProperties().stream()
                .flatMap(List::stream)
                .filter(prop -> prop.getName()
                        .getName()
                        .getCamelCase()
                        .getSafeName()
                        .equals(desiredPropertyName.getCamelCase().getSafeName()))
                .map(ObjectProperty::getValueType)
                .findAny();

        if (maybeFoundExtended.isPresent()) {
            return maybeFoundExtended;
        }

        return objectDeclaration.getProperties().stream()
                .filter(prop -> prop.getName()
                        .getName()
                        .getCamelCase()
                        .getSafeName()
                        .equals(desiredPropertyName.getCamelCase().getSafeName()))
                .map(ObjectProperty::getValueType)
                .findAny();
    }

    public static Optional<EnrichedCursorPathItem> enriched(Name name, TypeReference pathPropertyType) {
        return pathPropertyType.visit(new TypeReferenceEnricher(name));
    }

    public static Optional<TypeName> unboxedTypeName(
            AbstractGeneratorContext<?, ?> generatorContext, TypeReference reference) {
        return reference.visit(new UnboxedTypeNameGetter(generatorContext, reference));
    }

    public static List<EnrichedCursorPathSetter> getPathSetters(
            List<Name> propertyPath,
            HttpEndpoint httpEndpoint,
            AbstractGeneratorContext<?, ?> generatorContext,
            String requestParameterSpecName,
            String propertyOverrideOnRequest,
            String propertyOverrideValueOnRequest) {
        List<EnrichedCursorPathSetter> result = new ArrayList<>();

        List<EnrichedCursorPathItem> enrichedItems = new ArrayList<>();
        Optional<com.fern.ir.model.types.TypeReference> curr =
                getPropertyTypeFromRequest(httpEndpoint, propertyPath.get(0), generatorContext);
        Map<Name, TypeReference> referencesByName = new HashMap<>();
        curr.map(curr_ -> referencesByName.put(propertyPath.get(0), curr_));

        curr.flatMap(curr_ -> enriched(propertyPath.get(0), curr_)).ifPresent(enrichedItems::add);

        for (Name name : propertyPath.subList(1, propertyPath.size())) {
            if (curr.isEmpty()) {
                break;
            }
            curr = getPropertyFromProperty(curr.get(), name, generatorContext);
            curr.map(curr_ -> referencesByName.put(name, curr_));
            curr.flatMap(curr_ -> enriched(name, curr_)).ifPresent(enrichedItems::add);
        }

        List<CodeBlock> getters = new ArrayList<>();
        getters.add(CodeBlock.builder().add("$L", requestParameterSpecName).build());
        CodeBlock getter = getters.get(0);
        boolean optional = false;
        String prevName = requestParameterSpecName;

        Map<EnrichedCursorPathItem, Boolean> gettersAreOptional = new HashMap<>();

        for (EnrichedCursorPathItem enriched : enrichedItems) {
            if (optional) {
                // TODO(ajgateno): Make sure we're using the actual getter names the same way
                //  they're obtained in the object generator.
                if (enriched.optional()) {
                    getter = getter.toBuilder()
                            .add(
                                    ".flatMap($L::get$L)",
                                    prevName,
                                    enriched.name().getPascalCase().getSafeName())
                            .build();
                } else {
                    getter = getter.toBuilder()
                            .add(
                                    ".map($L::get$L)",
                                    prevName,
                                    enriched.name().getPascalCase().getSafeName())
                            .build();
                }
            } else {
                getter = getter.toBuilder()
                        .add(".get$L()", enriched.name().getPascalCase().getSafeName())
                        .build();
            }
            getters.add(getter);
            optional = optional || enriched.optional();
            gettersAreOptional.put(enriched, optional);
            // TODO(ajgateno): Ensure this is always the type name; could probably add it to the
            //  EnrichedCursorPathItem
            prevName = enriched.name().getPascalCase().getSafeName();
        }

        List<EnrichedCursorPathGetter> enrichedGetters = new ArrayList<>();
        for (int i = 0; i < enrichedItems.size(); i++) {
            Optional<EnrichedCursorPathGetter> previous = Optional.empty();

            if (i > 0) {
                previous = Optional.of(enrichedGetters.get(enrichedGetters.size() - 1));
            }

            com.fern.ir.model.types.TypeReference typeReference = referencesByName.get(
                    enrichedItems.get(enrichedItems.size() - 1 - i).name());

            enrichedGetters.add(EnrichedCursorPathGetter.builder()
                    .pathItem(enrichedItems.get(enrichedItems.size() - 1 - i))
                    .getter(getters.get(getters.size() - 1 - i))
                    // TODO(ajgateno) handle empty
                    .typeName(unboxedTypeName(generatorContext, typeReference).get())
                    .previous(previous)
                    .optional(gettersAreOptional.get(enrichedItems.get(enrichedItems.size() - 1 - i)))
                    .build());
        }

        for (EnrichedCursorPathGetter enrichedGetter : enrichedGetters) {
            ImmutableEnrichedCursorPathSetter.Builder builder =
                    EnrichedCursorPathSetter.builder().getter(enrichedGetter);

            if (enrichedGetter.previous().isEmpty()) {
                if (enrichedGetter.optional()) {
                    builder.setter(CodeBlock.builder()
                            .add(
                                    "$T $L = ",
                                    ParameterizedTypeName.get(ClassName.get(Optional.class), enrichedGetter.typeName()),
                                    enrichedGetter.propertyName())
                            .add(
                                    "$L.map(($T $L) -> ",
                                    enrichedGetter.getter(),
                                    enrichedGetter.typeName(),
                                    enrichedGetter.propertyName() + "_")
                            .add(
                                    "$T.builder().from($L).$L($L).build()",
                                    enrichedGetter.typeName(),
                                    enrichedGetter.propertyName() + "_",
                                    propertyOverrideOnRequest,
                                    propertyOverrideValueOnRequest)
                            .add(")")
                            .build());
                } else {
                    builder.setter(CodeBlock.builder()
                            .add("$T $L = ", enrichedGetter.typeName(), enrichedGetter.propertyName())
                            .add(
                                    "$T.builder().from($L).$L($L).build()",
                                    enrichedGetter.typeName(),
                                    enrichedGetter.typeName(),
                                    propertyOverrideOnRequest,
                                    propertyOverrideValueOnRequest)
                            .build());
                }
            } else {
                if (enrichedGetter.previous().get().optional()) {
                    if (enrichedGetter.optional()) {
                        builder.setter(CodeBlock.builder()
                                .add(
                                        "$T $L = ",
                                        ParameterizedTypeName.get(
                                                ClassName.get(Optional.class), enrichedGetter.typeName()),
                                        enrichedGetter.propertyName())
                                .add(
                                        "$L.flatMap(($T $L) -> ",
                                        enrichedGetter.previous().get().propertyName(),
                                        enrichedGetter.previous().get().typeName(),
                                        enrichedGetter.previous().get().propertyName() + "_")
                                .add(
                                        "$L.map(($T $L) -> ",
                                        enrichedGetter.getter(),
                                        enrichedGetter.typeName(),
                                        enrichedGetter.propertyName() + "_")
                                .add(
                                        "$T.builder().from($L).$L($L).build()",
                                        enrichedGetter.typeName(),
                                        enrichedGetter.propertyName() + "_",
                                        enrichedGetter.previous().get().propertyName(),
                                        enrichedGetter.previous().get().propertyName() + "_")
                                .add(")")
                                .add(")")
                                .build());
                    } else {
                        builder.setter(CodeBlock.builder()
                                .add("$T $L = ", enrichedGetter.typeName(), enrichedGetter.propertyName())
                                .add(
                                        "$L.map(($T $L) -> ",
                                        enrichedGetter.previous().get().propertyName(),
                                        enrichedGetter.previous().get().typeName(),
                                        enrichedGetter.previous().get().propertyName() + "_")
                                .add(
                                        "$T.builder().from($L).$L($L).build()",
                                        enrichedGetter.typeName(),
                                        enrichedGetter.getter(),
                                        enrichedGetter.previous().get().propertyName(),
                                        enrichedGetter.previous().get().propertyName() + "_")
                                .add(")")
                                .build());
                    }
                } else {
                    if (enrichedGetter.optional()) {
                        builder.setter(CodeBlock.builder()
                                .add(
                                        "$T $L = ",
                                        ParameterizedTypeName.get(
                                                ClassName.get(Optional.class), enrichedGetter.typeName()),
                                        enrichedGetter.propertyName())
                                .add(
                                        "$L.map(($T $L) -> ",
                                        enrichedGetter.getter(),
                                        enrichedGetter.typeName(),
                                        enrichedGetter.propertyName() + "_")
                                .add(
                                        "$T.builder().from($L).$L($L).build()",
                                        enrichedGetter.typeName(),
                                        enrichedGetter.propertyName() + "_",
                                        enrichedGetter.previous().get().propertyName(),
                                        enrichedGetter.previous().get().propertyName())
                                .add(")")
                                .build());
                    } else {
                        builder.setter(CodeBlock.builder()
                                .add("$T $L = ", enrichedGetter.typeName(), enrichedGetter.propertyName())
                                .add(
                                        "$T.builder().from($L).$L($L).build())",
                                        enrichedGetter.typeName(),
                                        enrichedGetter.getter(),
                                        enrichedGetter.previous().get().propertyName(),
                                        enrichedGetter.previous().get().propertyName())
                                .build());
                    }
                }
            }

            result.add(builder.build());
        }

        return result;
    }

    public static class TypeReferenceEnricher
            implements TypeReference.Visitor<Optional<EnrichedCursorPathItem>>,
                    ContainerType.Visitor<Optional<EnrichedCursorPathItem>> {

        private final Name name;
        private final boolean optional;

        public TypeReferenceEnricher(Name name) {
            this(name, false);
        }

        private TypeReferenceEnricher(Name name, boolean optional) {
            this.name = name;
            this.optional = optional;
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitContainer(ContainerType containerType) {
            return containerType.visit(this);
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitNamed(NamedType namedType) {
            return Optional.of(EnrichedCursorPathItem.builder()
                    .name(name)
                    .optional(optional)
                    .build());
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitPrimitive(PrimitiveType primitiveType) {
            // NOTE: Primitives won't show up on the path because they have to be the last entry
            return Optional.empty();
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitUnknown() {
            return Optional.empty();
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitList(TypeReference typeReference) {
            // NOTE: Lists are currently not supported in cursor paths
            return Optional.empty();
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitMap(MapType mapType) {
            // NOTE: Maps are currently not supported in cursor paths
            return Optional.empty();
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitNullable(TypeReference typeReference) {
            return typeReference.visit(new TypeReferenceEnricher(name, true));
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitOptional(TypeReference typeReference) {
            return typeReference.visit(new TypeReferenceEnricher(name, true));
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitSet(TypeReference typeReference) {
            // NOTE: Sets are currently not supported in cursor paths
            return Optional.empty();
        }

        @Override
        public Optional<EnrichedCursorPathItem> visitLiteral(Literal literal) {
            // NOTE: Container literals won't show up on the path because they have to be the last entry
            return Optional.empty();
        }

        @Override
        public Optional<EnrichedCursorPathItem> _visitUnknown(Object o) {
            return Optional.empty();
        }
    }

    public static class TypeReferenceFinder implements HttpRequestBody.Visitor<Optional<TypeReference>> {

        private final Name desiredPropertyName;
        private final AbstractGeneratorContext<?, ?> generatorContext;

        public TypeReferenceFinder(Name desiredPropertyName, AbstractGeneratorContext<?, ?> generatorContext) {
            this.desiredPropertyName = desiredPropertyName;
            this.generatorContext = generatorContext;
        }

        @Override
        public Optional<TypeReference> visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
            Optional<TypeReference> maybeFoundExtended = inlinedRequestBody.getExtendedProperties().stream()
                    .flatMap(List::stream)
                    .filter(prop -> prop.getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equals(desiredPropertyName.getCamelCase().getSafeName()))
                    .map(ObjectProperty::getValueType)
                    .findAny();

            if (maybeFoundExtended.isPresent()) {
                return maybeFoundExtended;
            }

            return inlinedRequestBody.getProperties().stream()
                    .filter(prop -> prop.getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equals(desiredPropertyName.getCamelCase().getSafeName()))
                    .map(InlinedRequestBodyProperty::getValueType)
                    .findAny();
        }

        @Override
        public Optional<TypeReference> visitReference(HttpRequestBodyReference httpRequestBodyReference) {
            // NOTE: Should not happen for this use-case since we should only allow named types for
            //  pagination.
            if (httpRequestBodyReference.getRequestBodyType().getNamed().isEmpty()) {
                return Optional.empty();
            }

            Optional<TypeDeclaration> maybeDeclaration =
                    httpRequestBodyReference.getRequestBodyType().visit(new TypeReferenceResolver(generatorContext));

            if (maybeDeclaration.isEmpty()) {
                return Optional.empty();
            }

            TypeDeclaration declaration = maybeDeclaration.get();
            Optional<ObjectTypeDeclaration> maybeObjectDeclaration =
                    declaration.getShape().getObject();

            if (maybeObjectDeclaration.isEmpty()) {
                return Optional.empty();
            }

            ObjectTypeDeclaration objectDeclaration = maybeObjectDeclaration.get();

            Optional<TypeReference> maybeFoundExtended = objectDeclaration.getExtendedProperties().stream()
                    .flatMap(List::stream)
                    .filter(prop -> prop.getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equals(desiredPropertyName.getCamelCase().getSafeName()))
                    .map(ObjectProperty::getValueType)
                    .findAny();

            if (maybeFoundExtended.isPresent()) {
                return maybeFoundExtended;
            }

            return objectDeclaration.getProperties().stream()
                    .filter(prop -> prop.getName()
                            .getName()
                            .getCamelCase()
                            .getSafeName()
                            .equals(desiredPropertyName.getCamelCase().getSafeName()))
                    .map(ObjectProperty::getValueType)
                    .findAny();
        }

        @Override
        public Optional<TypeReference> visitFileUpload(FileUploadRequest fileUploadRequest) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeReference> visitBytes(BytesRequest bytesRequest) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeReference> _visitUnknown(Object o) {
            return Optional.empty();
        }
    }

    public static class TypeReferenceResolver
            implements TypeReference.Visitor<Optional<TypeDeclaration>>,
                    ContainerType.Visitor<Optional<TypeDeclaration>> {

        private final AbstractGeneratorContext<?, ?> generatorContext;

        public TypeReferenceResolver(AbstractGeneratorContext<?, ?> generatorContext) {
            this.generatorContext = generatorContext;
        }

        @Override
        public Optional<TypeDeclaration> visitList(TypeReference typeReference) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeDeclaration> visitMap(MapType mapType) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeDeclaration> visitNullable(TypeReference typeReference) {
            return typeReference.visit(this);
        }

        @Override
        public Optional<TypeDeclaration> visitOptional(TypeReference typeReference) {
            return typeReference.visit(this);
        }

        @Override
        public Optional<TypeDeclaration> visitSet(TypeReference typeReference) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeDeclaration> visitLiteral(Literal literal) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeDeclaration> visitContainer(ContainerType containerType) {
            return containerType.visit(this);
        }

        @Override
        public Optional<TypeDeclaration> visitNamed(NamedType namedType) {
            return Optional.ofNullable(generatorContext.getTypeDeclarations().get(namedType.getTypeId()));
        }

        @Override
        public Optional<TypeDeclaration> visitPrimitive(PrimitiveType primitiveType) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeDeclaration> visitUnknown() {
            return Optional.empty();
        }

        @Override
        public Optional<TypeDeclaration> _visitUnknown(Object o) {
            return Optional.empty();
        }
    }

    public static class UnboxedTypeNameGetter
            implements TypeReference.Visitor<Optional<TypeName>>, ContainerType.Visitor<Optional<TypeName>> {

        private AbstractGeneratorContext<?, ?> generatorContext;
        private TypeReference reference;

        public UnboxedTypeNameGetter(AbstractGeneratorContext<?, ?> generatorContext, TypeReference reference) {
            this.generatorContext = generatorContext;
            this.reference = reference;
        }

        @Override
        public Optional<TypeName> visitList(TypeReference typeReference) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeName> visitMap(MapType mapType) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeName> visitNullable(TypeReference typeReference) {
            return typeReference.visit(new UnboxedTypeNameGetter(generatorContext, typeReference));
        }

        @Override
        public Optional<TypeName> visitOptional(TypeReference typeReference) {
            return typeReference.visit(new UnboxedTypeNameGetter(generatorContext, typeReference));
        }

        @Override
        public Optional<TypeName> visitSet(TypeReference typeReference) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeName> visitLiteral(Literal literal) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeName> visitContainer(ContainerType containerType) {
            return containerType.visit(this);
        }

        @Override
        public Optional<TypeName> visitNamed(NamedType namedType) {
            return Optional.of(generatorContext.getPoetTypeNameMapper().convertToTypeName(true, reference));
        }

        @Override
        public Optional<TypeName> visitPrimitive(PrimitiveType primitiveType) {
            return Optional.empty();
        }

        @Override
        public Optional<TypeName> visitUnknown() {
            return Optional.empty();
        }

        @Override
        public Optional<TypeName> _visitUnknown(Object o) {
            return Optional.empty();
        }
    }
}
