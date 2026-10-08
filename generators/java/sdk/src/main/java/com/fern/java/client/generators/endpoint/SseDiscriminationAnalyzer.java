package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.SingleUnionType;
import com.fern.ir.model.types.SingleUnionTypeProperties;
import com.fern.ir.model.types.SingleUnionTypeProperty;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.UnionDiscriminatorContext;
import com.fern.ir.model.types.UnionTypeDeclaration;
import com.fern.java.utils.NameUtils;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Analyzes SSE payload types to determine if protocol-level or data-level discrimination is needed.
 *
 * <p>Uses the IR's {@code discriminatorContext} on the union declaration: if the context is {@code PROTOCOL}, the
 * discriminator lives at the SSE envelope level and requires custom handling. Otherwise (including absent/default), the
 * discriminator is inside the JSON data payload and Jackson handles it automatically.
 */
public final class SseDiscriminationAnalyzer {

    /** Type of discrimination for SSE events. */
    public enum DiscriminationType {
        /** Not a discriminated union - no special handling needed */
        NONE,
        /** Discriminator is inside the JSON data payload - Jackson handles automatically */
        DATA_LEVEL,
        /** Discriminator is at SSE envelope level - requires custom handling */
        PROTOCOL_LEVEL
    }

    /** Result of SSE discrimination analysis. */
    public static final class SseDiscriminationInfo {
        private final DiscriminationType type;
        private final String discriminatorProperty;
        private final List<String> envelopeEvents;

        private SseDiscriminationInfo(
                DiscriminationType type, String discriminatorProperty, List<String> envelopeEvents) {
            this.type = type;
            this.discriminatorProperty = discriminatorProperty;
            this.envelopeEvents = envelopeEvents;
        }

        /**
         * For protocol-level unions that mix envelope-shaped ({data, id?, retry?}) and payload-shaped variants,
         * the event names of the envelope-shaped variants. Empty when every variant can be parsed from the
         * SSE envelope.
         */
        public Optional<List<String>> getEnvelopeEvents() {
            return Optional.ofNullable(envelopeEvents);
        }

        public DiscriminationType getType() {
            return type;
        }

        public Optional<String> getDiscriminatorProperty() {
            return Optional.ofNullable(discriminatorProperty);
        }

        public static SseDiscriminationInfo none() {
            return new SseDiscriminationInfo(DiscriminationType.NONE, null, null);
        }

        public static SseDiscriminationInfo dataLevel(String discriminatorProperty) {
            return new SseDiscriminationInfo(DiscriminationType.DATA_LEVEL, discriminatorProperty, null);
        }

        public static SseDiscriminationInfo protocolLevel(String discriminatorProperty) {
            return new SseDiscriminationInfo(DiscriminationType.PROTOCOL_LEVEL, discriminatorProperty, null);
        }

        public static SseDiscriminationInfo protocolLevel(String discriminatorProperty, List<String> envelopeEvents) {
            return new SseDiscriminationInfo(DiscriminationType.PROTOCOL_LEVEL, discriminatorProperty, envelopeEvents);
        }
    }

    private SseDiscriminationAnalyzer() {
        // Utility class
    }

    /**
     * Analyzes the SSE payload type to determine what type of discrimination is needed.
     *
     * @param payloadType The SSE payload type reference from the IR
     * @param typeDeclarations Map of all type declarations
     * @return The discrimination info indicating how to handle SSE parsing
     */
    public static SseDiscriminationInfo analyze(
            TypeReference payloadType, Map<TypeId, TypeDeclaration> typeDeclarations) {

        // Resolve the type reference to its declaration
        Optional<UnionTypeDeclaration> unionDeclaration = resolveUnionType(payloadType, typeDeclarations);

        if (unionDeclaration.isEmpty()) {
            // Not a discriminated union - use standard SSE parsing
            return SseDiscriminationInfo.none();
        }

        // Get the discriminant property name
        String discriminatorProperty =
                NameUtils.getWireValue(unionDeclaration.get().getDiscriminant());

        // Use the IR's discriminatorContext to determine discrimination level
        Optional<UnionDiscriminatorContext> context = unionDeclaration.get().getDiscriminatorContext();
        if (context.isPresent() && context.get().equals(UnionDiscriminatorContext.PROTOCOL)) {
            return SseDiscriminationInfo.protocolLevel(
                    discriminatorProperty,
                    getEnvelopeEventsIfMixed(unionDeclaration.get(), discriminatorProperty, typeDeclarations));
        } else {
            return SseDiscriminationInfo.dataLevel(discriminatorProperty);
        }
    }

    /** Resolves a TypeReference to its UnionTypeDeclaration, following aliases if necessary. */
    private static final java.util.Set<String> SSE_ENVELOPE_FIELDS = new HashSet<>(Arrays.asList("data", "id", "retry"));

