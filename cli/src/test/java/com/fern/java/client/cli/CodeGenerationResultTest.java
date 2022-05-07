package com.fern.java.client.cli;

import com.fern.java.client.cli.CustomPluginConfig.Mode;
import org.junit.jupiter.api.Test;

public class CodeGenerationResultTest {

    private static final FernPluginConfig PLUGIN_CONFIG = FernPluginConfig.builder()
            .outputPathRelativeToRootOnHost("memory-api/memory-java-api")
            .irFilepath("ir.json")
            .outputDirectory("output")
            .customPluginConfig(CustomPluginConfig.builder()
                    .mode(Mode.CLIENT_AND_SERVER)
                    .build())
            .build();

    @Test
    public void test_serverBuildGradle() {
        System.out.println(CodeGenerationResult.getServerBuildGradle(PLUGIN_CONFIG));
    }
}
