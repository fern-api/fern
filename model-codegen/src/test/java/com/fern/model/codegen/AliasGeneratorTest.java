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
package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.types.AliasGenerator;
import com.fern.types.AliasTypeDeclaration;
import com.fern.types.ContainerType;
import com.fern.types.DeclaredTypeName;
import com.fern.types.FernFilepath;
import com.fern.types.PrimitiveType;
import com.fern.types.Type;
import com.fern.types.TypeDeclaration;
import com.fern.types.TypeReference;
import java.util.List;
import org.junit.jupiter.api.Test;

public final class AliasGeneratorTest {

    @Test
    public void test_basic() {
        AliasTypeDeclaration aliasTypeDefinition = AliasTypeDeclaration.builder()
                .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                .build();
        TypeDeclaration problemIdTypeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "trace", "problem")))
                        .name("ProblemId")
                        .build())
                .shape(Type.alias(aliasTypeDefinition))
                .build();
        AliasGenerator aliasGenerator = new AliasGenerator(
                aliasTypeDefinition, problemIdTypeDefinition.name(), TestConstants.GENERATOR_CONTEXT);
        GeneratedAlias generatedAlias = aliasGenerator.generate();
        System.out.println(generatedAlias.file().toString());
    }

    @Test
    public void test_container() {
        AliasTypeDeclaration aliasTypeDefinition = AliasTypeDeclaration.builder()
                .aliasOf(TypeReference.container(ContainerType.list(TypeReference.primitive(PrimitiveType.STRING))))
                .build();
        TypeDeclaration problemIdTypeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "trace", "problem")))
                        .name("AliasTest")
                        .build())
                .shape(Type.alias(aliasTypeDefinition))
                .build();
        AliasGenerator aliasGenerator = new AliasGenerator(
                aliasTypeDefinition, problemIdTypeDefinition.name(), TestConstants.GENERATOR_CONTEXT);
        GeneratedAlias generatedAlias = aliasGenerator.generate();
        System.out.println(generatedAlias.file().toString());
    }
}
