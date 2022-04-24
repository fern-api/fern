package com.fern.services.jersey.codegen;

import com.fern.codegen.GeneratedFile;
import com.fern.immutables.StagedBuilderStyle;
import com.services.http.HttpService;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedServiceWithDefinition extends GeneratedFile {

    HttpService httpService();

    static ImmutableGeneratedServiceWithDefinition.FileBuildStage builder() {
        return ImmutableGeneratedServiceWithDefinition.builder();
    }
}
