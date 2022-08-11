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

import com.fern.codegen.GeneratedEnum;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.types.EnumGenerator;
import com.fern.types.DeclaredTypeName;
import com.fern.types.EnumTypeDeclaration;
import com.fern.types.EnumValue;
import com.fern.types.FernFilepath;
import com.fern.types.Type;
import com.fern.types.TypeDeclaration;
import java.util.List;
import org.junit.jupiter.api.Test;

public class EnumGeneratorTest {

    @Test
    public void test_basic() {
        EnumTypeDeclaration migrationStatusEnumDef = EnumTypeDeclaration.builder()
                .addValues(EnumValue.builder().name("RUNNING").value("running").build())
                .addValues(EnumValue.builder().name("FAILED").value("FAILED").build())
                .addValues(
                        EnumValue.builder().name("FINISHED").value("FINISHED").build())
                .build();
        TypeDeclaration migrationStatusTypeDef = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "trace", "migration")))
                        .name("MigrationStatus")
                        .build())
                .shape(Type._enum(migrationStatusEnumDef))
                .build();
        EnumGenerator enumGenerator = new EnumGenerator(
                migrationStatusTypeDef.name(), migrationStatusEnumDef, TestConstants.GENERATOR_CONTEXT);
        GeneratedEnum generatedEnum = enumGenerator.generate();
        System.out.println(generatedEnum.file().toString());
    }
}
