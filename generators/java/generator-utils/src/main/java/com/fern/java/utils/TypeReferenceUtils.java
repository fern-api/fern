package com.fern.java.utils;

import com.fern.irV42.model.types.ContainerType;
import com.fern.irV42.model.types.DeclaredTypeName;
import com.fern.irV42.model.types.Literal;
import com.fern.irV42.model.types.MapType;
import com.fern.irV42.model.types.PrimitiveType;
import com.fern.irV42.model.types.TypeReference;
import java.util.Optional;

public class TypeReferenceUtils {

    public static Optional<ContainerTypeEnum> toContainerType(TypeReference typeReference) {
        return typeReference.getContainer().map(containerType -> containerType.visit(new ToContainerTypeEnum()));
    }

    public static class ToContainerTypeEnum implements ContainerType.Visitor<ContainerTypeEnum> {

        @Override
        public ContainerTypeEnum visitList(TypeReference list) {
            return ContainerTypeEnum.LIST;
        }

        @Override
        public ContainerTypeEnum visitMap(MapType map) {
            return ContainerTypeEnum.MAP;
        }

        @Override
        public ContainerTypeEnum visitOptional(TypeReference optional) {
            return ContainerTypeEnum.OPTIONAL;
        }

        @Override
        public ContainerTypeEnum visitSet(TypeReference set) {
            return ContainerTypeEnum.SET;
        }

        @Override
        public ContainerTypeEnum visitLiteral(Literal literal) {
            return ContainerTypeEnum.LITERAL;
        }

        @Override
        public ContainerTypeEnum _visitUnknown(Object unknownType) {
            throw new RuntimeException("Unknown ContainerType " + unknownType);
        }
    }

    public static class TypeReferenceToName implements TypeReference.Visitor<String> {

        private static final ContainerTypeToName CONTAINER_TYPE_TO_NAME = new ContainerTypeToName();
        private static final PrimitiveTypeToName PRIMITIVE_TYPE_TO_NAME = new PrimitiveTypeToName();

        @Override
        public String visitContainer(ContainerType container) {
            return container.visit(CONTAINER_TYPE_TO_NAME);
        }

        @Override
        public String visitNamed(DeclaredTypeName named) {
            return named.getName().getPascalCase().getUnsafeName();
        }

        @Override
        public String visitPrimitive(PrimitiveType primitive) {
            return primitive.visit(PRIMITIVE_TYPE_TO_NAME);
        }

        @Override
        public String visitUnknown() {
            return "Unknown";
        }

        @Override
        public String _visitUnknown(Object unknownType) {
            throw new RuntimeException("Unknown type reference type " + unknownType);
        }
    }

    public static class ContainerTypeToName implements ContainerType.Visitor<String> {

        private static final TypeReferenceToName TYPE_REFERENCE_TO_NAME = new TypeReferenceToName();

        @Override
        public String visitList(TypeReference list) {
            return "ListOf" + list.visit(TYPE_REFERENCE_TO_NAME) + "s";
        }

        @Override
        public String visitMap(MapType map) {
            return "MapOf" + map.getKeyType().visit(TYPE_REFERENCE_TO_NAME) + "To"
                    + map.getValueType().visit(TYPE_REFERENCE_TO_NAME);
        }

        @Override
        public String visitOptional(TypeReference optional) {
            return "Optional" + optional.visit(TYPE_REFERENCE_TO_NAME);
        }

        @Override
        public String visitSet(TypeReference set) {
            return "SetOf" + set.visit(TYPE_REFERENCE_TO_NAME) + "s";
        }

        @Override
        public String visitLiteral(Literal literal) {
            throw new RuntimeException(
                    "Unexpected attempt to get name of type literal: " + literal); // todo: finalize this
        }

        @Override
        public String _visitUnknown(Object unknownType) {
            throw new RuntimeException("Unknown ContainerType " + unknownType);
        }
    }

    public static class PrimitiveTypeToName implements PrimitiveType.Visitor<String> {

        @Override
        public String visitInteger() {
            return "Integer";
        }

        @Override
        public String visitDouble() {
            return "Double";
        }

        @Override
        public String visitString() {
            return "String";
        }

        @Override
        public String visitBoolean() {
            return "Boolean";
        }

        @Override
        public String visitLong() {
            return "Long";
        }

        @Override
        public String visitDateTime() {
            return "DateTime";
        }

        @Override
        public String visitDate() {
            return "Date";
        }

        @Override
        public String visitUuid() {
            return "Uuid";
        }

        @Override
        public String visitBase64() {
            return "Base64";
        }

        @Override
        public String visitUnknown(String unknownType) {
            throw new RuntimeException("Unknown primitive type " + unknownType);
        }
    }

    public enum ContainerTypeEnum {
        LIST,
        MAP,
        OPTIONAL,
        SET,
        LITERAL
    }
}
