package com.fern.model.codegen;

import com.fern.*;
import org.junit.jupiter.api.Test;

import java.util.Collections;

public class UnionGeneratorTest {

    @Test
    public void test_basic() {
        UnionTypeDefinition unionTypeDefinition = UnionTypeDefinition.builder()
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
                        .valueType(TypeReference.container(ContainerType.list(TypeReference.named(NamedTypeReference.builder()
                                .filepath("com/birch/trace/commons")
                                .name("VariableValue")
                                .build()))))
                        .build())
                .build();
        TypeDefinition variableValueTypeDefinition = TypeDefinition.builder()
                .name(NamedTypeReference.builder()
                        .filepath("com/birch/trace/commons")
                        .name("VariableValue")
                        .build())
                .shape(Type.union(unionTypeDefinition))
                .build();
        GeneratedUnion generatedUnion = UnionGenerator.generate(
                variableValueTypeDefinition.name(),
                unionTypeDefinition,
                Collections.singletonMap(variableValueTypeDefinition.name(), variableValueTypeDefinition));
        System.out.println(generatedUnion.file().toString());
    }
}
