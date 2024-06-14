package com.fern.java.client.generators.visitors;

import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.http.RequestPropertyValue;
import com.fern.ir.model.types.ObjectProperty;

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
