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

import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class AbstractGeneratedJavaFile extends GeneratedFile {

    private static final Logger log = LoggerFactory.getLogger(AbstractGeneratedJavaFile.class);

    public abstract ClassName getClassName();

    public abstract JavaFile javaFile();

    public abstract Optional<Boolean> testFile();

    @Override
    public final String filename() {
        return getClassName().simpleName() + ".java";
    }

    @Override
    public final void writeToFile(Path directory, boolean isLocal, Optional<String> packagePrefix) throws IOException {
        if (isLocal) {
            if (packagePrefix.isPresent()) {
                String contents = javaFile().toString();
                String replacedPackageName = javaFile().packageName.replace(packagePrefix.get(), "");
                if (replacedPackageName.startsWith(".")) {
                    replacedPackageName = replacedPackageName.substring(1);
                }
                String fileName = replacedPackageName.isEmpty()
                        ? javaFile().typeSpec.name
                        : replacedPackageName + "." + javaFile().typeSpec.name;
                Path filepath = Paths.get(fileName.replace('.', '/') + ".java");
                Path resolvedFilePath = directory.resolve(filepath);
                Files.createDirectories(resolvedFilePath.getParent());
                Files.writeString(resolvedFilePath, contents);
            } else {
                javaFile().writeToFile(directory.toFile());
            }
        } else if (testFile().isPresent() && testFile().get()) {
            javaFile().writeToFile(directory.resolve("src/test/java").toFile());
        } else {
            javaFile().writeToFile(directory.resolve("src/main/java").toFile());
        }
    }
}
