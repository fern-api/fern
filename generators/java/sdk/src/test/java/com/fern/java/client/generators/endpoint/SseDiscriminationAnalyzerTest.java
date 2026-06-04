package com.fern.java.client.generators.endpoint;

import static org.assertj.core.api.Assertions.assertThat;

import com.fern.ir.model.commons.FernFilepath;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.NameAndWireValueOrString;
import com.fern.ir.model.commons.NameOrString;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.AliasTypeDeclaration;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.ResolvedTypeReference;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.UnionDiscriminatorContext;
import com.fern.ir.model.types.UnionTypeDeclaration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for {@link SseDiscriminationAnalyzer}.
 *
 * <p>These tests pin the correct behavior: the analyzer must derive the SSE discrimination level from the IR's
 * {@code discriminatorContext} on the union declaration, NOT from a hardcoded name heuristic.
 *
 * <ul>
 *   <li>{@code discriminatorContext == PROTOCOL} -> protocol-level (envelope dispatch)
 *   <li>{@code discriminatorContext == DATA} or absent -> data-level (Jackson handles the payload)
 *   <li>non-union payload -> none
 * </ul>
 */
class SseDiscriminationAnalyzerTest {

    private static final TypeId UNION_TYPE_ID = TypeId.of("union-type-id");
    private static final TypeId OBJECT_TYPE_ID = TypeId.of("object-type-id");
    private static final TypeId ALIAS_TYPE_ID = TypeId.of("alias-type-id");

    @Test
    void protocolContext_isProtocolLevel() {
        Map<TypeId, TypeDeclaration> declarations = new HashMap<>();
        declarations.put(UNION_TYPE_ID, unionDeclaration("event", Optional.of(UnionDiscriminatorContext.PROTOCOL)));

        SseDiscriminationAnalyzer.SseDiscriminationInfo info =
                SseDiscriminationAnalyzer.analyze(namedReference(UNION_TYPE_ID), declarations);

        assertThat(info.getType()).isEqualTo(SseDiscriminationAnalyzer.DiscriminationType.PROTOCOL_LEVEL);
        assertThat(info.getDiscriminatorProperty()).contains("event");
    }

    @Test
    void dataContext_isDataLevel() {
        Map<TypeId, TypeDeclaration> declarations = new HashMap<>();
        declarations.put(UNION_TYPE_ID, unionDeclaration("event", Optional.of(UnionDiscriminatorContext.DATA)));

        SseDiscriminationAnalyzer.SseDiscriminationInfo info =
                SseDiscriminationAnalyzer.analyze(namedReference(UNION_TYPE_ID), declarations);

        assertThat(info.getType()).isEqualTo(SseDiscriminationAnalyzer.DiscriminationType.DATA_LEVEL);
        assertThat(info.getDiscriminatorProperty()).contains("event");
    }

    @Test
    void noContextWithEnvelopeNamedDiscriminator_isDataLevel() {
        // Customer-reported case: discriminator wire value is "event" but there is no protocol context.
        // The hardcoded SSE_ENVELOPE_FIELDS heuristic wrongly classifies this as protocol/event level.
        Map<TypeId, TypeDeclaration> declarations = new HashMap<>();
        declarations.put(UNION_TYPE_ID, unionDeclaration("event", Optional.empty()));

        SseDiscriminationAnalyzer.SseDiscriminationInfo info =
                SseDiscriminationAnalyzer.analyze(namedReference(UNION_TYPE_ID), declarations);

        assertThat(info.getType()).isEqualTo(SseDiscriminationAnalyzer.DiscriminationType.DATA_LEVEL);
    }

    @Test
    void noContextWithOrdinaryDiscriminator_isDataLevel() {
        Map<TypeId, TypeDeclaration> declarations = new HashMap<>();
        declarations.put(UNION_TYPE_ID, unionDeclaration("type", Optional.empty()));

        SseDiscriminationAnalyzer.SseDiscriminationInfo info =
                SseDiscriminationAnalyzer.analyze(namedReference(UNION_TYPE_ID), declarations);

        assertThat(info.getType()).isEqualTo(SseDiscriminationAnalyzer.DiscriminationType.DATA_LEVEL);
    }

