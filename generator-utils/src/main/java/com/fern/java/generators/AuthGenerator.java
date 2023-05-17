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

package com.fern.java.generators;

import com.fern.irV12.model.auth.ApiAuth;
import com.fern.irV12.model.auth.AuthScheme;
import com.fern.irV12.model.auth.AuthSchemesRequirement;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.auth.AuthSchemeGenerator;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedJavaFile;
import java.util.Optional;

public final class AuthGenerator {

    private final ApiAuth apiAuth;
    private final AbstractGeneratorContext<?> generatorContext;

    public AuthGenerator(AbstractGeneratorContext<?> generatorContext) {
        this.apiAuth = generatorContext.getIr().getAuth();
        this.generatorContext = generatorContext;
    }

    public Optional<GeneratedAuthFiles> generate() {
        if (apiAuth.getSchemes().size() == 0) {
            return Optional.empty();
        } else if (apiAuth.getSchemes().size() == 1) {
            AuthScheme authScheme = apiAuth.getSchemes().get(0);
            GeneratedJavaFile generatedFile = authScheme.visit(new AuthSchemeGenerator(generatorContext));
            return Optional.of(GeneratedAuthFiles.builder()
                    .className(generatedFile.getClassName())
                    .javaFile(generatedFile.javaFile())
                    .authScheme(authScheme)
                    .build());
        } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ANY)) {
            throw new RuntimeException("Any auth is unsupported!");
        } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ALL)) {
            throw new RuntimeException("All auth is unsupported!");
        }
        throw new RuntimeException("Encountered unknown apiAuth: " + apiAuth);
    }
}
