package com.fern.model.codegen.object;

import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import com.types.ObjectTypeDefinition;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedObject extends GeneratedFile {

    ObjectTypeDefinition objectTypeDefinition();

    static ImmutableGeneratedObject.FileBuildStage builder() {
        return ImmutableGeneratedObject.builder();
    }
}
