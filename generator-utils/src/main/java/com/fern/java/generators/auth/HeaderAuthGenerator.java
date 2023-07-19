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

import com.fern.irV16.model.auth.HeaderAuthScheme;
import com.fern.irV16.model.types.AliasTypeDeclaration;
import com.fern.irV16.model.types.PrimitiveType;
import com.fern.irV16.model.types.ResolvedTypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.AliasGenerator;
import com.fern.java.output.GeneratedJavaFile;

public final class HeaderAuthGenerator extends AbstractFileGenerator {
    private final HeaderAuthScheme headerAuthScheme;

    public HeaderAuthGenerator(AbstractGeneratorContext<?, ?> generatorContext, HeaderAuthScheme headerAuthScheme) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getCoreClassName(headerAuthScheme
                                .getName()
                                .getName()
                                .getPascalCase()
                                .getSafeName()),
                generatorContext);
        this.headerAuthScheme = headerAuthScheme;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        // TODO(dsinghvi): Fix resolved type
        AliasTypeDeclaration aliasTypeDeclaration = AliasTypeDeclaration.builder()
                .aliasOf(headerAuthScheme.getValueType())
                .resolvedType(ResolvedTypeReference.primitive(PrimitiveType.STRING))
                .build();
        AliasGenerator aliasGenerator = new AliasGenerator(className, generatorContext, aliasTypeDeclaration, false);
        return aliasGenerator.generateFile();
    }
}
