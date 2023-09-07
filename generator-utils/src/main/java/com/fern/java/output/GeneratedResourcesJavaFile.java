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
import com.squareup.javapoet.ClassName;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import org.immutables.value.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GeneratedResourcesJavaFile extends GeneratedFile {

    private static final Logger log = LoggerFactory.getLogger(AbstractGeneratedJavaFile.class);

    public abstract ClassName getClassName();

    public abstract String contents();

    @Override
    public final String filename() {
        return getClassName().simpleName() + ".java";
    }

    @Override
    public final void writeToFile(Path directory, boolean isLocal, Optional<String> packagePrefix) throws IOException {
        String packageName = getClassName().packageName();
        String contentsWithPackageName = "package " + getClassName().packageName() + ";\n\n" + contents();
        if (isLocal) {
            if (packagePrefix.isPresent()) {
                String replacedPackageName = packageName.replace(packagePrefix.get(), "");
                if (replacedPackageName.startsWith(".")) {
                    replacedPackageName = replacedPackageName.substring(1);
                }
                String fileName = replacedPackageName.isEmpty()
                        ? getClassName().simpleName()
                        : replacedPackageName + "." + getClassName().simpleName();
                Path filepath = Paths.get(fileName.replace('.', '/') + ".java");
                Path resolvedFilePath = directory.resolve(filepath);
                Files.createDirectories(resolvedFilePath.getParent());
                Files.writeString(resolvedFilePath, contentsWithPackageName);
            } else {
                Path filepath = Paths.get(packageName.replace('.', '/'));
                Files.writeString(
                        directory.resolve(filepath).resolve(getClassName().simpleName() + ".java"),
                        contentsWithPackageName);
            }
        } else {
            Path filepath = Paths.get(packageName.replace('.', '/'));
            Files.writeString(
                    directory.resolve(Path.of("src/main/java/")
                            .resolve(filepath)
                            .resolve(getClassName().simpleName() + ".java")),
                    contentsWithPackageName);
        }
    }

    public static ImmutableGeneratedResourcesJavaFile.ClassNameBuildStage builder() {
        return ImmutableGeneratedResourcesJavaFile.builder();
    }
}
