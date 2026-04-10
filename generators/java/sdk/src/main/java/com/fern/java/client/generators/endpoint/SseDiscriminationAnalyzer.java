package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.UnionTypeDeclaration;
import com.fern.java.utils.NameUtils;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Analyzes SSE payload types to determine if event-level or data-level discrimination is needed.
 *
 * <p>Following Python's approach from PR #11726: - If the union's discriminator property name matches an SSE envelope
 * field (event, id, retry, data), it's event-level discrimination. - Otherwise, it's data-level discrimination where
 * the discriminator is inside the JSON data payload.
 */
public final class SseDiscriminationAnalyzer {

    /** SSE envelope fields that indicate event-level discrimination when used as a discriminator. */
    private static final Set<String> SSE_ENVELOPE_FIELDS = new HashSet<>(Arrays.asList("event", "id", "retry", "data"));

    /** Type of discrimination for SSE events. */
    public enum DiscriminationType {
        /** Not a discriminated union - no special handling needed */
        NONE,
        /** Discriminator is inside the JSON data payload - Jackson handles automatically */
        DATA_LEVEL,
        /** Discriminator is at SSE envelope level - requires custom handling */
        EVENT_LEVEL
    }

    /** Result of SSE discrimination analysis. */
    public static final class SseDiscriminationInfo {
        private final DiscriminationType type;
        private final String discriminatorProperty;

        private SseDiscriminationInfo(DiscriminationType type, String discriminatorProperty) {
            this.type = type;
            this.discriminatorProperty = discriminatorProperty;
        }

        public DiscriminationType getType() {
            return type;
        }

        public Optional<String> getDiscriminatorProperty() {
            return Optional.ofNullable(discriminatorProperty);
        }

        public static SseDiscriminationInfo none() {
            return new SseDiscriminationInfo(DiscriminationType.NONE, null);
        }

        public static SseDiscriminationInfo dataLevel(String discriminatorProperty) {
            return new SseDiscriminationInfo(DiscriminationType.DATA_LEVEL, discriminatorProperty);
        }

        public static SseDiscriminationInfo eventLevel(String discriminatorProperty) {
            return new SseDiscriminationInfo(DiscriminationType.EVENT_LEVEL, discriminatorProperty);
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

        // Check if the discriminator is an SSE envelope field
        if (isEventLevelDiscriminator(discriminatorProperty)) {
            return SseDiscriminationInfo.eventLevel(discriminatorProperty);
        } else {
            return SseDiscriminationInfo.dataLevel(discriminatorProperty);
        }
    }

    /** Checks if the discriminator property indicates event-level discrimination. */
    public static boolean isEventLevelDiscriminator(String discriminatorProperty) {
        return SSE_ENVELOPE_FIELDS.contains(discriminatorProperty);
    }

    /** Resolves a TypeReference to its UnionTypeDeclaration, following aliases if necessary. */
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
