package com.fern.model.codegen;

import com.fern.*;
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
                .name(NamedTypeReference.builder()
                        .name("MigrationStatus")
                        ._package("com.trace.migration").build())
                .shape(Type._enum(migrationStatusEnumDef))
                .build();
        GeneratedEnum generatedEnum =
                EnumGenerator.generate(migrationStatusTypeDef.name(), migrationStatusEnumDef);
        System.out.println(generatedEnum.file().toString());
    }

}
