package com.fern.java.utils;

import com.fern.ir.model.types.*;
import com.fern.java.AbstractGeneratorContext;
import java.util.Optional;

public class TypeReferenceUtils {

    public static class IsCollectionType implements TypeReference.Visitor<Boolean>, ContainerType.Visitor<Boolean> {

        private final AbstractGeneratorContext<?, ?> context;

        public IsCollectionType(AbstractGeneratorContext<?, ?> context) {
            this.context = context;
        }

        @Override
        public Boolean visitContainer(ContainerType containerType) {
            return containerType.visit(this);
        }

        @Override
        public Boolean visitNamed(NamedType namedType) {
            TypeDeclaration declaration = context.getTypeDeclaration(namedType.getTypeId());
            if (declaration.getShape().isAlias()) {
                ResolvedTypeReference resolved =
                        declaration.getShape().getAlias().get().getResolvedType();
                return resolved.isContainer() && resolved.getContainer().get().visit(this);
            }
            return false;
        }

        @Override
        public Boolean visitPrimitive(PrimitiveType primitiveType) {
            return false;
        }

        @Override
        public Boolean visitUnknown() {
            return false;
        }

        @Override
        public Boolean visitList(TypeReference typeReference) {
            return true;
        }

        @Override
        public Boolean visitMap(MapType mapType) {
            return true;
        }

        @Override
        public Boolean visitNullable(TypeReference typeReference) {
            return typeReference.visit(this);
        }

        @Override
        public Boolean visitOptional(TypeReference typeReference) {
            return typeReference.visit(this);
        }

        @Override
        public Boolean visitSet(TypeReference typeReference) {
            return true;
        }

        @Override
        public Boolean visitLiteral(Literal literal) {
            return false;
        }

