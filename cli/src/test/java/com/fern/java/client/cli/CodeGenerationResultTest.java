package com.fern.java.client.cli;

import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.types.generators.config.GeneratorConfig;
import com.fern.types.generators.config.GeneratorHelpers;
import com.fern.types.generators.config.GeneratorOutputConfig;
import java.util.Map;
import org.junit.jupiter.api.Test;

public class CodeGenerationResultTest {

    private static final FernPluginConfig PLUGIN_CONFIG = FernPluginConfig.create(GeneratorConfig.builder()
            .irFilepath("ir.json")
            .output(GeneratorOutputConfig.builder().path("output").build())
            .workspaceName("ir-types")
            .organization("fern")
            .helpers(GeneratorHelpers.builder().build())
            .putAllCustomConfig(Map.of(
                    "mode", Mode.CLIENT_AND_SERVER.toString()
            ))
            .build(), "0.0.0");

    @Test
    public void test_serverBuildGradle() {
        System.out.println(CodeGenerationResult.getServerBuildGradle(PLUGIN_CONFIG));
    }
}
