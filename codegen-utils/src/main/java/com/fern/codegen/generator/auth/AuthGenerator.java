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

import com.fern.codegen.GeneratedAuthSchemes;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.ir.model.auth.ApiAuth;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.AuthSchemesRequirement;
import java.util.Optional;

public final class AuthGenerator {

    private final ApiAuth apiAuth;
    private final GeneratorContext generatorContext;
    private final String apiName;
    private final PackageType packageType;

    public AuthGenerator(ApiAuth apiAuth, GeneratorContext generatorContext, String apiName, PackageType packageType) {
        this.apiAuth = apiAuth;
        this.generatorContext = generatorContext;
        this.apiName = apiName;
        this.packageType = packageType;
    }

    public Optional<GeneratedAuthSchemes> generate() {
        if (apiAuth.getSchemes().size() == 0) {
            return Optional.empty();
        } else if (apiAuth.getSchemes().size() == 1) {
            AuthScheme authScheme = apiAuth.getSchemes().get(0);
            GeneratedFile generatedFile =
                    authScheme.visit(new AuthSchemeToGeneratedFile(generatorContext, packageType));
            return Optional.of(GeneratedAuthSchemes.builder()
                    .file(generatedFile.file())
                    .className(generatedFile.className())
                    .putGeneratedAuthSchemes(authScheme, generatedFile)
                    .build());
        } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ANY)) {
            AnyAuthGenerator anyAuthGenerator =
                    new AnyAuthGenerator(generatorContext, packageType, apiName, apiAuth.getSchemes());
            return Optional.of(anyAuthGenerator.generate());
        } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ALL)) {
            AllAuthGenerator allAuthGenerator =
                    new AllAuthGenerator(generatorContext, packageType, apiName, apiAuth.getSchemes());
            return Optional.of(allAuthGenerator.generate());
        }
        return Optional.empty();
    }
}
