package com.seed.trace.resources.migration.types;

import com.fasterxml.jackson.annotation.JsonValue;

public enum MigrationStatus {
    RUNNING("RUNNING"),

    FAILED("FAILED"),

    FINISHED("FINISHED");

    private final String value;

    MigrationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    @Override
    public String toString() {
        return this.value;
    }
}
