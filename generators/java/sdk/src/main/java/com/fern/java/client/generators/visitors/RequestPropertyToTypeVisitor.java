package com.fern.java.client.generators.visitors;

import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.http.RequestPropertyValue;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.TypeReference;

/**
 * Extracts the TypeReference from a RequestPropertyValue to enable type introspection (e.g., checking if a property is
 * a literal, optional, etc.).
 */
public class RequestPropertyToTypeVisitor implements RequestPropertyValue.Visitor<TypeReference> {

    @Override
    public TypeReference visitQuery(QueryParameter query) {
        return query.getValueType();
    }

    @Override
    public TypeReference visitBody(ObjectProperty body) {
        return body.getValueType();
    }

    @Override
    public TypeReference _visitUnknown(Object unknownType) {
        throw new RuntimeException("Unknown RequestPropertyValue type: " + unknownType);
    }
}
