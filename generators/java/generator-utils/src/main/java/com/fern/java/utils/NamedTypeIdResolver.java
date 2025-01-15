package com.fern.java.utils;

import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.MapType;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.TypeReference;
import java.util.ArrayList;
import java.util.List;

public class NamedTypeIdResolver
        implements TypeReference.Visitor<List<NamedTypeId>>, ContainerType.Visitor<List<NamedTypeId>> {

    private static final String KEY = "Key";
    private static final String VALUE = "Value";
    private static final String ITEM = "Item";

    private final String name;
    private final TypeReference visitedReference;

    public NamedTypeIdResolver(String name, TypeReference visitedReference) {
        this.name = name;
        this.visitedReference = visitedReference;
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
    public List<NamedTypeId> visitNamed(NamedType namedType) {
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
        return typeReference.visit(new NamedTypeIdResolver(name + ITEM, typeReference));
    }

    @Override
    public List<NamedTypeId> visitMap(MapType mapType) {
        List<NamedTypeId> result = new ArrayList<>();
        result.addAll(mapType.getKeyType().visit(new NamedTypeIdResolver(name + KEY, mapType.getKeyType())));
        result.addAll(mapType.getValueType().visit(new NamedTypeIdResolver(name + VALUE, mapType.getValueType())));
        return result;
    }

    @Override
    public List<NamedTypeId> visitOptional(TypeReference typeReference) {
        return typeReference.visit(this);
    }

    @Override
    public List<NamedTypeId> visitSet(TypeReference typeReference) {
        return typeReference.visit(new NamedTypeIdResolver(name + ITEM, typeReference));
    }
}
