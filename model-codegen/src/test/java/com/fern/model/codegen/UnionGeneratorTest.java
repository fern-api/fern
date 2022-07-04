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

import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.types.UnionGenerator;
import com.fern.types.ContainerType;
import com.fern.types.DeclaredTypeName;
import com.fern.types.FernFilepath;
import com.fern.types.PrimitiveType;
import com.fern.types.SingleUnionType;
import com.fern.types.Type;
import com.fern.types.TypeDeclaration;
import com.fern.types.TypeReference;
import com.fern.types.UnionTypeDeclaration;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class UnionGeneratorTest {

    @Test
    public void test_basic() {
        UnionTypeDeclaration unionTypeDefinition = UnionTypeDeclaration.builder()
                .discriminant("_type")
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("integerValue")
                        .valueType(TypeReference.primitive(PrimitiveType.INTEGER))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("booleanValue")
                        .valueType(TypeReference.primitive(PrimitiveType.BOOLEAN))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("doubleValue")
                        .valueType(TypeReference.primitive(PrimitiveType.DOUBLE))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("stringValue")
                        .valueType(TypeReference.primitive(PrimitiveType.STRING))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("charValue")
                        .valueType(TypeReference.primitive(PrimitiveType.STRING))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("mapValue")
                        .valueType(TypeReference.container(
                                ContainerType.list(TypeReference.named(DeclaredTypeName.builder()
                                        .fernFilepath(FernFilepath.valueOf(List.of("com", "birch", "trace", "commons")))
                                        .name("VariableValue")
                                        .build()))))
                        .build())
                .build();
        TypeDeclaration variableValueTypeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "birch", "trace", "commons")))
                        .name("VariableValue")
                        .build())
                .shape(Type.union(unionTypeDefinition))
                .build();
        GeneratorContext generatorContext = new GeneratorContext(
                Optional.of(TestConstants.PACKAGE_PREFIX),
                Collections.singletonMap(variableValueTypeDefinition.name(), variableValueTypeDefinition),
                Collections.emptyMap(),
                TestConstants.FERN_CONSTANTS);
        UnionGenerator unionGenerator = new UnionGenerator(
                variableValueTypeDefinition.name(), PackageType.TYPES, unionTypeDefinition, generatorContext);
        GeneratedUnion generatedUnion = unionGenerator.generate();
        System.out.println(generatedUnion.file().toString());
    }

    @Test
    public void test_nonCamelCaseDiscriminants() {
        UnionTypeDeclaration unionTypeDefinition = UnionTypeDeclaration.builder()
                .discriminant("_type")
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("integervalue")
                        .valueType(TypeReference.primitive(PrimitiveType.INTEGER))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("booleanvalue")
                        .valueType(TypeReference.primitive(PrimitiveType.BOOLEAN))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("doublevalue")
                        .valueType(TypeReference.primitive(PrimitiveType.DOUBLE))
                        .build())
                .build();
        TypeDeclaration variableValueTypeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "birch", "trace", "commons")))
                        .name("VariableValue")
                        .build())
                .shape(Type.union(unionTypeDefinition))
                .build();
        GeneratorContext generatorContext = new GeneratorContext(
                Optional.of(TestConstants.PACKAGE_PREFIX),
                Collections.singletonMap(variableValueTypeDefinition.name(), variableValueTypeDefinition),
                Collections.emptyMap(),
                TestConstants.FERN_CONSTANTS);
        UnionGenerator unionGenerator = new UnionGenerator(
                variableValueTypeDefinition.name(), PackageType.TYPES, unionTypeDefinition, generatorContext);
        GeneratedUnion generatedUnion = unionGenerator.generate();
        System.out.println(generatedUnion.file().toString());
    }
}
