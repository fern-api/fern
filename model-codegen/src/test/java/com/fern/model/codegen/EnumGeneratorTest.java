package com.fern.model.codegen;

import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.types.EnumGenerator;
import com.fern.types.types.DeclaredTypeName;
import com.fern.types.types.EnumTypeDeclaration;
import com.fern.types.types.EnumValue;
import com.fern.types.types.FernFilepath;
import com.fern.types.types.Type;
import com.fern.types.types.TypeDeclaration;
import org.junit.jupiter.api.Test;

public class EnumGeneratorTest {

    @Test
    public void test_basic() {
        EnumTypeDeclaration migrationStatusEnumDef = EnumTypeDeclaration.builder()
                .addValues(EnumValue.builder().name("RUNNING").value("running").build())
                .addValues(EnumValue.builder().name("FAILED").value("FAILED").build())
                .addValues(EnumValue.builder().name("FINISHED").value("FINISHED").build())
                .build();
        TypeDeclaration migrationStatusTypeDef = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
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
