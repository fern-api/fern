package com.fern.model.codegen;

import com.fern.ContainerType;
import com.fern.MapType;
import com.fern.NamedTypeReference;
import com.fern.PrimitiveType;
import com.fern.TypeReference;
import com.fern.model.codegen.utils.ClassNameUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public final class TypeReferenceToTypeNameConverter implements TypeReference.Visitor<TypeName> {

    public static final TypeReferenceToTypeNameConverter INSTANCE = new TypeReferenceToTypeNameConverter(false);
    public static final TypeReferenceToTypeNameConverter NESTED_INSTANCE = new TypeReferenceToTypeNameConverter(true);

    private final boolean isNested;

    private TypeReferenceToTypeNameConverter(boolean isNested) {
        this.isNested = isNested;
    }

    @Override
    public TypeName visitNamed(NamedTypeReference namedTypeReference) {
        return ClassNameUtils.getClassName(namedTypeReference);
    }

    @Override
    public TypeName visitPrimitive(PrimitiveType primitiveType) {
        return primitiveType.accept(new PrimitiveToTypeNameConverter());
    }

    @Override
    public TypeName visitContainer(ContainerType containerType) {
        return containerType.accept(ContainerToTypeNameConverter.INSTANCE);
    }

    @Override
    public TypeName visitUnknown(String unknownType) {
        throw new RuntimeException("Encountered unknown type reference: " + unknownType);
    }

    private final class PrimitiveToTypeNameConverter implements PrimitiveType.Visitor<TypeName> {

        @Override
        public TypeName visitInteger() {
            if (isNested) {
                return ClassName.get(Integer.class);
            }
            return TypeName.INT;
        }

        @Override
        public TypeName visitDouble() {
            if (isNested) {
                return ClassName.get(Double.class);
            }
            return TypeName.DOUBLE;
        }

        @Override
        public TypeName visitLong() {
            if (isNested) {
                return ClassName.get(Long.class);
            }
            return TypeName.LONG;
        }

        @Override
        public TypeName visitString() {
            return ClassName.get(String.class);
        }

        @Override
        public TypeName visitBoolean() {
            if (isNested) {
                return ClassName.get(Boolean.class);
            }
            return TypeName.BOOLEAN;
        }

        @Override
        public TypeName visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown primitive type: " + unknownType);
        }
    }

    private static final class ContainerToTypeNameConverter implements ContainerType.Visitor<TypeName> {

        private static final ContainerToTypeNameConverter INSTANCE = new ContainerToTypeNameConverter();

        @Override
        public TypeName visitMap(MapType mapType) {
            return ParameterizedTypeName.get(
                    ClassName.get(Map.class),
                    mapType.keyType().accept(NESTED_INSTANCE),
                    mapType.valueType().accept(NESTED_INSTANCE));
        }

        @Override
        public TypeName visitList(TypeReference typeReference) {
            return ParameterizedTypeName.get(ClassName.get(List.class), typeReference.accept(NESTED_INSTANCE));
        }

        @Override
        public TypeName visitSet(TypeReference typeReference) {
            return ParameterizedTypeName.get(ClassName.get(Set.class), typeReference.accept(NESTED_INSTANCE));
        }

        @Override
        public TypeName visitOptional(TypeReference typeReference) {
            return ParameterizedTypeName.get(ClassName.get(Optional.class), typeReference.accept(NESTED_INSTANCE));
        }

        @Override
        public TypeName visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown container type: " + unknownType);
        }
    }
}
