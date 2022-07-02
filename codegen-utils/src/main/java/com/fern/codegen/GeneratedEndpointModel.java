package com.fern.codegen;

import com.fern.codegen.payload.Payload;
import com.fern.types.services.HttpEndpoint;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
public interface GeneratedEndpointModel {

    HttpEndpoint httpEndpoint();

    Payload generatedHttpResponse();

    Payload generatedHttpRequest();

    Optional<GeneratedEndpointError> errorFile();

    static ImmutableGeneratedEndpointModel.Builder builder() {
        return ImmutableGeneratedEndpointModel.builder();
    }
}
