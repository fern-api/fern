package com.fern.codegen;

import com.fern.immutables.StagedBuilderStyle;
import com.fern.types.services.commons.ResponseError;
import com.squareup.javapoet.MethodSpec;
import java.util.Map;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
public interface GeneratedEndpointError extends IGeneratedFile {

    Map<ResponseError, MethodSpec> constructorsByResponseError();

    static ImmutableGeneratedEndpointError.FileBuildStage builder() {
        return ImmutableGeneratedEndpointError.builder();
    }
}
