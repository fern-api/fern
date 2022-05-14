package com.fern.model.codegen;

import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.fern.types.types.ContainerType;
import com.fern.types.types.FernFilepath;
import com.fern.types.types.NamedType;
import com.fern.types.types.PrimitiveType;
import com.fern.types.types.SingleUnionType;
import com.fern.types.types.Type;
import com.fern.types.types.TypeDefinition;
import com.fern.types.types.TypeReference;
import com.fern.types.types.UnionTypeDefinition;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class UnionGeneratorTest {

    @Test
    public void test_basic() {
        UnionTypeDefinition unionTypeDefinition = UnionTypeDefinition.builder()
                .discriminant("_type")
                .addTypes(SingleUnionType.builder()
                        .valueType(TypeReference.primitive(PrimitiveType.INTEGER))
                        .discriminantValue("integerValue")
                        .build())
                .addTypes(SingleUnionType.builder()
                        .valueType(TypeReference.primitive(PrimitiveType.BOOLEAN))
                        .discriminantValue("booleanValue")
                        .build())
                .addTypes(SingleUnionType.builder()
                        .valueType(TypeReference.primitive(PrimitiveType.DOUBLE))
                        .discriminantValue("doubleValue")
                        .build())
                .addTypes(SingleUnionType.builder()
                        .valueType(TypeReference.primitive(PrimitiveType.STRING))
                        .discriminantValue("stringValue")
                        .build())
                .addTypes(SingleUnionType.builder()
                        .valueType(TypeReference.primitive(PrimitiveType.STRING))
                        .discriminantValue("charValue")
                        .build())
                .addTypes(SingleUnionType.builder()
                        .valueType(TypeReference.container(ContainerType.list(TypeReference.named(NamedType.builder()
                                .fernFilepath(FernFilepath.valueOf("com/birch/trace/commons"))
                                .name("VariableValue")
                                .build()))))
                        .discriminantValue("mapValue")
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
                        .valueType(TypeReference.primitive(PrimitiveType.INTEGER))
                        .discriminantValue("integervalue")
                        .build())
                .addTypes(SingleUnionType.builder()
                        .valueType(TypeReference.primitive(PrimitiveType.BOOLEAN))
                        .discriminantValue("booleanvalue")
                        .build())
                .addTypes(SingleUnionType.builder()
                        .valueType(TypeReference.primitive(PrimitiveType.DOUBLE))
                        .discriminantValue("doublevalue")
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
