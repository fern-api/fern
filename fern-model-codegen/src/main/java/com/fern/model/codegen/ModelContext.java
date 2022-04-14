package com.fern.model.codegen;

import com.fern.TypeDefinition;
import java.util.List;

public final class ModelContext {

    private final List<TypeDefinition> typeDefinitions;

    public ModelContext(List<TypeDefinition> typeDefinitions) {
        this.typeDefinitions = typeDefinitions;
    }
}
