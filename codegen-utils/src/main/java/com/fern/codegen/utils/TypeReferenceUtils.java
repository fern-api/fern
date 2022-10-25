/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.fern.codegen.utils;

import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.MapType;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.TypeReference;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

class TypeReferenceUtils {

    private final ClassNameUtils classNameUtils;
    private final TypeReferenceToTypeNameConverter primitiveDisAllowedTypeReferenceConverter =
            new TypeReferenceToTypeNameConverter(false);
    private final ContainerToTypeNameConverter containerToTypeNameConverter = new ContainerToTypeNameConverter();

    TypeReferenceUtils(ClassNameUtils classNameUtils) {
        this.classNameUtils = classNameUtils;
    }

    TypeName convertToTypeName(boolean primitiveAllowed, TypeReference typeReference) {
        return typeReference.visit(new TypeReferenceToTypeNameConverter(primitiveAllowed));
    }

    private final class TypeReferenceToTypeNameConverter implements TypeReference.Visitor<TypeName> {

        private final boolean primitiveAllowed;

        private TypeReferenceToTypeNameConverter(boolean primitiveAllowed) {
            this.primitiveAllowed = primitiveAllowed;
        }

        @Override
        public TypeName visitNamed(DeclaredTypeName declaredTypeName) {
            return classNameUtils.getClassNameFromDeclaredTypeName(declaredTypeName, PackageType.MODEL);
        }

        @Override
        public TypeName visitPrimitive(PrimitiveType primitiveType) {
            if (primitiveAllowed) {
                return primitiveType.visit(PrimitiveToTypeNameConverter.PRIMITIVE_ALLOWED_CONVERTER);
            }
            return primitiveType.visit(PrimitiveToTypeNameConverter.PRIMITIVE_DISALLOWED_CONVERTER);
        }

        @Override
        public TypeName visitContainer(ContainerType containerType) {
            return containerType.visit(containerToTypeNameConverter);
        }

        @Override
        public TypeName visitVoid() {
            throw new RuntimeException("Void types should be handled separately!");
        }

        @Override
        public TypeName visitUnknown() {
            return ParameterizedTypeName.get(Optional.class, Object.class);
        }

        @Override
        public TypeName _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown type reference: " + unknownType);
        }
    }

    private static final class PrimitiveToTypeNameConverter implements PrimitiveType.Visitor<TypeName> {

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
        public TypeName visitDateTime() {
            return ClassName.get(String.class);
        }

        @Override
        public TypeName visitUuid() {
            return ClassName.get(UUID.class);
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
        public TypeName visitOptional(TypeReference typeReference) {
            return ParameterizedTypeName.get(
                    ClassName.get(Optional.class), typeReference.visit(primitiveDisAllowedTypeReferenceConverter));
        }

        @Override
        public TypeName _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown container type: " + unknownType);
        }
    }
}
