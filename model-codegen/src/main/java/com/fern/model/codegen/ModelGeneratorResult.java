/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.IGeneratedFile;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ErrorName;
import com.fern.types.services.EndpointId;
import com.fern.types.services.HttpService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.immutables.value.Value;

@Value.Immutable
public interface ModelGeneratorResult {

    List<GeneratedAlias> aliases();

    List<GeneratedEnum> enums();

    Map<DeclaredTypeName, GeneratedInterface> interfaces();

    List<GeneratedObject> objects();

    List<GeneratedUnion> unions();

    Map<ErrorName, GeneratedError> errors();

    Map<HttpService, Map<EndpointId, GeneratedEndpointModel>> endpointModels();

    default List<IGeneratedFile> endpointModelFiles() {
        return endpointModels().values().stream()
                .flatMap(endpointIdToModel -> endpointIdToModel.values().stream())
                .flatMap(generatedEndpointModel -> {
                    Stream.Builder<IGeneratedFile> generatedFileStream = Stream.builder();
                    if (generatedEndpointModel.errorFile().isPresent()) {
                        generatedFileStream.add(
                                generatedEndpointModel.errorFile().get());
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
