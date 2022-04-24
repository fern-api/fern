package com.fern.model.codegen.alias;

import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import com.types.AliasTypeDefinition;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedAlias extends GeneratedFile {

    AliasTypeDefinition aliasTypeDefinition();

    static ImmutableGeneratedAlias.FileBuildStage builder() {
        return ImmutableGeneratedAlias.builder();
    }
}
