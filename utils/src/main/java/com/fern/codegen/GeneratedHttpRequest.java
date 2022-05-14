package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.services.http.HttpRequest;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedHttpRequest extends IGeneratedFile {

    HttpRequest httpRequest();

    static ImmutableGeneratedHttpRequest.FileBuildStage builder() {
        return ImmutableGeneratedHttpRequest.builder();
    }
}
