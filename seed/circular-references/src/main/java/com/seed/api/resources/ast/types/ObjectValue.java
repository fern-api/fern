package com.seed.api.resources.ast.types;

import com.seed.api.core.ObjectMappers;

public final class ObjectValue {
    private ObjectValue() {}

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof ObjectValue;
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }
}
