/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
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

package com.fern.java.output;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.squareup.javapoet.FieldSpec;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GeneratedObjectMapper extends AbstractGeneratedJavaFile {

    public abstract FieldSpec jsonMapperStaticField();

    public static ImmutableGeneratedObjectMapper.ClassNameBuildStage builder() {
        return ImmutableGeneratedObjectMapper.builder();
    }
}