    /**
     * Returns the event names of envelope-shaped variants ({data, id?, retry?}) if the union also has
     * payload-shaped variants, or null if every variant can be parsed from the SSE envelope.
     */
    private static List<String> getEnvelopeEventsIfMixed(
            UnionTypeDeclaration union, String discriminatorProperty, Map<TypeId, TypeDeclaration> typeDeclarations) {
        List<String> envelopeEvents = new ArrayList<>();
        boolean hasPayloadVariant = false;
        for (SingleUnionType variant : union.getTypes()) {
            List<String> propertyNames = variant.getShape().visit(new SingleUnionTypeProperties.Visitor<List<String>>() {
                @Override
                public List<String> visitSamePropertiesAsObject(DeclaredTypeName declaredTypeName) {
                    TypeDeclaration declaration = typeDeclarations.get(declaredTypeName.getTypeId());
                    if (declaration == null || !declaration.getShape().isObject()) {
                        return null;
                    }
                    ObjectTypeDeclaration object = declaration.getShape().getObject().get();
                    List<ObjectProperty> properties = new ArrayList<>();
                    object.getExtendedProperties().ifPresent(properties::addAll);
                    properties.addAll(object.getProperties());
                    List<String> names = new ArrayList<>();
                    for (ObjectProperty property : properties) {
                        names.add(NameUtils.getWireValue(property.getName()));
                    }
                    return names;
                }

                @Override
                public List<String> visitSingleProperty(SingleUnionTypeProperty singleProperty) {
                    return Collections.singletonList(NameUtils.getWireValue(singleProperty.getName()));
                }

                @Override
                public List<String> visitNoProperties() {
                    return Collections.emptyList();
                }

                @Override
                public List<String> _visitUnknown(Object unknownType) {
                    return Collections.emptyList();
                }
            });
            List<String> names = new ArrayList<>(propertyNames == null ? Collections.emptyList() : propertyNames);
            names.remove(discriminatorProperty);
            if (names.contains("data") && SSE_ENVELOPE_FIELDS.containsAll(names)) {
                envelopeEvents.add(NameUtils.getWireValue(variant.getDiscriminantValue()));
            } else if (!names.isEmpty()) {
                hasPayloadVariant = true;
            }
        }
        return hasPayloadVariant ? envelopeEvents : null;
    }

    private static Optional<UnionTypeDeclaration> resolveUnionType(
            TypeReference typeReference, Map<TypeId, TypeDeclaration> typeDeclarations) {

        return typeReference.visit(new TypeReference.Visitor<Optional<UnionTypeDeclaration>>() {
            @Override
            public Optional<UnionTypeDeclaration> visitContainer(com.fern.ir.model.types.ContainerType container) {
                // Handle optional/nullable containers by unwrapping
                if (container.getOptional().isPresent()) {
                    return resolveUnionType(container.getOptional().get(), typeDeclarations);
                }
                if (container.getNullable().isPresent()) {
                    return resolveUnionType(container.getNullable().get(), typeDeclarations);
                }
                return Optional.empty();
            }

            @Override
            public Optional<UnionTypeDeclaration> visitNamed(NamedType named) {
                TypeDeclaration typeDeclaration = typeDeclarations.get(named.getTypeId());
                if (typeDeclaration == null) {
                    return Optional.empty();
                }

                return typeDeclaration.getShape().visit(new Type.Visitor<Optional<UnionTypeDeclaration>>() {
                    @Override
                    public Optional<UnionTypeDeclaration> visitAlias(
                            com.fern.ir.model.types.AliasTypeDeclaration alias) {
                        // Follow alias to underlying type
                        return resolveUnionType(alias.getAliasOf(), typeDeclarations);
                    }

                    @Override
                    public Optional<UnionTypeDeclaration> visitEnum(com.fern.ir.model.types.EnumTypeDeclaration enum_) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<UnionTypeDeclaration> visitObject(
                            com.fern.ir.model.types.ObjectTypeDeclaration object) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<UnionTypeDeclaration> visitUnion(UnionTypeDeclaration union) {
                        return Optional.of(union);
                    }

                    @Override
                    public Optional<UnionTypeDeclaration> visitUndiscriminatedUnion(
                            com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
                        // Undiscriminated unions don't have a discriminator
                        return Optional.empty();
                    }

                    @Override
                    public Optional<UnionTypeDeclaration> _visitUnknown(Object unknownType) {
                        return Optional.empty();
                    }
                });
            }

            @Override
            public Optional<UnionTypeDeclaration> visitPrimitive(com.fern.ir.model.types.PrimitiveType primitive) {
                return Optional.empty();
            }

            @Override
            public Optional<UnionTypeDeclaration> visitUnknown() {
                return Optional.empty();
            }

            @Override
            public Optional<UnionTypeDeclaration> _visitUnknown(Object unknownType) {
                return Optional.empty();
            }
        });
    }
}
