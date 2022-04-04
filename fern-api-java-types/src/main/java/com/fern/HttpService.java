package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
@StagedImmutablesStyle
@JsonDeserialize(as = ImmutableHttpService.class)
public interface HttpService extends BaseService {

    List<HttpHeader> headers();

    List<HttpEndpoint> endpoints();

    static ImmutableHttpService.NameBuildStage builder() {
        return ImmutableHttpService.builder();
    }
}
