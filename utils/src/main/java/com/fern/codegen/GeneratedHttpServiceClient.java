package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.services.http.HttpService;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedHttpServiceClient extends IGeneratedFile {

    HttpService httpService();

    Optional<GeneratedErrorDecoder> generatedErrorDecoder();

    static ImmutableGeneratedHttpServiceClient.FileBuildStage builder() {
        return ImmutableGeneratedHttpServiceClient.builder();
    }
}
