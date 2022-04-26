package com.fern.model.codegen;

import com.fern.codegen.GeneratorContext;
import java.util.Collections;
import java.util.Optional;

public final class TestConstants {

    public static final String PACKAGE_PREFIX = "com";

    public static final GeneratorContext GENERATOR_CONTEXT =
            new GeneratorContext(Optional.of(PACKAGE_PREFIX), Collections.emptyMap());

    private TestConstants() {
    }
}
