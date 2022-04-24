package com.services.commons;

import com.StagedBuilderStyle;
import com.commons.interfaces.IWithDocs;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.services.commons.interfaces.IWireMessage;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableWireMessage.class
)
@JsonIgnoreProperties(
    ignoreUnknown = true
)
public interface WireMessage extends IWithDocs, IWireMessage {
  static ImmutableWireMessage.TypeBuildStage builder() {
    return ImmutableWireMessage.builder();
  }
}
