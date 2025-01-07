package com.fern.java.client;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;

public final class ApiVersionConstants {
    /** Do not instantiate utils class. */
    private ApiVersionConstants() {}

    public static final String CURRENT_API_VERSION = "CURRENT";

    public static final Name CURRENT_API_VERSION_NAME = Name.builder()
            .originalName("CURRENT")
            .camelCase(SafeAndUnsafeString.builder()
                    .unsafeName("current")
                    .safeName("current")
                    .build())
            .pascalCase(SafeAndUnsafeString.builder()
                    .unsafeName("Current")
                    .safeName("Current")
                    .build())
            .snakeCase(SafeAndUnsafeString.builder()
                    .unsafeName("current")
                    .safeName("current")
                    .build())
            .screamingSnakeCase(SafeAndUnsafeString.builder()
                    .unsafeName("CURRENT")
                    .safeName("CURRENT")
                    .build())
            .build();
}
