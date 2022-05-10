package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.types.AliasTypeDefinition;
import com.types.FernFilepath;
import com.types.NamedType;
import com.types.PrimitiveType;
import com.types.Type;
import com.types.TypeDefinition;
import com.types.TypeReference;
import org.junit.jupiter.api.Test;

public final class AliasGeneratorTest {

    @Test
    public void test_basic() {
        AliasTypeDefinition aliasTypeDefinition = AliasTypeDefinition.builder()
                .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                .build();
        TypeDefinition problemIdTypeDefinition = TypeDefinition.builder()
                .shape(Type.alias(aliasTypeDefinition))
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/trace/problem"))
                        .name("ProblemId")
                        .build())
                .build();
        AliasGenerator aliasGenerator = new AliasGenerator(
                aliasTypeDefinition, PackageType.TYPES, problemIdTypeDefinition.name(),
                TestConstants.GENERATOR_CONTEXT);
        GeneratedAlias generatedAlias = aliasGenerator.generate();
        System.out.println(generatedAlias.file().toString());
    }
}
