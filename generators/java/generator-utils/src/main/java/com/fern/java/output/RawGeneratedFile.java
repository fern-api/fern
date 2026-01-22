package com.fern.java.output;

import com.fern.java.ICustomConfig.OutputDirectory;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class RawGeneratedFile extends GeneratedFile {

    public abstract String contents();

    @Override
    public final void writeToFile(
            Path directory, boolean _isLocal, Optional<String> _existingPrefix, OutputDirectory _outputDirectoryMode)
            throws IOException {
        Files.writeString(directory.resolve(filename()), contents());
    }

    public static ImmutableRawGeneratedFile.FilenameBuildStage builder() {
        return ImmutableRawGeneratedFile.builder();
    }
}
