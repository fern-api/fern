package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.UnionTypeDeclaration;
import java.util.Map;
import java.util.Optional;

/**
 * Analyzes SSE payload types to determine if event-level or data-level discrimination is needed.
 *
 * <p>Uses the IR's discriminatorContext field on UnionTypeDeclaration to determine discrimination type: - "protocol":
 * discriminator is at the SSE envelope level (event-level discrimination) - "data" (or absent): discriminator is inside
 * the JSON data payload (data-level discrimination)
 */
public final class SseDiscriminationAnalyzer {

    private static final String DISCRIMINATOR_CONTEXT_PROTOCOL = "protocol";

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

    private SseDiscriminationAnalyzer() {}

    /**
     * Analyzes the SSE payload type to determine what type of discrimination is needed, using the IR's
     * discriminatorContext field.
     *
     * @param payloadType The SSE payload type reference from the IR
     * @param typeDeclarations Map of all type declarations
     * @param discriminatorContexts Map of TypeId to discriminatorContext values extracted from the IR JSON
     * @return The discrimination info indicating how to handle SSE parsing
     */
    public static SseDiscriminationInfo analyze(
            TypeReference payloadType,
            Map<TypeId, TypeDeclaration> typeDeclarations,
            Map<TypeId, String> discriminatorContexts) {

        Optional<UnionResolutionResult> result = resolveUnionType(payloadType, typeDeclarations);

        if (result.isEmpty()) {
            return SseDiscriminationInfo.none();
        }

        UnionResolutionResult unionResult = result.get();
        String discriminatorProperty = unionResult.union.getDiscriminant().getWireValue();

        String context = discriminatorContexts.getOrDefault(unionResult.typeId, "data");
        if (DISCRIMINATOR_CONTEXT_PROTOCOL.equals(context)) {
            return SseDiscriminationInfo.eventLevel(discriminatorProperty);
        } else {
            return SseDiscriminationInfo.dataLevel(discriminatorProperty);
        }
    }

    private static final class UnionResolutionResult {
        final TypeId typeId;
        final UnionTypeDeclaration union;

        UnionResolutionResult(TypeId typeId, UnionTypeDeclaration union) {
            this.typeId = typeId;
            this.union = union;
        }
    }

    /** Resolves a TypeReference to its UnionTypeDeclaration and TypeId, following aliases if necessary. */
    private static Optional<UnionResolutionResult> resolveUnionType(
            TypeReference typeReference, Map<TypeId, TypeDeclaration> typeDeclarations) {

        return typeReference.visit(new TypeReference.Visitor<Optional<UnionResolutionResult>>() {
            @Override
            public Optional<UnionResolutionResult> visitContainer(com.fern.ir.model.types.ContainerType container) {
                if (container.getOptional().isPresent()) {
                    return resolveUnionType(container.getOptional().get(), typeDeclarations);
                }
                if (container.getNullable().isPresent()) {
                    return resolveUnionType(container.getNullable().get(), typeDeclarations);
                }
                return Optional.empty();
            }

            @Override
            public Optional<UnionResolutionResult> visitNamed(NamedType named) {
                TypeDeclaration typeDeclaration = typeDeclarations.get(named.getTypeId());
                if (typeDeclaration == null) {
                    return Optional.empty();
                }

                return typeDeclaration.getShape().visit(new Type.Visitor<Optional<UnionResolutionResult>>() {
                    @Override
                    public Optional<UnionResolutionResult> visitAlias(
                            com.fern.ir.model.types.AliasTypeDeclaration alias) {
                        return resolveUnionType(alias.getAliasOf(), typeDeclarations);
                    }

                    @Override
                    public Optional<UnionResolutionResult> visitEnum(
                            com.fern.ir.model.types.EnumTypeDeclaration enum_) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<UnionResolutionResult> visitObject(
                            com.fern.ir.model.types.ObjectTypeDeclaration object) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<UnionResolutionResult> visitUnion(UnionTypeDeclaration union) {
                        return Optional.of(new UnionResolutionResult(named.getTypeId(), union));
                    }

                    @Override
                    public Optional<UnionResolutionResult> visitUndiscriminatedUnion(
                            com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
                        return Optional.empty();
                    }

                    @Override
                    public Optional<UnionResolutionResult> _visitUnknown(Object unknownType) {
                        return Optional.empty();
                    }
                });
            }

            @Override
            public Optional<UnionResolutionResult> visitPrimitive(com.fern.ir.model.types.PrimitiveType primitive) {
                return Optional.empty();
            }

            @Override
            public Optional<UnionResolutionResult> visitUnknown() {
                return Optional.empty();
            }

            @Override
            public Optional<UnionResolutionResult> _visitUnknown(Object unknownType) {
                return Optional.empty();
            }
        });
    }
}
