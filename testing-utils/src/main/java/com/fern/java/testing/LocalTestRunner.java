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

package com.fern.java.testing;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.generator.exec.model.config.GeneratorEnvironment;
import com.fern.generator.exec.model.config.GeneratorOutputConfig;
import com.fern.generator.exec.model.config.GeneratorPublishConfig;
import com.fern.generator.exec.model.config.GeneratorRegistriesConfig;
import com.fern.generator.exec.model.config.GeneratorRegistriesConfigV2;
import com.fern.generator.exec.model.config.MavenRegistryConfig;
import com.fern.generator.exec.model.config.MavenRegistryConfigV2;
import com.fern.generator.exec.model.config.NpmRegistryConfig;
import com.fern.generator.exec.model.config.NpmRegistryConfigV2;
import com.fern.generator.exec.model.config.OutputMode;
import com.fern.generator.exec.model.config.PypiRegistryConfig;
import com.fern.java.AbstractGeneratorCli;
import com.fern.java.StreamGobbler;
import com.fern.java.jackson.ClientObjectMappers;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Map;

public final class LocalTestRunner {

    private LocalTestRunner() {}

    public static void test(Path fernDir, AbstractGeneratorCli generator) throws IOException {

        Path tmpDir = Files.createTempDirectory("fern");

        Path pathToOutput = Files.createTempDirectory("output");
        Path pathToIr = tmpDir.resolve("ir.json");
        Path pathToConfig = tmpDir.resolve("config.json");

        GeneratorConfig generatorConfig = GeneratorConfig.builder()
                .dryRun(true)
                .irFilepath(pathToIr.toAbsolutePath().toString())
                .output(GeneratorOutputConfig.builder()
                        .path(pathToOutput.toAbsolutePath().toString())
                        .mode(OutputMode.publish(GeneratorPublishConfig.builder()
                                .registries(GeneratorRegistriesConfig.builder()
                                        .maven(MavenRegistryConfig.builder()
                                                .registryUrl(
                                                        "https://s01.oss.sonatype.org/content/repositories/releases/")
                                                .username("fake")
                                                .password("fake")
                                                .group("com.fern")
                                                .build())
                                        .npm(NpmRegistryConfig.builder()
                                                .registryUrl("")
                                                .token("")
                                                .scope("")
                                                .build())
                                        .build())
                                .registriesV2(GeneratorRegistriesConfigV2.builder()
                                        .maven(MavenRegistryConfigV2.builder()
                                                .registryUrl(
                                                        "https://s01.oss.sonatype.org/content/repositories/releases/")
                                                .username("fake")
                                                .password("fake")
                                                .coordinate("com.fern:basic")
                                                .build())
                                        .npm(NpmRegistryConfigV2.builder()
                                                .registryUrl("")
                                                .token("")
                                                .packageName("")
                                                .build())
                                        .pypi(PypiRegistryConfig.builder()
                                                .registryUrl("")
                                                .username("")
                                                .password("")
                                                .packageName("")
                                                .build())
                                        .build())
                                .version("0.0.0")
                                .build()))
                        .build())
                .workspaceName("")
                .organization("fern")
                .environment(GeneratorEnvironment.local())
                .build();

        Files.writeString(pathToConfig, ClientObjectMappers.JSON_MAPPER.writeValueAsString(generatorConfig));

        runCommand(fernDir, new String[] {
            "fern", "ir", pathToIr.toAbsolutePath().toString(), "--language", "java", "--version", "v11"
        });

        generator.run(pathToConfig.toAbsolutePath().toString());
    }

    private static void runCommand(Path workingDirPath, String[] command) {
        int exitCode;
        try {
            ProcessBuilder pb = new ProcessBuilder(command).directory(workingDirPath.toFile());

            Map<String, String> env = pb.environment();

            Process process = pb.start();
            StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream());
            StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream());
            errorGobbler.start();
            outputGobbler.start();
            exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Command failed with non-zero exit code: " + Arrays.asList(command));
            }
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to run command: " + Arrays.asList(command), e);
        }
    }
}
