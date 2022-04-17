package com.fern.model.codegen.alias;

import com.fern.AliasTypeDefinition;
import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedAlias extends GeneratedFile<AliasTypeDefinition> {

    static ImmutableGeneratedAlias.FileBuildStage builder() {
        return ImmutableGeneratedAlias.builder();
    }
}
