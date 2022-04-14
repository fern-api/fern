package com.fern.model.codegen;

import com.fern.AliasTypeDefinition;
import com.fern.NamedTypeReference;
import com.fern.PrimitiveType;
import com.fern.Type;
import com.fern.TypeDefinition;
import com.fern.TypeReference;
import com.fern.model.codegen.alias.AliasGenerator;
import com.fern.model.codegen.alias.GeneratedAlias;
import org.junit.jupiter.api.Test;

public final class AliasGeneratorTest {

    @Test
    public void test_basic() {
        AliasTypeDefinition aliasTypeDefinition = AliasTypeDefinition.builder()
                .name("")
                .aliasType(TypeReference.primitive(PrimitiveType.STRING))
                .build();
        TypeDefinition problemIdTypeDefinition = TypeDefinition.builder()
                .name(NamedTypeReference.builder()
                        .filepath("com/trace/problem")
                        .name("ProblemId")
                        .build())
                .shape(Type.alias(aliasTypeDefinition))
                .build();
        AliasGenerator aliasGenerator = new AliasGenerator(aliasTypeDefinition, problemIdTypeDefinition.name());
        GeneratedAlias generatedAlias = aliasGenerator.generate();
        System.out.println(generatedAlias.file().toString());
    }
}
