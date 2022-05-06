package com.fern.model.codegen;

import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.types.ContainerType;
import com.types.FernFilepath;
import com.types.NamedType;
import com.types.PrimitiveType;
import com.types.SingleUnionType;
import com.types.Type;
import com.types.TypeDefinition;
import com.types.TypeReference;
import com.types.UnionTypeDefinition;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class UnionGeneratorTest {

    @Test
    public void test_basic() {
        UnionTypeDefinition unionTypeDefinition = UnionTypeDefinition.builder()
                .discriminant("_type")
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
                        .valueType(TypeReference.container(ContainerType.list(TypeReference.named(NamedType.builder()
                                .fernFilepath(FernFilepath.valueOf("com/birch/trace/commons"))
                                .name("VariableValue")
                                .build()))))
                        .build())
                .build();
        TypeDefinition variableValueTypeDefinition = TypeDefinition.builder()
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/birch/trace/commons"))
                        .name("VariableValue")
                        .build())
                .shape(Type.union(unionTypeDefinition))
                .build();
        GeneratorContext generatorContext = new GeneratorContext(
                Optional.of(TestConstants.PACKAGE_PREFIX),
                Collections.singletonMap(variableValueTypeDefinition.name(), variableValueTypeDefinition));
        UnionGenerator unionGenerator = new UnionGenerator(
                variableValueTypeDefinition.name(),
                PackageType.TYPES,
                unionTypeDefinition,
                generatorContext);
        GeneratedUnion generatedUnion = unionGenerator.generate();
        System.out.println(generatedUnion.file().toString());
    }

    @Test
    public void test_nonCamelCaseDiscriminants() {
        UnionTypeDefinition unionTypeDefinition = UnionTypeDefinition.builder()
                .discriminant("_type")
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("integervalue")
                        .valueType(TypeReference.primitive(PrimitiveType.INTEGER))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("booleanvalue")
                        .valueType(TypeReference.primitive(PrimitiveType.BOOLEAN))
                        .build())
                .addTypes(SingleUnionType.builder()
                        .discriminantValue("doublevalue")
                        .valueType(TypeReference.primitive(PrimitiveType.DOUBLE))
                        .build())
                .build();
        TypeDefinition variableValueTypeDefinition = TypeDefinition.builder()
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/birch/trace/commons"))
                        .name("VariableValue")
                        .build())
                .shape(Type.union(unionTypeDefinition))
                .build();
        GeneratorContext generatorContext = new GeneratorContext(Optional.of(TestConstants.PACKAGE_PREFIX),
                Collections.singletonMap(variableValueTypeDefinition.name(), variableValueTypeDefinition));
        UnionGenerator unionGenerator = new UnionGenerator(
                variableValueTypeDefinition.name(),
                PackageType.TYPES,
                unionTypeDefinition,
                generatorContext);
        GeneratedUnion generatedUnion = unionGenerator.generate();
        System.out.println(generatedUnion.file().toString());
    }
}
