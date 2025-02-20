package com.fern.java.utils;

import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.MapType;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.ResolvedNamedType;
import com.fern.ir.model.types.ResolvedTypeReference;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class InlineTypeIdResolver
        implements TypeReference.Visitor<List<NamedTypeId>>,
                ContainerType.Visitor<List<NamedTypeId>>,
                ResolvedTypeReference.Visitor<List<NamedTypeId>> {

    private static final String KEY = "Key";
    private static final String VALUE = "Value";
    private static final String ITEM = "Item";

    private final String name;
    private final AbstractGeneratorContext<?, ?> generatorContext;

    public InlineTypeIdResolver(String name, AbstractGeneratorContext<?, ?> generatorContext) {
        this.name = name;
        this.generatorContext = generatorContext;
    }

    // Handle top-level types

    @Override
    public List<NamedTypeId> visitLiteral(Literal literal) {
        return List.of();
    }

    @Override
    public List<NamedTypeId> visitContainer(ContainerType containerType) {
        return containerType.visit(this);
    }

    @Override
    public List<NamedTypeId> visitNamed(ResolvedNamedType resolvedNamedType) {
        return List.of(NamedTypeId.builder()
                .name(name)
                .typeId(resolvedNamedType.getName().getTypeId())
                .build());
    }

    @Override
    public List<NamedTypeId> visitNamed(NamedType namedType) {
        Optional<TypeDeclaration> maybeRawTypeDeclaration =
                Optional.ofNullable(generatorContext.getTypeDeclarations().get(namedType.getTypeId()));
        if (maybeRawTypeDeclaration.isEmpty()) {
            return List.of();
        }

        TypeDeclaration rawTypeDeclaration = maybeRawTypeDeclaration.get();

        if (!generatorContext.getCustomConfig().wrappedAliases()
                && rawTypeDeclaration.getShape().getAlias().isPresent()) {
            return rawTypeDeclaration
                    .getShape()
                    .getAlias()
                    .get()
                    .getResolvedType()
                    .visit(this);
        }
        return List.of(
                NamedTypeId.builder().name(name).typeId(namedType.getTypeId()).build());
    }

    @Override
    public List<NamedTypeId> visitPrimitive(PrimitiveType primitiveType) {
        return List.of();
    }

    @Override
    public List<NamedTypeId> visitUnknown() {
        return List.of();
    }

    @Override
    public List<NamedTypeId> _visitUnknown(Object o) {
        return List.of();
    }

    // Handle container types

    @Override
    public List<NamedTypeId> visitList(TypeReference typeReference) {
        return typeReference.visit(new InlineTypeIdResolver(name + ITEM, generatorContext));
    }

    @Override
    public List<NamedTypeId> visitMap(MapType mapType) {
        List<NamedTypeId> result = new ArrayList<>();
        result.addAll(mapType.getKeyType().visit(new InlineTypeIdResolver(name + KEY, generatorContext)));
        result.addAll(mapType.getValueType().visit(new InlineTypeIdResolver(name + VALUE, generatorContext)));
        return result;
    }

    @Override
    public List<NamedTypeId> visitNullable(TypeReference typeReference) {
        return typeReference.visit(this);
    }

    @Override
    public List<NamedTypeId> visitOptional(TypeReference typeReference) {
        return typeReference.visit(this);
    }

    @Override
    public List<NamedTypeId> visitSet(TypeReference typeReference) {
        return typeReference.visit(new InlineTypeIdResolver(name + ITEM, generatorContext));
    }
}
