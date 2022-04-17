package com.fern.services.jersey.codegen;

import com.fern.HttpService;
import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedService extends GeneratedFile<HttpService> {

    static ImmutableGeneratedService.FileBuildStage builder() {
        return ImmutableGeneratedService.builder();
    }
}
