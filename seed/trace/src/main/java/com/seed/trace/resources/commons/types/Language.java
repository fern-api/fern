package com.seed.trace.resources.commons.types;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Language {
    JAVA("JAVA"),

    JAVASCRIPT("JAVASCRIPT"),

    PYTHON("PYTHON");

    private final String value;

    Language(String value) {
        this.value = value;
    }

    @JsonValue
    @Override
    public String toString() {
        return this.value;
    }
}
