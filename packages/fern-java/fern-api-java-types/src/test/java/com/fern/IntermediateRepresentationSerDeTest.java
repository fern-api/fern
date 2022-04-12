package com.fern;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class IntermediateRepresentationSerDeTest {

    @Test
    public void test_basic() {
        String fernIrJson = readFileFromResources("fern-ir.json");

    }

    private static String readFileFromResources(String filename) {
        try {
            InputStream solutionStream =
                    IntermediateRepresentationSerDeTest.class.getClassLoader().getResourceAsStream(filename);
            return new String(solutionStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
