package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.squareup.javapoet.MethodSpec;
import com.types.ObjectProperty;
import com.types.ObjectTypeDefinition;
import java.util.Map;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedInterface extends IGeneratedFile {

    ObjectTypeDefinition objectTypeDefinition();

    Map<ObjectProperty, MethodSpec> methodSpecsByProperties();

    static ImmutableGeneratedInterface.FileBuildStage builder() {
        return ImmutableGeneratedInterface.builder();
    }
}
