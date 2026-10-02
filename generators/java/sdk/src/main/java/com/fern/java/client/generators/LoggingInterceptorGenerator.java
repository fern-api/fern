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

package com.fern.java.client.generators;

import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.HeaderAuthScheme;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedResourcesJavaFile;
import com.fern.java.utils.NameUtils;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public final class LoggingInterceptorGenerator extends AbstractFileGenerator {

    private static final String SENSITIVE_HEADERS_END = "\n    ));";

    public LoggingInterceptorGenerator(ClientGeneratorContext clientGeneratorContext) {
        super(
                clientGeneratorContext.getPoetClassNameFactory().getLoggingInterceptorClassName(),
                clientGeneratorContext);
    }

    @Override
    public GeneratedResourcesJavaFile generateFile() {
        try (InputStream is = LoggingInterceptorGenerator.class.getResourceAsStream("/LoggingInterceptor.java")) {
            String contents = addAuthHeadersToSensitiveHeaders(new String(is.readAllBytes(), StandardCharsets.UTF_8));
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read LoggingInterceptor.java");
        }
    }

    private String addAuthHeadersToSensitiveHeaders(String contents) {
        Set<String> authHeaders = generatorContext.getIr().getAuth().getSchemes().stream()
                .map(AuthScheme::getHeader)
                .flatMap(Optional::stream)
                .map(HeaderAuthScheme::getName)
                .map(NameUtils::getWireValue)
                .map(header -> header.toLowerCase(Locale.ROOT))
                .filter(header -> !contents.contains("\"" + header + "\""))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (authHeaders.isEmpty()) {
            return contents;
        }
        int end = contents.indexOf(SENSITIVE_HEADERS_END);
        if (end < 0) {
            throw new IllegalStateException("Could not find SENSITIVE_HEADERS in LoggingInterceptor.java");
        }
        String additions = authHeaders.stream()
                .map(header ->
                        ",\n            \"" + header.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining());
        return contents.substring(0, end) + additions + contents.substring(end);
    }
}
