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

package com.fern.codegen.generator.auth;

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.types.AuthScheme;
import com.fern.types.WithDocs;
import com.fern.types.services.HttpHeader;

public final class AuthSchemeToGeneratedFile implements AuthScheme.Visitor<GeneratedFile> {

    private final GeneratorContext generatorContext;
    private final PackageType packageType;

    public AuthSchemeToGeneratedFile(GeneratorContext generatorContext, PackageType packageType) {
        this.generatorContext = generatorContext;
        this.packageType = packageType;
    }

    @Override
    public GeneratedFile visitBearer(WithDocs value) {
        BearerAuthGenerator bearerAuthGenerator = new BearerAuthGenerator(generatorContext, packageType);
        return bearerAuthGenerator.generate();
    }

    @Override
    public GeneratedFile visitBasic(WithDocs value) {
        BasicAuthGenerator basicAuthGenerator = new BasicAuthGenerator(generatorContext, packageType);
        return basicAuthGenerator.generate();
    }

    @Override
    public GeneratedFile visitHeader(HttpHeader value) {
        HeaderAuthGenerator headerAuthGenerator = new HeaderAuthGenerator(generatorContext, packageType, value);
        return headerAuthGenerator.generate();
    }

    @Override
    public GeneratedFile visitUnknown(String unknownType) {
        throw new RuntimeException("Encountered unknown auth scheme: " + unknownType);
    }
}
