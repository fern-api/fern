package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.payload.GeneratedFilePayload;
import com.fern.types.services.http.HttpService;
import com.fern.types.types.NamedType;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.immutables.value.Value;

@Value.Immutable
public interface ModelGeneratorResult {

    List<GeneratedAlias> aliases();

    List<GeneratedEnum> enums();

    Map<NamedType, GeneratedInterface> interfaces();

    List<GeneratedObject> objects();

    List<GeneratedUnion> unions();

    Map<NamedType, GeneratedError> errors();

    Map<HttpService, List<GeneratedEndpointModel>> endpointModels();

    default List<IGeneratedFile> endpointModelFiles() {
        return endpointModels().values().stream()
                .flatMap(Collection::stream)
                .flatMap(generatedEndpointModel -> {
                    Stream.Builder<IGeneratedFile> generatedFileStream = Stream.builder();
                    if (generatedEndpointModel.errorFile().isPresent()) {
                        generatedFileStream.add(
                                generatedEndpointModel.errorFile().get());
                    }
                    if (generatedEndpointModel.generatedHttpRequest() instanceof GeneratedFilePayload) {
                        generatedFileStream.add(
                                ((GeneratedFilePayload) generatedEndpointModel.generatedHttpRequest()).generatedFile());
                    }
                    if (generatedEndpointModel.generatedHttpResponse() instanceof GeneratedFilePayload) {
                        generatedFileStream.add(((GeneratedFilePayload) generatedEndpointModel.generatedHttpResponse())
                                .generatedFile());
                    }
                    return generatedFileStream.build();
                })
                .collect(Collectors.toList());
    }

    class Builder extends ImmutableModelGeneratorResult.Builder {}

    static ModelGeneratorResult.Builder builder() {
        return new ModelGeneratorResult.Builder();
    }
}
