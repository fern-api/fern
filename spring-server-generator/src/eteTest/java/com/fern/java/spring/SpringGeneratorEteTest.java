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
package com.fern.java.spring;

import au.com.origin.snapshots.Expect;
import au.com.origin.snapshots.annotations.SnapshotName;
import au.com.origin.snapshots.junit5.SnapshotExtension;
import com.fern.java.testing.SnapshotTestRunner;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ExtendWith(SnapshotExtension.class)
public class SpringGeneratorEteTest {

    private static final Logger log = LoggerFactory.getLogger(SpringGeneratorEteTest.class);

    private Expect expect;

    @SuppressWarnings("StreamResourceLeak")
    @SnapshotName("basic")
    @Test
    public void test_basic() throws IOException {
        Path currentPath = Paths.get("").toAbsolutePath();
        Path eteTestDirectory = currentPath.endsWith("spring-server-generator")
                ? currentPath.resolve(Paths.get("src/eteTest"))
                : currentPath.resolve(Paths.get("spring-server-generator/src/eteTest"));
        SnapshotTestRunner.snapshotLocalFiles(
                eteTestDirectory, expect, "java-spring:latest", Optional.of(Map.of("package-prefix", "com.fern")));
    }
}
