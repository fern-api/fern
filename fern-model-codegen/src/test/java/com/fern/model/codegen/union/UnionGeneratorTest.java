package com.fern.model.codegen.union;

import com.fern.ContainerType;
import com.fern.FernFilepath;
import com.fern.NamedType;
import com.fern.PrimitiveType;
import com.fern.SingleUnionType;
import com.fern.Type;
import com.fern.TypeDefinition;
import com.fern.TypeReference;
import com.fern.UnionTypeDefinition;
import com.fern.model.codegen.GeneratorContext;
import com.fern.model.codegen.TestConstants;
import java.util.Collections;
import org.junit.jupiter.api.Test;

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
                        .valueType(TypeReference.container(
                                ContainerType.list(TypeReference.named(NamedType.builder()
                                        .name("VariableValue")
                                        .fernFilepath(FernFilepath.valueOf("com/birch/trace/commons"))
                                        .build()))))
                        .build())
                .build();
        TypeDefinition variableValueTypeDefinition = TypeDefinition.builder()
                .name(NamedType.builder()
                        .name("VariableValue")
                        .fernFilepath(FernFilepath.valueOf("com/birch/trace/commons"))
                        .build())
                .shape(Type.union(unionTypeDefinition))
                .build();
        GeneratorContext generatorContext = new GeneratorContext(TestConstants.PLUGIN_CONFIG,
                Collections.singletonMap(variableValueTypeDefinition.name(), variableValueTypeDefinition));
        UnionGenerator unionGenerator = new UnionGenerator(
                variableValueTypeDefinition.name(),
                unionTypeDefinition,
                generatorContext);
        GeneratedUnion generatedUnion = unionGenerator.generate();
        System.out.println(generatedUnion.file().toString());
    }
}
