package com.fern;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.guava.GuavaModule;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class IntermediateRepresentationSerDeTest {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper().registerModule(new GuavaModule())
            .registerModule(new Jdk8Module().configureAbsentsAsNulls(true));

    @Test
    public void test_basic() throws JsonProcessingException {
        String fernIrJson = readFileFromResources("fern-ir.json");
        IntermediateRepresentation ir = OBJECT_MAPPER.readValue(fernIrJson, IntermediateRepresentation.class);
        ir.types();
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
