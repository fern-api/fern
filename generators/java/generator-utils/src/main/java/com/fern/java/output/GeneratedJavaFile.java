package com.fern.java.output;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GeneratedJavaFile extends AbstractGeneratedJavaFile {

    public static ImmutableGeneratedJavaFile.ClassNameBuildStage builder() {
        return ImmutableGeneratedJavaFile.builder();
    }
}
