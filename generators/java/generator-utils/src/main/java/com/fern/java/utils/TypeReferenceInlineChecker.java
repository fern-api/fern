package com.fern.java.utils;

import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.MapType;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import java.util.Optional;

public class TypeReferenceInlineChecker implements TypeReference.Visitor<Boolean>, ContainerType.Visitor<Boolean> {

    private final AbstractGeneratorContext<?, ?> generatorContext;

    public TypeReferenceInlineChecker(AbstractGeneratorContext<?, ?> generatorContext) {
        this.generatorContext = generatorContext;
    }

    // Handle main types

    @Override
    public Boolean visitContainer(ContainerType containerType) {
        return containerType.visit(this);
    }

    @Override
    public Boolean visitNamed(NamedType namedType) {
        // TODO(ajgateno): Tracking in FER-4050 that we can't just get inline from namedType.getInline()
        Optional<TypeDeclaration> existingTypeDeclaration =
                Optional.ofNullable(generatorContext.getTypeDeclarations().get(namedType.getTypeId()));
        return existingTypeDeclaration
                .map(declaration -> declaration.getInline().orElse(false))
                .orElse(false);
    }

    @Override
    public Boolean visitPrimitive(PrimitiveType primitiveType) {
        return false;
    }

    @Override
    public Boolean visitUnknown() {
        return false;
    }

    // Handle container types

    @Override
    public Boolean visitList(TypeReference typeReference) {
        return typeReference.visit(this);
    }

    @Override
    public Boolean visitMap(MapType mapType) {
        return mapType.getKeyType().visit(this) || mapType.getValueType().visit(this);
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
        return typeReference.visit(this);
    }

    @Override
    public Boolean visitLiteral(Literal literal) {
        return false;
    }

    // Unknown

    @Override
    public Boolean _visitUnknown(Object o) {
        return false;
    }
}