    @Test
    void nonUnionPayload_isNone() {
        Map<TypeId, TypeDeclaration> declarations = new HashMap<>();
        declarations.put(OBJECT_TYPE_ID, objectDeclaration());

        SseDiscriminationAnalyzer.SseDiscriminationInfo info =
                SseDiscriminationAnalyzer.analyze(namedReference(OBJECT_TYPE_ID), declarations);

        assertThat(info.getType()).isEqualTo(SseDiscriminationAnalyzer.DiscriminationType.NONE);
    }

    @Test
    void optionalUnion_isUnwrappedAndAnalyzed() {
        Map<TypeId, TypeDeclaration> declarations = new HashMap<>();
        declarations.put(UNION_TYPE_ID, unionDeclaration("event", Optional.of(UnionDiscriminatorContext.PROTOCOL)));

        TypeReference optionalUnion = TypeReference.container(ContainerType.optional(namedReference(UNION_TYPE_ID)));

        SseDiscriminationAnalyzer.SseDiscriminationInfo info =
                SseDiscriminationAnalyzer.analyze(optionalUnion, declarations);

        assertThat(info.getType()).isEqualTo(SseDiscriminationAnalyzer.DiscriminationType.PROTOCOL_LEVEL);
    }

    @Test
    void aliasToUnion_isUnwrappedAndAnalyzed() {
        Map<TypeId, TypeDeclaration> declarations = new HashMap<>();
        declarations.put(UNION_TYPE_ID, unionDeclaration("event", Optional.of(UnionDiscriminatorContext.PROTOCOL)));
        declarations.put(
                ALIAS_TYPE_ID,
                typeDeclaration(
                        ALIAS_TYPE_ID,
                        Type.alias(AliasTypeDeclaration.builder()
                                .aliasOf(namedReference(UNION_TYPE_ID))
                                .resolvedType(ResolvedTypeReference.unknown())
                                .build())));

        SseDiscriminationAnalyzer.SseDiscriminationInfo info =
                SseDiscriminationAnalyzer.analyze(namedReference(ALIAS_TYPE_ID), declarations);

        assertThat(info.getType()).isEqualTo(SseDiscriminationAnalyzer.DiscriminationType.PROTOCOL_LEVEL);
    }

    // ---- IR construction helpers ----

    private static TypeReference namedReference(TypeId typeId) {
        return TypeReference.named(NamedType.builder()
                .typeId(typeId)
                .fernFilepath(fernFilepath())
                .name(NameOrString.of(name(typeId.get())))
                .build());
    }

    private static TypeDeclaration unionDeclaration(
            String discriminatorWireValue, Optional<UnionDiscriminatorContext> context) {
        UnionTypeDeclaration union = UnionTypeDeclaration.builder()
                .discriminant(discriminant(discriminatorWireValue))
                .discriminatorContext(context)
                .build();
        return typeDeclaration(UNION_TYPE_ID, Type.union(union));
    }

    private static TypeDeclaration objectDeclaration() {
        return typeDeclaration(
                OBJECT_TYPE_ID,
                Type.object(
                        ObjectTypeDeclaration.builder().extraProperties(false).build()));
    }

    private static TypeDeclaration typeDeclaration(TypeId typeId, Type shape) {
        return TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .typeId(typeId)
                        .fernFilepath(fernFilepath())
                        .name(NameOrString.of(name(typeId.get())))
                        .build())
                .shape(shape)
                .build();
    }

    private static NameAndWireValueOrString discriminant(String wireValue) {
        return NameAndWireValueOrString.of(NameAndWireValue.builder()
                .wireValue(wireValue)
                .name(NameOrString.of(name(wireValue)))
                .build());
    }

    private static FernFilepath fernFilepath() {
        return FernFilepath.builder().build();
    }

    private static Name name(String value) {
        return Name.builder()
                .originalName(value)
                .camelCase(safeAndUnsafe(value))
                .pascalCase(safeAndUnsafe(value))
                .snakeCase(safeAndUnsafe(value))
                .screamingSnakeCase(safeAndUnsafe(value))
                .build();
    }

    private static SafeAndUnsafeString safeAndUnsafe(String value) {
        return SafeAndUnsafeString.builder().unsafeName(value).safeName(value).build();
    }
}
