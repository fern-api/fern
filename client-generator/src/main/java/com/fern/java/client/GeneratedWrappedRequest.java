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

package com.fern.java.client;

import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.squareup.javapoet.MethodSpec;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GeneratedWrappedRequest extends AbstractGeneratedJavaFile {

    public abstract List<EnrichedObjectProperty> headerParams();

    public abstract List<EnrichedObjectProperty> queryParams();

    public abstract Optional<RequestBodyGetter> requestBodyGetter();

    public static ImmutableGeneratedWrappedRequest.ClassNameBuildStage builder() {
        return ImmutableGeneratedWrappedRequest.builder();
    }

    public interface RequestBodyGetter {}

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface InlinedRequestBodyGetters extends RequestBodyGetter {

        List<EnrichedObjectProperty> properties();

        static ImmutableInlinedRequestBodyGetters.Builder builder() {
            return ImmutableInlinedRequestBodyGetters.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface ReferencedRequestBodyGetter extends RequestBodyGetter {

        MethodSpec requestBodyGetter();

        static ImmutableReferencedRequestBodyGetter.RequestBodyGetterBuildStage builder() {
            return ImmutableReferencedRequestBodyGetter.builder();
        }
    }
}
