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

package com.fern.jersey.client;

import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.ir.model.declaration.Availability;
import com.fern.ir.model.declaration.AvailabilityStatus;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.model.codegen.TypeDefinitionGenerator;
import com.squareup.javapoet.ClassName;
import java.util.Map;

public final class ClientErrorGenerator {
    private final ErrorDeclaration errorDeclaration;
    private final ClassName errorClassName;
    private final GeneratorContext generatorContext;
    private final Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces;

    public ClientErrorGenerator(
            ErrorDeclaration errorDeclaration,
            GeneratorContext generatorContext,
            Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces) {
        ClientClassNameUtils clientClassNameUtils =
                new ClientClassNameUtils(generatorContext.getIr(), generatorContext.getOrganization());
        this.errorDeclaration = errorDeclaration;
        this.generatorContext = generatorContext;
        this.errorClassName = clientClassNameUtils.getClassName(errorDeclaration);
        this.generatedInterfaces = generatedInterfaces;
    }

    public IGeneratedFile generate() {
        IGeneratedFile generatedFile = errorDeclaration
                .getType()
                .visit(new TypeDefinitionGenerator(
                        TypeDeclaration.builder()
                                // TODO(dsinghvi): use errorDeclaration availablity
                                .availability(Availability.builder()
                                        .status(AvailabilityStatus.GENERAL_AVAILABILITY)
                                        .build())
                                .name(DeclaredTypeName.builder()
                                        .fernFilepath(errorDeclaration.getName().getFernFilepath())
                                        .fernFilepathV2(
                                                errorDeclaration.getName().getFernFilepathV2())
                                        .name(errorClassName.simpleName())
                                        .nameV2(errorDeclaration.getName().getNameV2())
                                        .nameV3(errorDeclaration.getName().getNameV3())
                                        .build())
                                .shape(errorDeclaration.getType())
                                .build(),
                        generatorContext,
                        generatedInterfaces,
                        errorClassName));
        return generatedFile;
    }
}
