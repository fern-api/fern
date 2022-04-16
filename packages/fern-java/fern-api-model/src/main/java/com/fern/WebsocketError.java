package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.String;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWebsocketError.class
)
@JsonIgnoreProperties({"_type"})
public interface WebsocketError extends IWithDocs {
  String name();

  Optional<TypeReference> bodyType();

  static ImmutableWebsocketError.NameBuildStage builder() {
    return ImmutableWebsocketError.builder();
  }
}
