package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.services.http.HttpService;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedHttpServiceServer extends IGeneratedFile {

    HttpService httpService();

    List<GeneratedWireMessage> generatedWireMessages();

    static ImmutableGeneratedHttpServiceServer.FileBuildStage builder() {
        return ImmutableGeneratedHttpServiceServer.builder();
    }
}
