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

import com.fern.ir.v9.model.environment.EnvironmentBaseUrlId;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.squareup.javapoet.MethodSpec;
import java.util.Map;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GeneratedEnvironmentsClass extends AbstractGeneratedJavaFile {

    public abstract Optional<String> defaultEnvironmentConstant();

    public abstract boolean optionsPresent();

    public abstract EnvironmentClassInfo info();

    public static ImmutableGeneratedEnvironmentsClass.ClassNameBuildStage builder() {
        return ImmutableGeneratedEnvironmentsClass.builder();
    }

    public abstract static class EnvironmentClassInfo {}

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public abstract static class SingleUrlEnvironmentClass extends EnvironmentClassInfo {
        public abstract MethodSpec getUrlMethod();

        public abstract MethodSpec getCustomMethod();

        public static ImmutableSingleUrlEnvironmentClass.UrlMethodBuildStage builder() {
            return ImmutableSingleUrlEnvironmentClass.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public abstract static class MultiUrlEnvironmentsClass extends EnvironmentClassInfo {
        public abstract Map<EnvironmentBaseUrlId, MethodSpec> urlGetterMethods();

        public static ImmutableMultiUrlEnvironmentsClass.Builder builder() {
            return ImmutableMultiUrlEnvironmentsClass.builder();
        }
    }
}
