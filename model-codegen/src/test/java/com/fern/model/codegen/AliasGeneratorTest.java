package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.types.AliasGenerator;
import com.fern.types.types.AliasTypeDeclaration;
import com.fern.types.types.DeclaredTypeName;
import com.fern.types.types.FernFilepath;
import com.fern.types.types.PrimitiveType;
import com.fern.types.types.Type;
import com.fern.types.types.TypeDeclaration;
import com.fern.types.types.TypeReference;
import org.junit.jupiter.api.Test;

public final class AliasGeneratorTest {

    @Test
    public void test_basic() {
        AliasTypeDeclaration aliasTypeDefinition = AliasTypeDeclaration.builder()
                .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                .build();
        TypeDeclaration problemIdTypeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf("com/trace/problem"))
                        .name("ProblemId")
                        .build())
                .shape(Type.alias(aliasTypeDefinition))
                .build();
        AliasGenerator aliasGenerator = new AliasGenerator(
                aliasTypeDefinition, PackageType.TYPES, problemIdTypeDefinition.name(),
                TestConstants.GENERATOR_CONTEXT);
        GeneratedAlias generatedAlias = aliasGenerator.generate();
        System.out.println(generatedAlias.file().toString());
    }
}
