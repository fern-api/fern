package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableHttpService.class)
@JsonIgnoreProperties({"type"})
public interface HttpService extends IBaseService {

    List<HttpHeader> headers();

    List<HttpEndpoint> endpoints();

    static ImmutableHttpService.NameBuildStage builder() {
        return ImmutableHttpService.builder();
    }
}
