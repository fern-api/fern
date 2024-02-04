package com.fern.java.output;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;

public abstract class GeneratedFile {

    public abstract String filename();

    public abstract Optional<String> directoryPrefix();

    public final void write(Path directory, boolean isLocal, Optional<String> existingPrefix) {
        Path outputDirectory = directory;
        if (directoryPrefix().isPresent()) {
            outputDirectory = directory.resolve(directoryPrefix().get());
            if (!outputDirectory.toFile().exists()) {
                outputDirectory.toFile().mkdirs();
            }
        }
        try {
            writeToFile(outputDirectory, isLocal, existingPrefix);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write " + outputDirectory.resolve(filename()), e);
        }
    }

    protected abstract void writeToFile(Path directory, boolean isLocal, Optional<String> existingPrefix)
            throws IOException;
}
