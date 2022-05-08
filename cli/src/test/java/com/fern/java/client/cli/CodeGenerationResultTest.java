package com.fern.java.client.cli;

import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.java.client.cli.FernPluginConfig.OutputConfig;
import org.junit.jupiter.api.Test;

public class CodeGenerationResultTest {

    private static final FernPluginConfig PLUGIN_CONFIG = FernPluginConfig.builder()
            .irFilepath("ir.json")
            .output(OutputConfig.builder()
                    .path("output")
                    .pathRelativeToRootOnHost("memory-api/memory-java-api")
                    .build())
            .customPluginConfig(CustomPluginConfig.builder()
                    .mode(Mode.CLIENT_AND_SERVER)
                    .build())
            .build();

    @Test
    public void test_serverBuildGradle() {
        System.out.println(CodeGenerationResult.getServerBuildGradle(PLUGIN_CONFIG));
    }
}
