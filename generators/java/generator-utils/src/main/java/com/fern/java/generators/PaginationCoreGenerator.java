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

import static com.fern.java.GeneratorLogging.logError;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.DefaultGeneratorExecClient;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

public final class PaginationCoreGenerator extends AbstractFilesGenerator {
    public static final String GET_MODULE_METHOD_NAME = "getModule";
    private final DefaultGeneratorExecClient generatorExecClient;

    public PaginationCoreGenerator(
            AbstractGeneratorContext<?, ?> generatorContext, DefaultGeneratorExecClient generatorExecClient) {
        super(generatorContext);
        this.generatorExecClient = generatorExecClient;
    }

    @Override
    public List<GeneratedFile> generateFiles() {
        boolean hasPaginatedEndpoints = generatorContext.getIr().getSdkConfig().getHasPaginatedEndpoints();
        if (!hasPaginatedEndpoints) {
            return List.of();
        }
        Boolean generatePaginatedClients = generatorContext
                .getGeneratorConfig()
                .getGeneratePaginatedClients()
                .orElse(false);
        if (!generatePaginatedClients) {
            logError(
                    generatorExecClient,
                    "Pagination is not supported in your current Java SDK plan; falling back to returning full"
                            + " response types. Please reach out to the Fern team!");
            return List.of();
        }

        List<String> fileNames = List.of(
                "BasePage", "SyncPage", "SyncPagingIterable", "BiDirectionalPage", "CustomPager", "AsyncCustomPager");

        return fileNames.stream()
                .map(fileName -> {
                    String fullFileName = "/" + fileName + ".java";
                    try (InputStream is = PaginationCoreGenerator.class.getResourceAsStream(fullFileName)) {
                        if (is == null) {
                            throw new RuntimeException("Resource not found: " + fullFileName);
                        }
                        String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                        // Apply custom pager name if configured
                        String customPagerName = generatorContext.getCustomConfig() != null
                                ? generatorContext
                                        .getCustomConfig()
                                        .customPagerName()
                                        .orElse(null)
                                : null;

                        if (customPagerName != null
                                && (fileName.equals("CustomPager") || fileName.equals("AsyncCustomPager"))) {
                            // Replace class name in the file content
                            if (fileName.equals("CustomPager")) {
                                contents = contents.replace(
                                        "public class CustomPager<T>", "public class " + customPagerName + "<T>");
                                contents = contents.replace("CustomPager<T>", customPagerName + "<T>");
                                contents = contents.replace("CustomPager.create(", customPagerName + ".create(");
                                contents = contents.replace(
                                        "CustomPager must be implemented", customPagerName + " must be implemented");
                                contents = contents.replace("CustomPager.", customPagerName + ".");
                                contents =
                                        contents.replace("core/CustomPager.java", "core/" + customPagerName + ".java");
                                // Replace in example code
                                contents = contents.replace("public CustomPager(", "public " + customPagerName + "(");
                                contents = contents.replace("new CustomPager ", "new " + customPagerName + " ");
                                fileName = customPagerName;
                            } else { // AsyncCustomPager
                                String asyncName = "Async" + customPagerName;
                                contents = contents.replace(
                                        "public class AsyncCustomPager<T>", "public class " + asyncName + "<T>");
                                contents = contents.replace("AsyncCustomPager<T>", asyncName + "<T>");
                                contents =
                                        contents.replace("AsyncCustomPager.createAsync(", asyncName + ".createAsync(");
                                contents = contents.replace(
                                        "AsyncCustomPager must be implemented", asyncName + " must be implemented");
                                contents = contents.replace("AsyncCustomPager.", asyncName + ".");
                                contents =
                                        contents.replace("core/AsyncCustomPager.java", "core/" + asyncName + ".java");
                                // Replace in example code
                                contents = contents.replace("public AsyncCustomPager(", "public " + asyncName + "(");
                                contents = contents.replace("new AsyncCustomPager<>(", "new " + asyncName + "<>(");
                                fileName = asyncName;
                            }
                        }

                        return GeneratedResourcesJavaFile.builder()
                                .className(generatorContext
                                        .getPoetClassNameFactory()
                                        .getPaginationClassName(fileName))
                                .contents(contents)
                                .build();
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to read " + fullFileName, e);
                    }
                })
                .collect(Collectors.toList());
    }
}
