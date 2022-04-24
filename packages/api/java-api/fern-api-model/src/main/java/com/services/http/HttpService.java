package com.services.http;

import com.StagedBuilderStyle;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.services.commons.interfaces.IBaseService;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpService.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface HttpService extends IBaseService {
  List<HttpEndpoint> endpoints();

  List<HttpHeader> headers();

  static ImmutableHttpService.BasePathBuildStage builder() {
    return ImmutableHttpService.builder();
  }
}
