package com.fern.model.codegen;

import com.fern.EnumTypeDefinition;
import com.fern.EnumValue;
import com.fern.NamedTypeReference;
import com.fern.Type;
import com.fern.TypeDefinition;
import com.fern.model.codegen._enum.EnumGenerator;
import com.fern.model.codegen._enum.GeneratedEnum;
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
                        .filepath("com/trace/migration")
                        .name("MigrationStatus")
                        .build())
                .shape(Type._enum(migrationStatusEnumDef))
                .build();
        EnumGenerator enumGenerator = new EnumGenerator(migrationStatusTypeDef.name(), migrationStatusEnumDef);
        GeneratedEnum generatedEnum = enumGenerator.generate();
        System.out.println(generatedEnum.file().toString());
    }
}
