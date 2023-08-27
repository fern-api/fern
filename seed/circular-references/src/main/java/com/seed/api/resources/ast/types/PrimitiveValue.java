package com.seed.api.resources.ast.types;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PrimitiveValue {
    STRING("STRING"),

    NUMBER("NUMBER");

    private final String value;

    PrimitiveValue(String value) {
        this.value = value;
    }

    @JsonValue
    @Override
    public String toString() {
        return this.value;
    }
}
