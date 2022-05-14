package com.fern.model.codegen;

import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.fern.types.types.EnumTypeDefinition;
import com.fern.types.types.EnumValue;
import com.fern.types.types.FernFilepath;
import com.fern.types.types.NamedType;
import com.fern.types.types.Type;
import com.fern.types.types.TypeDefinition;
import org.junit.jupiter.api.Test;

public class EnumGeneratorTest {

    @Test
    public void test_basic() {
        EnumTypeDefinition migrationStatusEnumDef = EnumTypeDefinition.builder()
                .addValues(EnumValue.builder().name("RUNNING").value("running").build())
                .addValues(EnumValue.builder().name("FAILED").value("FAILED").build())
                .addValues(EnumValue.builder().name("FINISHED").value("FINISHED").build())
                .build();
        TypeDefinition migrationStatusTypeDef = TypeDefinition.builder()
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/trace/migration"))
                        .name("MigrationStatus")
                        .build())
                .shape(Type._enum(migrationStatusEnumDef))
                .build();
        EnumGenerator enumGenerator = new EnumGenerator(
                migrationStatusTypeDef.name(), PackageType.TYPES, migrationStatusEnumDef,
                TestConstants.GENERATOR_CONTEXT);
        GeneratedEnum generatedEnum = enumGenerator.generate();
        System.out.println(generatedEnum.file().toString());
    }
}
