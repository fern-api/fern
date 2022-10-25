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

import au.com.origin.snapshots.Expect;
import au.com.origin.snapshots.annotations.SnapshotName;
import au.com.origin.snapshots.junit5.SnapshotExtension;
import com.fern.java.testing.SnapshotTestRunner;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ExtendWith(SnapshotExtension.class)
public class CliEteTest {

    private static final Logger log = LoggerFactory.getLogger(CliEteTest.class);

    private Expect expect;

    @SuppressWarnings("StreamResourceLeak")
    @SnapshotName("basic")
    @Test
    public void test_basic() throws IOException {
        Path currentPath = Paths.get("").toAbsolutePath();
        Path fernDirPath = currentPath.endsWith("cli")
                ? currentPath.resolve(Paths.get("src/eteTest"))
                : currentPath.resolve(Paths.get("cli/src/eteTest"));
        SnapshotTestRunner.snapshotTest(
                fernDirPath,
                expect,
                "fern-java:latest",
                Optional.of(Map.of(
                        "mode", "client_and_server",
                        "serverFrameworks", "spring,jersey")));
        // Path pathToOutput = fernDirPath.resolve("generated-java");
        // runCommand(fernDirPath, new String[] {"cp", "gradlew", "generated-java/"});
        // runCommand(fernDirPath, new String[] {"cp", "-R", "gradle-wrapper/.", "generated-java/"});
        // runCommand(pathToOutput, new String[] {"./gradlew", "compileJava"});
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
