package com.fern.model.codegen.utils;

import com.fern.ContainerType;
import com.fern.MapType;
import com.fern.NamedTypeReference;
import com.fern.PrimitiveType;
import com.fern.TypeReference;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public final class TypeReferenceUtils {

    private TypeReferenceUtils() {}

    public static TypeName convertToTypeName(boolean primitiveAllowed, TypeReference typeReference) {
        if (primitiveAllowed) {
            return typeReference.accept(TypeReferenceToTypeNameConverter.PRIMITIVE_ALLOWED_CONVERTER);
        }
        return typeReference.accept(TypeReferenceToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER);
    }

    private static final class TypeReferenceToTypeNameConverter implements TypeReference.Visitor<TypeName> {

        private static final TypeReferenceToTypeNameConverter PRIMITIVE_ALLOWED_CONVERTER =
                new TypeReferenceToTypeNameConverter(false);
        private static final TypeReferenceToTypeNameConverter PRIMITIVE_DISALLOWED_CONVERTER =
                new TypeReferenceToTypeNameConverter(true);

        private final boolean primitiveAllowed;

        private TypeReferenceToTypeNameConverter(boolean primitiveAllowed) {
            this.primitiveAllowed = primitiveAllowed;
        }

        @Override
        public TypeName visitNamed(NamedTypeReference namedTypeReference) {
            return ClassNameUtils.getClassName(namedTypeReference);
        }

        @Override
        public TypeName visitPrimitive(PrimitiveType primitiveType) {
            if (primitiveAllowed) {
                return primitiveType.accept(PrimitiveToTypeNameConverter.PRIMITIVE_ALLOWED_CONVERTER);
            }
            return primitiveType.accept(PrimitiveToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER);
        }

        @Override
        public TypeName visitContainer(ContainerType containerType) {
            return containerType.accept(ContainerToTypeNameConverter.INSTANCE);
        }

        @Override
        public TypeName visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown type reference: " + unknownType);
        }
    }

    private static final class PrimitiveToTypeNameConverter implements PrimitiveType.Visitor<TypeName> {

        private static final PrimitiveToTypeNameConverter PRIMITIVE_ALLOWED_CONVERTER =
                new PrimitiveToTypeNameConverter(false);
        private static final PrimitiveToTypeNameConverter PRIMITIVE_DISALLOWED_CONVERTER =
                new PrimitiveToTypeNameConverter(true);

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

    private static final class ContainerToTypeNameConverter implements ContainerType.Visitor<TypeName> {

        private static final ContainerToTypeNameConverter INSTANCE = new ContainerToTypeNameConverter();

        @Override
        public TypeName visitMap(MapType mapType) {
            return ParameterizedTypeName.get(
                    ClassName.get(Map.class),
                    mapType.keyType().accept(TypeReferenceToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER),
                    mapType.valueType().accept(TypeReferenceToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER));
        }

        @Override
        public TypeName visitList(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(List.class),
                    typeReference.accept(TypeReferenceToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER));
        }

        @Override
        public TypeName visitSet(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(Set.class),
                    typeReference.accept(TypeReferenceToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER));
        }

        @Override
        public TypeName visitOptional(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(Optional.class),
                    typeReference.accept(TypeReferenceToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER));
        }

        @Override
        public TypeName visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown container type: " + unknownType);
        }
    }
}