        @Override
        public Boolean _visitUnknown(Object o) {
            return false;
        }
    }

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
        public ContainerTypeEnum visitNullable(TypeReference typeReference) {
            return ContainerTypeEnum.NULLABLE;
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

        @Override
        public String visitContainer(ContainerType container) {
            return container.visit(new ContainerTypeToName());
        }

        @Override
        public String visitNamed(NamedType named) {
            return named.getName().getPascalCase().getUnsafeName();
        }

        @Override
        public String visitPrimitive(PrimitiveType primitive) {
            return primitive.getV1().visit(new PrimitiveTypeToName());
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

    public static class ContainerTypeToUnderlyingType implements ContainerType.Visitor<TypeReference> {

        @Override
        public TypeReference visitList(TypeReference list) {
            return list;
        }

        @Override
        public TypeReference visitMap(MapType map) {
            throw new RuntimeException("Unexpected non collection type of literal");
        }

        @Override
        public TypeReference visitNullable(TypeReference nullable) {
            return nullable;
        }

        @Override
        public TypeReference visitOptional(TypeReference optional) {
            return optional;
        }

        @Override
        public TypeReference visitSet(TypeReference set) {
            return set;
        }

        @Override
        public TypeReference visitLiteral(Literal literal) {
            throw new RuntimeException("Unexpected non collection type of literal");
        }

        @Override
        public TypeReference _visitUnknown(Object unknownType) {
            throw new RuntimeException("Unknown type reference type " + unknownType);
        }
    }

    public static class ContainerTypeToName implements ContainerType.Visitor<String> {

        @Override
        public String visitList(TypeReference list) {
            return "ListOf" + list.visit(new TypeReferenceToName());
        }

        @Override
        public String visitMap(MapType map) {
            return "MapOf" + map.getKeyType().visit(new TypeReferenceToName()) + "To"
                    + map.getValueType().visit(new TypeReferenceToName());
        }

        @Override
        public String visitNullable(TypeReference nullable) {
            return "Nullable" + nullable.visit(new TypeReferenceToName());
        }

        @Override
        public String visitOptional(TypeReference optional) {
            return "Optional" + optional.visit(new TypeReferenceToName());
        }

        @Override
        public String visitSet(TypeReference set) {
            return "SetOf" + set.visit(new TypeReferenceToName());
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

    public static class PrimitiveTypeToName implements PrimitiveTypeV1.Visitor<String> {

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
        public String visitUint() {
            return "Integer";
        }

        @Override
        public String visitUint64() {
            return "Long";
        }

        @Override
        public String visitFloat() {
            return "Float";
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
        public String visitBigInteger() {
            return "BigInteger";
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
        LITERAL,
        NULLABLE,
    }

    public static class TypeReferenceIsOptional implements com.fern.ir.model.types.TypeReference.Visitor<Boolean> {

        private final boolean visitNamedType;
        private final AbstractGeneratorContext<?, ?> clientGeneratorContext;

        public TypeReferenceIsOptional(boolean visitNamedType, AbstractGeneratorContext<?, ?> clientGeneratorContext) {
            this.visitNamedType = visitNamedType;
            this.clientGeneratorContext = clientGeneratorContext;
        }

        @Override
        public Boolean visitContainer(com.fern.ir.model.types.ContainerType container) {
            return container.isOptional();
        }

        @Override
        public Boolean visitNamed(NamedType named) {
            if (visitNamedType) {
                TypeDeclaration typeDeclaration =
                        clientGeneratorContext.getTypeDeclarations().get(named.getTypeId());
                return typeDeclaration.getShape().visit(new TypeDeclarationIsOptional(clientGeneratorContext));
            }
            return false;
        }

        @Override
        public Boolean visitPrimitive(PrimitiveType primitive) {
            return false;
        }

        @Override
        public Boolean visitUnknown() {
            return false;
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    public static class TypeDeclarationIsOptional implements Type.Visitor<Boolean> {

        private final AbstractGeneratorContext<?, ?> clientGeneratorContext;

        public TypeDeclarationIsOptional(AbstractGeneratorContext<?, ?> clientGeneratorContext) {
            this.clientGeneratorContext = clientGeneratorContext;
        }

        @Override
        public Boolean visitAlias(AliasTypeDeclaration alias) {
            return alias.getAliasOf().visit(new TypeReferenceIsOptional(true, clientGeneratorContext));
        }

        @Override
        public Boolean visitEnum(EnumTypeDeclaration _enum) {
            return false;
        }

        @Override
        public Boolean visitObject(ObjectTypeDeclaration object) {
            boolean allPropertiesOptional = object.getProperties().stream().allMatch(objectProperty -> objectProperty
                    .getValueType()
                    .visit(new TypeReferenceIsOptional(false, clientGeneratorContext)));
            boolean allExtendsAreOptional = object.getExtends().stream().allMatch(declaredTypeName -> {
                TypeDeclaration typeDeclaration =
                        clientGeneratorContext.getTypeDeclarations().get(declaredTypeName.getTypeId());
                return typeDeclaration.getShape().visit(new TypeDeclarationIsOptional(clientGeneratorContext));
            });
            return allPropertiesOptional && allExtendsAreOptional;
        }

        @Override
        public Boolean visitUnion(UnionTypeDeclaration union) {
            return false;
        }

        @Override
        public Boolean visitUndiscriminatedUnion(UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
            return false;
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    public static boolean isString(TypeReference typeReference) {
        return typeReference
                .getPrimitive()
                .map(primitive -> primitive.getV1())
                .map(v1 -> v1.visit(new PrimitiveTypeV1.Visitor<Boolean>() {

                    @Override
                    public Boolean visitInteger() {
                        return false;
                    }

                    @Override
                    public Boolean visitLong() {
                        return false;
                    }

                    @Override
                    public Boolean visitUint() {
                        return false;
                    }

                    @Override
                    public Boolean visitUint64() {
                        return false;
                    }

                    @Override
                    public Boolean visitFloat() {
                        return false;
                    }

                    @Override
                    public Boolean visitDouble() {
                        return false;
                    }

                    @Override
                    public Boolean visitBoolean() {
                        return false;
                    }

                    @Override
                    public Boolean visitString() {
                        return true;
                    }

                    @Override
                    public Boolean visitDate() {
                        return false;
                    }

                    @Override
                    public Boolean visitDateTime() {
                        return false;
                    }

                    @Override
                    public Boolean visitUuid() {
                        return false;
                    }

                    @Override
                    public Boolean visitBase64() {
                        return false;
                    }

                    @Override
                    public Boolean visitBigInteger() {
                        return false;
                    }

                    @Override
                    public Boolean visitUnknown(String s) {
                        return false;
                    }
                }))
                .orElse(false);
    }

    public static boolean isBoolean(TypeReference typeReference) {
        return typeReference
                .getPrimitive()
                .map(primitive -> primitive.getV1())
                .map(v1 -> v1.visit(new PrimitiveTypeV1.Visitor<Boolean>() {

                    @Override
                    public Boolean visitInteger() {
                        return false;
                    }

                    @Override
                    public Boolean visitLong() {
                        return false;
                    }

                    @Override
                    public Boolean visitUint() {
                        return false;
                    }

                    @Override
                    public Boolean visitUint64() {
                        return false;
                    }

                    @Override
                    public Boolean visitFloat() {
                        return false;
                    }

                    @Override
                    public Boolean visitDouble() {
                        return false;
                    }

                    @Override
                    public Boolean visitBoolean() {
                        return true;
                    }

                    @Override
                    public Boolean visitString() {
                        return false;
                    }

                    @Override
                    public Boolean visitDate() {
                        return false;
                    }

                    @Override
                    public Boolean visitDateTime() {
                        return false;
                    }

                    @Override
                    public Boolean visitUuid() {
                        return false;
                    }

                    @Override
                    public Boolean visitBase64() {
                        return false;
                    }

                    @Override
                    public Boolean visitBigInteger() {
                        return false;
                    }

                    @Override
                    public Boolean visitUnknown(String s) {
                        return false;
                    }
                }))
                .orElse(false);
    }
}
