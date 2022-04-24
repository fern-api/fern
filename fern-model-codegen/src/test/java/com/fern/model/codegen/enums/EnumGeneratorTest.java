package com.fern.model.codegen.enums;

import com.fern.model.codegen.TestConstants;
import com.types.EnumTypeDefinition;
import com.types.EnumValue;
import com.types.FernFilepath;
import com.types.NamedType;
import com.types.Type;
import com.types.TypeDefinition;
import org.junit.jupiter.api.Test;

public class EnumGeneratorTest {

    @Test
    public void test_basic() {
        EnumTypeDefinition migrationStatusEnumDef = EnumTypeDefinition.builder()
                .addValues(EnumValue.builder().value("RUNNING").build())
                .addValues(EnumValue.builder().value("FAILED").build())
                .addValues(EnumValue.builder().value("FINISHED").build())
                .build();
        TypeDefinition migrationStatusTypeDef = TypeDefinition.builder()
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/trace/migration"))
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
