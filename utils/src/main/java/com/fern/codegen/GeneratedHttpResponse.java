package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.services.http.HttpResponse;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedHttpResponse extends IGeneratedFile {

    HttpResponse httpResponse();

    static ImmutableGeneratedHttpResponse.FileBuildStage builder() {
        return ImmutableGeneratedHttpResponse.builder();
    }
}
