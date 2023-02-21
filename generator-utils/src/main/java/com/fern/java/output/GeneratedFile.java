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

package com.fern.java.output;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;

public abstract class GeneratedFile {

    public abstract String filename();

    public abstract Optional<String> directoryPrefix();

    public final void write(Path directory, boolean isLocal) {
        Path outputDirectory = directory;
        if (directoryPrefix().isPresent()) {
            outputDirectory = directory.resolve(directoryPrefix().get());
            if (!outputDirectory.toFile().exists()) {
                outputDirectory.toFile().mkdirs();
            }
        }
        try {
            writeToFile(outputDirectory, isLocal);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write " + outputDirectory.resolve(filename()));
        }
    }

    protected abstract void writeToFile(Path directory, boolean isLocal) throws IOException;
}
