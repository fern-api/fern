package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.AliasTypeDeclaration;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedAlias extends IGeneratedFile {

    AliasTypeDeclaration aliasTypeDeclaration();

    static ImmutableGeneratedAlias.FileBuildStage builder() {
        return ImmutableGeneratedAlias.builder();
    }
}
