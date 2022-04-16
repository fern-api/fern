package com.fern.model.codegen.utils;

import com.fern.ContainerType;
import com.fern.MapType;
import com.fern.NamedType;
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

    private final ClassNameUtils classNameUtils;
    private final TypeReferenceToTypeNameConverter primitiveAllowedTypeReferenceConverter =
            new TypeReferenceToTypeNameConverter(true);

    public TypeReferenceUtils(ClassNameUtils classNameUtils) {
        this.classNameUtils = classNameUtils;
    }

    public TypeName convertToTypeName(boolean primitiveAllowed, TypeReference typeReference) {
        return typeReference.accept(new TypeReferenceToTypeNameConverter(primitiveAllowed));
    }

    private final class TypeReferenceToTypeNameConverter implements TypeReference.Visitor<TypeName> {

        private final boolean primitiveAllowed;
        private final ContainerToTypeNameConverter containerToTypeNameConverter = new ContainerToTypeNameConverter();

        private TypeReferenceToTypeNameConverter(boolean primitiveAllowed) {
            this.primitiveAllowed = primitiveAllowed;
        }

        @Override
        public TypeName visitNamed(NamedType namedType) {
            return classNameUtils.getClassName(namedType);
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
            return containerType.accept(containerToTypeNameConverter);
        }

        @Override
        public TypeName visitVoid() {
            throw new RuntimeException("Void types should be handled separately!");
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

    private final class ContainerToTypeNameConverter implements ContainerType.Visitor<TypeName> {

        @Override
        public TypeName visitMap(MapType mapType) {
            return ParameterizedTypeName.get(
                    ClassName.get(Map.class),
                    mapType.keyType().accept(primitiveAllowedTypeReferenceConverter),
                    mapType.valueType().accept(primitiveAllowedTypeReferenceConverter));
        }

        @Override
        public TypeName visitList(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(List.class), typeReference.accept(primitiveAllowedTypeReferenceConverter));
        }

        @Override
        public TypeName visitSet(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(Set.class), typeReference.accept(primitiveAllowedTypeReferenceConverter));
        }

        @Override
        public TypeName visitOptional(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(Optional.class), typeReference.accept(primitiveAllowedTypeReferenceConverter));
        }

        @Override
        public TypeName visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown container type: " + unknownType);
        }
    }
}
