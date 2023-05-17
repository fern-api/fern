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

package com.fern.java.generators.auth;

import com.fern.irV12.model.auth.AuthScheme;
import com.fern.irV12.model.auth.HeaderAuthScheme;
import com.fern.irV12.model.commons.WithDocs;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;

public final class AuthSchemeGenerator implements AuthScheme.Visitor<GeneratedJavaFile> {

    private final AbstractGeneratorContext<?> generatorContext;

    public AuthSchemeGenerator(AbstractGeneratorContext<?> generatorContext) {
        this.generatorContext = generatorContext;
    }

    @Override
    public GeneratedJavaFile visitBearer(WithDocs value) {
        BearerAuthGenerator bearerAuthGenerator = new BearerAuthGenerator(generatorContext);
        return bearerAuthGenerator.generateFile();
    }

    @Override
    public GeneratedJavaFile visitBasic(WithDocs value) {
        BasicAuthGenerator basicAuthGenerator = new BasicAuthGenerator(generatorContext);
        return basicAuthGenerator.generateFile();
    }

    @Override
    public GeneratedJavaFile visitHeader(HeaderAuthScheme value) {
        HeaderAuthGenerator headerAuthGenerator = new HeaderAuthGenerator(generatorContext, value);
        return headerAuthGenerator.generateFile();
    }

    @Override
    public GeneratedJavaFile _visitUnknown(Object unknown) {
        throw new RuntimeException("Encountered unknown auth scheme: " + unknown);
    }
}
