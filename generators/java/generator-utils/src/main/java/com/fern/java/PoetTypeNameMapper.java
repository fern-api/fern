package com.fern.java;

import com.fasterxml.jackson.databind.JsonNode;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.*;
import com.squareup.javapoet.ArrayTypeName;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.math.BigInteger;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public final class PoetTypeNameMapper {

    private final AbstractPoetClassNameFactory poetClassNameFactory;
    private final TypeReferenceToTypeNameConverter primitiveDisAllowedTypeReferenceConverter =
            new TypeReferenceToTypeNameConverter(false);
    private final ContainerToTypeNameConverter containerToTypeNameConverter = new ContainerToTypeNameConverter();
    private final ICustomConfig customConfig;
    private final Map<TypeId, TypeDeclaration> typeDefinitionsByName;
    private final Map<DeclaredTypeName, ClassName> enclosingClasses;

    public PoetTypeNameMapper(
            AbstractPoetClassNameFactory poetClassNameFactory,
            ICustomConfig customConfig,
            Map<TypeId, TypeDeclaration> typeDefinitionsByName,
            Map<DeclaredTypeName, ClassName> enclosingClasses) {
        this.poetClassNameFactory = poetClassNameFactory;
        this.customConfig = customConfig;
        this.typeDefinitionsByName = typeDefinitionsByName;
        this.enclosingClasses = enclosingClasses;
    }

    public PoetTypeNameMapper(
            AbstractPoetClassNameFactory poetClassNameFactory,
            ICustomConfig customConfig,
            Map<TypeId, TypeDeclaration> typeDefinitionsByName) {
        this(poetClassNameFactory, customConfig, typeDefinitionsByName, Map.of());
    }

    public TypeName convertToTypeName(boolean primitiveAllowed, TypeReference typeReference) {
        return typeReference.visit(new TypeReferenceToTypeNameConverter(primitiveAllowed));
    }

    private final class TypeReferenceToTypeNameConverter
            implements TypeReference.Visitor<TypeName>, ResolvedTypeReference.Visitor<TypeName> {

        private final boolean primitiveAllowed;

        private TypeReferenceToTypeNameConverter(boolean primitiveAllowed) {
            this.primitiveAllowed = primitiveAllowed;
        }

        private ClassName applyEnclosing(DeclaredTypeName name, ClassName raw) {
            Optional<ClassName> enclosingClass = Optional.ofNullable(enclosingClasses.get(name));

            if (enclosingClass.isPresent() && !enclosingClass.get().equals(raw)) {
                return enclosingClass.get().nestedClass(raw.simpleName());
            }

            return raw;
        }

        @Override
        public TypeName visitNamed(NamedType named) {
            TypeDeclaration typeDeclaration = typeDefinitionsByName.get(named.getTypeId());
            if (!customConfig.wrappedAliases()) {
                boolean isAlias = typeDeclaration.getShape().isAlias();
                if (isAlias) {
                    AliasTypeDeclaration aliasTypeDeclaration =
                            typeDeclaration.getShape().getAlias().get();
                    return aliasTypeDeclaration.getResolvedType().visit(this);
                }
            }
            return applyEnclosing(
                    typeDeclaration.getName(),
                    poetClassNameFactory.getTypeClassName(DeclaredTypeName.builder()
                            .typeId(named.getTypeId())
                            .fernFilepath(named.getFernFilepath())
                            .name(typeDeclaration.getName().getName())
                            .build()));
        }

        @Override
        public TypeName visitNamed(ResolvedNamedType named) {
            return applyEnclosing(named.getName(), poetClassNameFactory.getTypeClassName(named.getName()));
        }

        @Override
        public TypeName visitPrimitive(PrimitiveType primitiveType) {
            if (primitiveAllowed) {
                return primitiveType.getV1().visit(PrimitiveToTypeNameConverter.PRIMITIVE_ALLOWED_CONVERTER);
            }
            return primitiveType.getV1().visit(PrimitiveToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER);
        }

        @Override
        public TypeName visitContainer(ContainerType containerType) {
            return containerType.visit(containerToTypeNameConverter);
        }

        @Override
        public TypeName visitUnknown() {
            if (customConfig.generateUnknownAsJsonNode()) {
                return ClassName.get(JsonNode.class);
            }
            return ClassName.get(Object.class);
        }

        @Override
        public TypeName _visitUnknown(Object unknown) {
            throw new RuntimeException("Encountered unknown type reference: " + unknown);
        }
    }

    private static final class PrimitiveToTypeNameConverter implements PrimitiveTypeV1.Visitor<TypeName> {

        private static final PrimitiveToTypeNameConverter PRIMITIVE_ALLOWED_CONVERTER =
                new PrimitiveToTypeNameConverter(true);
        private static final PrimitiveToTypeNameConverter PRIMITIVE_DISALLOWED_CONVERTER =
                new PrimitiveToTypeNameConverter(false);

        private final boolean primitiveAllowed;

        private PrimitiveToTypeNameConverter(boolean primitiveAllowed) {
            this.primitiveAllowed = primitiveAllowed;
        }

        @Override
        public TypeName visitInteger() {
            if (primitiveAllowed) {
                return TypeName.INT;
            }
            return ClassName.get(Integer.class);
        }

        @Override
        public TypeName visitDouble() {
            if (primitiveAllowed) {
                return TypeName.DOUBLE;
            }
            return ClassName.get(Double.class);
        }

        @Override
        public TypeName visitLong() {
            if (primitiveAllowed) {
                return TypeName.LONG;
            }
            return ClassName.get(Long.class);
        }

        @Override
        public TypeName visitUint() {
            if (primitiveAllowed) {
                return TypeName.LONG;
            }
            return ClassName.get(Long.class);
        }

        @Override
        public TypeName visitUint64() {
            if (primitiveAllowed) {
                return TypeName.LONG;
            }
            return ClassName.get(Long.class);
        }

        @Override
        public TypeName visitFloat() {
            if (primitiveAllowed) {
                return TypeName.FLOAT;
            }
            return ClassName.get(Float.class);
        }

        @Override
        public TypeName visitDateTime() {
            return ClassName.get(OffsetDateTime.class);
        }

        @Override
        public TypeName visitDate() {
            return ClassName.get(String.class);
        }

        @Override
        public TypeName visitUuid() {
            return ClassName.get(UUID.class);
        }

        @Override
        public TypeName visitBase64() {
            return ArrayTypeName.of(byte.class);
        }

        @Override
        public TypeName visitBigInteger() {
            return ClassName.get(BigInteger.class);
        }

        @Override
        public TypeName visitString() {
            return ClassName.get(String.class);
        }

        @Override
        public TypeName visitBoolean() {
            if (primitiveAllowed) {
                return TypeName.BOOLEAN;
            }
            return ClassName.get(Boolean.class);
        }

        @Override
        public TypeName visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown primitive type: " + unknownType);
        }
    }

    private final class ContainerToTypeNameConverter implements ContainerType.Visitor<TypeName> {

        @Override
        public TypeName visitMap(MapType mapType) {
            return ParameterizedTypeName.get(
                    ClassName.get(Map.class),
                    mapType.getKeyType().visit(primitiveDisAllowedTypeReferenceConverter),
                    mapType.getValueType().visit(primitiveDisAllowedTypeReferenceConverter));
        }

        @Override
        public TypeName visitList(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(List.class), typeReference.visit(primitiveDisAllowedTypeReferenceConverter));
        }

        @Override
        public TypeName visitSet(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(Set.class), typeReference.visit(primitiveDisAllowedTypeReferenceConverter));
        }

        @Override
        public TypeName visitLiteral(Literal literal) {
            return literal.visit(new Literal.Visitor<>() {
                @Override
                public TypeName visitString(String string) {
                    return ClassName.get(String.class);
                }

                @SuppressWarnings("checkstyle:ParameterName")
                @Override
                public TypeName visitBoolean(boolean boolean_) {
                    return ClassName.get(Boolean.class);
                }

                @Override
                public TypeName _visitUnknown(Object unknownType) {
                    throw new RuntimeException("Unsupported literal type: " + unknownType);
                }
            });
        }

        @Override
        public TypeName visitOptional(TypeReference typeReference) {
            TypeName typeName = typeReference.visit(primitiveDisAllowedTypeReferenceConverter);
            if (typeName instanceof ParameterizedTypeName) {
                // Optional should not be re-wrapped in Optional
                if (((ParameterizedTypeName) typeName).rawType.equals(ClassName.get(Optional.class))) {
                    return typeName;
                }
            }
            return ParameterizedTypeName.get(ClassName.get(Optional.class), typeName);
        }

        @Override
        public TypeName _visitUnknown(Object unknown) {
            throw new RuntimeException("Encountered unknown container type: " + unknown);
        }
    }
}
