package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.types.ObjectTypeDeclaration;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedObject extends IGeneratedFile {

    ObjectTypeDeclaration objectTypeDeclaration();

    static ImmutableGeneratedObject.FileBuildStage builder() {
        return ImmutableGeneratedObject.builder();
    }
}
