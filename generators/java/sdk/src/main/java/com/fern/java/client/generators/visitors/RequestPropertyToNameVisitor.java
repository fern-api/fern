package com.fern.java.client.generators.visitors;

import com.fern.irV42.model.commons.NameAndWireValue;
import com.fern.irV42.model.http.QueryParameter;
import com.fern.irV42.model.http.RequestPropertyValue;
import com.fern.irV42.model.types.ObjectProperty;

public class RequestPropertyToNameVisitor implements RequestPropertyValue.Visitor<NameAndWireValue> {

    @Override
    public NameAndWireValue visitQuery(QueryParameter query) {
        return query.getName();
    }

    @Override
    public NameAndWireValue visitBody(ObjectProperty body) {
        return body.getName();
    }

    @Override
    public NameAndWireValue _visitUnknown(Object unknownType) {
        throw new RuntimeException("Unknown NameAndWireValue type: " + unknownType);
    }
}
