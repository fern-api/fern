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
package com.fern.java.model;

import au.com.origin.snapshots.Expect;
import au.com.origin.snapshots.annotations.SnapshotName;
import au.com.origin.snapshots.junit5.SnapshotExtension;
import com.fern.java.StreamGobbler;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ExtendWith(SnapshotExtension.class)
public class ModelGeneratorEteTest {

    private static final Logger log = LoggerFactory.getLogger(ModelGeneratorEteTest.class);

    private Expect expect;

    @SuppressWarnings("StreamResourceLeak")
    @SnapshotName("basic")
    @Test
    public void test_basic() throws IOException {

        Path currentPath = Paths.get("").toAbsolutePath();
        Path dotFernProjectPath = currentPath.endsWith("model-generator")
                ? currentPath.resolve(Paths.get("src/eteTest/.fern"))
                : currentPath.resolve(Paths.get("model-generator/src/eteTest/.fern"));
        runCommand(dotFernProjectPath, new String[] {"fern-dev", "generate", "--local", "--keepDocker"});

        Path basicApiPath = dotFernProjectPath.resolve("basic");
        Path generatedJavaPath = basicApiPath.resolve("generated-java");

        runCommand(generatedJavaPath, new String[] {"git", "init"});
        runCommand(generatedJavaPath, new String[] {"git", "add", "-A"});
        runCommand(generatedJavaPath, new String[] {"git", "commit", "-m", "generate"});
        runCommand(generatedJavaPath, new String[] {"git", "clean", "-fdx"});
        runCommand(generatedJavaPath, new String[] {"rm", "-rf", ".git"});

        boolean filesGenerated = false;
        List<Path> paths = Files.walk(dotFernProjectPath.resolve(Paths.get("basic/generated-java")))
                .collect(Collectors.toList());
        for (Path path : paths) {
            if (path.toFile().isDirectory() || path.toAbsolutePath().toString().endsWith(".bat")) {
                continue;
            }
            Path relativizedPath = dotFernProjectPath.relativize(path);
            filesGenerated = true;
            try {
                String fileContents = Files.readString(path);
                expect.scenario(relativizedPath.toString()).toMatchSnapshot(fileContents);
            } catch (IOException e) {
                log.error("Encountered error while reading file {}", relativizedPath, e);
                expect.scenario(relativizedPath.toString()).toMatchSnapshot(relativizedPath.toString());
            }
        }
        if (!filesGenerated) {
            throw new RuntimeException("Failed to generate any files!");
        }

        runCommand(generatedJavaPath, new String[] {"./gradlew", "compileJava"});
    }

    private static void runCommand(Path projectPath, String[] command) {
        int exitCode;
        try {
            ProcessBuilder pb = new ProcessBuilder(command).directory(projectPath.toFile());

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
