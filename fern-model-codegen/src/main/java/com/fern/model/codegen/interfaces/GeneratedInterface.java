package com.fern.model.codegen.interfaces;

import com.fern.ObjectTypeDefinition;
import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedInterface extends GeneratedFile<ObjectTypeDefinition> {

    static ImmutableGeneratedInterface.FileBuildStage builder() {
        return ImmutableGeneratedInterface.builder();
    }
}
