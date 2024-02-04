package com.fern.java;

import com.fern.java.output.RawGeneratedFile;

public final class GitIgnoreGenerator {

    private static final RawGeneratedFile GENERATED_FILE = RawGeneratedFile.builder()
            .filename(".gitignore")
            .contents("*.class\n"
                    + ".project\n"
                    + ".gradle\n"
                    + "?\n"
                    + ".classpath\n"
                    + ".checkstyle\n"
                    + ".settings\n"
                    + ".node\n"
                    + "build\n"
                    + "\n"
                    + "# IntelliJ\n"
                    + "*.iml\n"
                    + "*.ipr\n"
                    + "*.iws\n"
                    + ".idea/\n"
                    + "out/\n"
                    + "\n"
                    + "# Eclipse/IntelliJ APT\n"
                    + "generated_src/\n"
                    + "generated_testSrc/\n"
                    + "generated/\n"
                    + "\n"
                    + "bin\n"
                    + "build")
            .build();

    private GitIgnoreGenerator() {}

    public static RawGeneratedFile getGitignore() {
        return GENERATED_FILE;
    }
}
