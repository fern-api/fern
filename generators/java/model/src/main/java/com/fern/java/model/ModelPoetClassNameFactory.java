package com.fern.java.model;

import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.java.AbstractModelPoetClassNameFactory;
import com.fern.java.AbstractPoetClassNameFactory;

public final class ModelPoetClassNameFactory extends AbstractModelPoetClassNameFactory {

    public ModelPoetClassNameFactory(IntermediateRepresentation ir, String organization) {
        super(AbstractPoetClassNameFactory.getPackagePrefixWithOrgAndApiName(ir, organization));
    }
}
