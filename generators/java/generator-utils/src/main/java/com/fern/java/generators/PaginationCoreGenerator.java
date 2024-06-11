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

package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

public final class PaginationCoreGenerator extends AbstractFilesGenerator {
    public static final String GET_MODULE_METHOD_NAME = "getModule";

    public PaginationCoreGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext);
    }

    @Override
    public List<GeneratedFile> generateFiles() {
        Boolean generatePaginatedClients = generatorContext
                .getGeneratorConfig()
                .getGeneratePaginatedClients()
                .orElse(false);
        // todo: check if we should generate pagination

        List<String> fileNames = List.of("BasePage", "SyncPage", "SyncPagingIterable");

        return fileNames.stream()
                .map(fileName -> {
                    try (InputStream is = PaginationCoreGenerator.class.getResourceAsStream("/" + fileName + ".java")) {
                        String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                        return GeneratedResourcesJavaFile.builder()
                                .className(generatorContext
                                        .getPoetClassNameFactory()
                                        .getPaginationClassName(fileName))
                                .contents(contents)
                                .build();
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to read Stream.java");
                    }
                })
                .collect(Collectors.toList());
    }
}
