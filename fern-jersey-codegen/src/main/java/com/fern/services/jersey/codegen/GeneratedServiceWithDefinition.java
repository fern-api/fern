package com.fern.services.jersey.codegen;

import com.fern.HttpService;
import com.fern.codegen.GeneratedFileWithDefinition;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedServiceWithDefinition extends GeneratedFileWithDefinition<HttpService> {

    static ImmutableGeneratedServiceWithDefinition.FileBuildStage builder() {
        return ImmutableGeneratedServiceWithDefinition.builder();
    }
}
