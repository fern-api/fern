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
package com.fern.java.client.cli;

import com.fern.java.client.cli.CustomPluginConfig.Mode;
import com.fern.types.generators.GeneratorConfig;
import com.fern.types.generators.GeneratorHelpers;
import com.fern.types.generators.GeneratorOutputConfig;
import java.util.Map;
import org.junit.jupiter.api.Test;

public class CodeGenerationResultTest {

    private static final FernPluginConfig PLUGIN_CONFIG = FernPluginConfig.create(
            GeneratorConfig.builder()
                    .irFilepath("ir.json")
                    .output(GeneratorOutputConfig.builder().path("output").build())
                    .workspaceName("ir-types")
                    .organization("fern")
                    .helpers(GeneratorHelpers.builder().build())
                    .putAllCustomConfig(Map.of("mode", Mode.CLIENT_AND_SERVER.toString()))
                    .build(),
            "0.0.0");

    @Test
    public void test_serverBuildGradle() {
        System.out.println(CodeGenerationResult.getServerBuildGradle(PLUGIN_CONFIG));
    }
}
