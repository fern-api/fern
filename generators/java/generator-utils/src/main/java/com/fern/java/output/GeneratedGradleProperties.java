package com.fern.java.output;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class GeneratedGradleProperties {
    private static final RawGeneratedFile GENERATED_FILE = RawGeneratedFile.builder()
            .filename("gradle.properties")
            .contents("")
            .build();

    private GeneratedGradleProperties() {}

    public static RawGeneratedFile getGeneratedFile() {
        return GENERATED_FILE;
    }
}
