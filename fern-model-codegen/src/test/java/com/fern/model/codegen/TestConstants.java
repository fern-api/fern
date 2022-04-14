package com.fern.model.codegen;

import com.fern.model.codegen.config.PluginConfig;
import java.util.Collections;

public final class TestConstants {

    public static final PluginConfig PLUGIN_CONFIG = PluginConfig.builder()
            .modelSubprojectDirectoryName("build/fern/model")
            .packagePrefix("com")
            .build();

    public static final GeneratorContext GENERATOR_CONTEXT =
            new GeneratorContext(PLUGIN_CONFIG, Collections.emptyMap());

    private TestConstants() {
    }
}
