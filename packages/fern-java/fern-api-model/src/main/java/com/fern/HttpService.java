package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IBaseService;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpService.class
)
@JsonIgnoreProperties({"_type"})
public interface HttpService extends IBaseService {
  List<HttpHeader> headers();

  List<HttpEndpoint> endpoints();

  static ImmutableHttpService.NameBuildStage builder() {
    return ImmutableHttpService.builder();
  }
}
