package com.fern.java.client.cli;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fern.codegen.utils.ObjectMappers;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

public class CustomPluginConfigTest {

    @Test
    public void basic() throws JsonProcessingException {
        FernPluginConfig fernPluginConfig = ObjectMappers.CLIENT_OBJECT_MAPPER.readValue(
                readFileFromResources("pluginConfigs/config.json"), FernPluginConfig.class);
    }

    private static String readFileFromResources(String filename) {
        try {
            InputStream solutionStream =
                    CustomPluginConfigTest.class.getClassLoader().getResourceAsStream(filename);
            return new String(solutionStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
