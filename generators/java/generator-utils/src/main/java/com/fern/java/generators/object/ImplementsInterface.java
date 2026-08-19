package com.fern.java.generators.object;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.squareup.javapoet.ClassName;
import java.util.List;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface ImplementsInterface {

    ClassName interfaceClassName();

    List<EnrichedObjectProperty> interfaceProperties();

    static ImmutableImplementsInterface.InterfaceClassNameBuildStage builder() {
        return ImmutableImplementsInterface.builder();
    }
}
