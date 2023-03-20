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

package com.fern.java.client.generators;

import com.fern.ir.v3.model.errors.ErrorDeclaration;
import com.fern.ir.v3.model.types.DeclaredTypeName;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.SingleTypeGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import java.util.Map;

public final class ClientErrorGenerator extends AbstractFileGenerator {
    private final ErrorDeclaration errorDeclaration;
    private final Map<DeclaredTypeName, GeneratedJavaInterface> generatedInterfaces;

    public ClientErrorGenerator(
            ErrorDeclaration errorDeclaration,
            ClientGeneratorContext clientGeneratorContext,
            Map<DeclaredTypeName, GeneratedJavaInterface> generatedInterfaces) {
        super(
                clientGeneratorContext.getPoetClassNameFactory().getErrorClassName(errorDeclaration),
                clientGeneratorContext);
        this.errorDeclaration = errorDeclaration;
        this.generatedInterfaces = generatedInterfaces;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        return errorDeclaration
                .getType()
                .visit(new SingleTypeGenerator(
                        generatorContext,
                        DeclaredTypeName.builder()
                                .fernFilepath(errorDeclaration.getName().getFernFilepath())
                                .fernFilepathV2(errorDeclaration.getName().getFernFilepathV2())
                                .name(errorDeclaration.getName().getName())
                                .nameV2(errorDeclaration.getName().getNameV2())
                                .nameV3(errorDeclaration.getName().getNameV3())
                                .build(),
                        className,
                        generatedInterfaces,
                        true))
                .get();
    }
}
