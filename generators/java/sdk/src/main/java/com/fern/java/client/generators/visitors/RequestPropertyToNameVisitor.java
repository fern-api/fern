package com.fern.java.client.generators.visitors;

import com.fern.ir.model.commons.NameAndWireValueOrString;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.http.RequestPropertyValue;
import com.fern.ir.model.types.ObjectProperty;

public class RequestPropertyToNameVisitor implements RequestPropertyValue.Visitor<NameAndWireValueOrString> {

    @Override
    public NameAndWireValueOrString visitQuery(QueryParameter query) {
        return query.getName();
    }

    @Override
    public NameAndWireValueOrString visitBody(ObjectProperty body) {
        return body.getName();
    }

    @Override
    public NameAndWireValueOrString _visitUnknown(Object unknownType) {
        throw new RuntimeException("Unknown NameAndWireValue type: " + unknownType);
    }
}
