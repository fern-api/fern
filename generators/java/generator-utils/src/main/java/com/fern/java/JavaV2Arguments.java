package com.fern.java;

import com.google.common.base.Preconditions;
import java.io.File;
import java.nio.file.Path;

public final class JavaV2Arguments {

    private static final String JAVA_V2_EXECUTABLE_PATH = "/bin/java-v2";

    private final File executable;
    private final File generatorConfig;

    // Useful for debugging locally but makes remote jobs fail
    private final boolean enableLogging = false;

    public JavaV2Arguments(String configPath) {
        this(JAVA_V2_EXECUTABLE_PATH, configPath);
    }

    public JavaV2Arguments(String executablePath, String configPath) {
        this.executable = new File(executablePath);
        Preconditions.checkArgument(
                this.executable.exists(), "Could not find v2 executable at provided path " + executablePath);

        this.generatorConfig = new File(configPath);
        Preconditions.checkArgument(
                this.generatorConfig.exists(), "Could not find generator config at provided path " + configPath);
    }

    /** The path of the Java V2 executable. */
    public Path executable() {
        return Path.of(executable.getAbsolutePath());
    }

    /** The path of the generator config to pass into the Java V2 generator. */
    public Path generatorConfig() {
        return Path.of(generatorConfig.getAbsolutePath());
    }

    public boolean enableLogging() {
        return enableLogging;
    }
}
