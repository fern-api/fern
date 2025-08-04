package com.fern.java.client;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class JavaSdkCustomConfigTest {

    @Test
    public void testPublishToDefaultsToCentral() {
        JavaSdkCustomConfig config = JavaSdkCustomConfig.builder().build();
        assertEquals("central", config.publishTo());
    }

    @Test
    public void testPublishToCanBeOverridden() {
        JavaSdkCustomConfig config =
                JavaSdkCustomConfig.builder().publishTo("ossrh").build();
        assertEquals("ossrh", config.publishTo());
    }
}
