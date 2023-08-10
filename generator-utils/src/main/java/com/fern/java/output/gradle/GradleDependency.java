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

package com.fern.java.output.gradle;

import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GradleDependency extends AbstractGradleDependency {

    public static final String JACKSON_JDK8_VERSION = "2.12.3";
    public static final String JACKSON_DATABIND_VERSION = "2.13.0";
    public static final String UTILS_VERSION = "0.0.82";
    public static final String OKHTTP_VERSION = "4.9.3";
    public static final String FEIGN_VERSION = "11.8";

    public static final String JUNIT_DEPENDENCY = "5.8.2";

    public abstract String group();

    public abstract String artifact();

    public abstract String version();

    @Override
    public final String coordinate() {
        return "'" + group() + ":" + artifact() + ":" + version() + "'";
    }

    public static ImmutableGradleDependency.TypeBuildStage builder() {
        return ImmutableGradleDependency.builder();
    }
}
