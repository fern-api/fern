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
import com.fern.java.output.AbstractGeneratedFileOutput;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
public abstract class GeneratedEndpointRequestOutput extends AbstractGeneratedFileOutput {

    public abstract TypeSpec requestTypeSpec();

    public abstract ClassName requestClassName();

    public abstract List<EnrichedObjectProperty> enrichedObjectProperties();

    public abstract Optional<MethodSpec> authMethodSpec();

    public static class Builder extends ImmutableGeneratedEndpointRequestOutput.Builder {}

    public static GeneratedEndpointRequestOutput.Builder builder() {
        return new Builder();
    }
}
