package com.fern.java.test;

import com.fern.codegen.GeneratorContext;
import com.fern.types.FernConstants;
import java.util.Collections;
import java.util.Optional;

public final class TestConstants {

    public static final String PACKAGE_PREFIX = "com";

    public static final FernConstants FERN_CONSTANTS = FernConstants.builder()
            .errorDiscriminant("_error")
            .unknownErrorDiscriminantValue("_unknown")
            .errorInstanceIdKey("_errorInstanceId")
            .build();

    public static final GeneratorContext GENERATOR_CONTEXT = new GeneratorContext(
            Optional.of(PACKAGE_PREFIX), Collections.emptyMap(), Collections.emptyMap(), FERN_CONSTANTS);

    private TestConstants() {}
}
