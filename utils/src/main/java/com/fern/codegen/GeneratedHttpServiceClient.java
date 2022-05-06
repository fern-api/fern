package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.services.http.HttpService;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedHttpServiceClient extends IGeneratedFile {

    HttpService httpService();

    List<GeneratedWireMessage> generatedWireMessages();

    Optional<GeneratedErrorDecoder> generatedErrorDecoder();

    static ImmutableGeneratedHttpServiceClient.FileBuildStage builder() {
        return ImmutableGeneratedHttpServiceClient.builder();
    }
}
