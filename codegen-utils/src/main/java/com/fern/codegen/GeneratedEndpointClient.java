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

package com.fern.codegen;

import com.fern.codegen.generator.object.EnrichedObjectProperty;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface GeneratedEndpointClient extends IGeneratedFile {

    GeneratedRequestInfo generatedRequestInfo();

    static ImmutableGeneratedEndpointClient.FileBuildStage builder() {
        return ImmutableGeneratedEndpointClient.builder();
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    interface GeneratedRequestInfo {

        TypeSpec requestTypeSpec();

        ClassName requestClassName();

        List<EnrichedObjectProperty> enrichedObjectProperty();

        Optional<MethodSpec> authMethodSpec();

        static ImmutableGeneratedRequestInfo.RequestTypeSpecBuildStage builder() {
            return ImmutableGeneratedRequestInfo.builder();
        }
    }
}
