package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.services.commons.WireMessage;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedWireMessage extends GeneratedFile {

    WireMessage wireMessage();

    static ImmutableGeneratedWireMessage.FileBuildStage builder() {
        return ImmutableGeneratedWireMessage.builder();
    }
}
