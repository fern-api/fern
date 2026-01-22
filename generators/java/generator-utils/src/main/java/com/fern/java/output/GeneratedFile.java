package com.fern.java.output;

import com.fern.java.ICustomConfig.OutputDirectory;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;

public abstract class GeneratedFile {

    public abstract String filename();

    public abstract Optional<String> directoryPrefix();

    public final void write(
            Path directory, boolean isLocal, Optional<String> existingPrefix, OutputDirectory outputDirectoryMode) {
        Path effectiveDirectory = directory;
        if (directoryPrefix().isPresent()) {
            effectiveDirectory = directory.resolve(directoryPrefix().get());
            if (!effectiveDirectory.toFile().exists()) {
                effectiveDirectory.toFile().mkdirs();
            }
        }
        try {
            writeToFile(effectiveDirectory, isLocal, existingPrefix, outputDirectoryMode);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write " + effectiveDirectory.resolve(filename()), e);
        }
    }

    protected abstract void writeToFile(
            Path directory, boolean isLocal, Optional<String> existingPrefix, OutputDirectory outputDirectoryMode)
            throws IOException;
}
