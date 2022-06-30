package com.fern.model.codegen;

import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.types.UnionGenerator;
import com.fern.types.types.ContainerType;
import com.fern.types.types.DeclaredTypeName;
import com.fern.types.types.FernFilepath;
import com.fern.types.types.PrimitiveType;
import com.fern.types.types.SingleUnionType;
import com.fern.types.types.Type;
import com.fern.types.types.TypeDeclaration;
import com.fern.types.types.TypeReference;
import com.fern.types.types.UnionTypeDeclaration;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class UnionGeneratorTest {

    @Test
    public void test_basic() {
        UnionTypeDeclaration unionTypeDefinition = UnionTypeDeclaration.builder()
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
                        .valueType(TypeReference.container(ContainerType.list(TypeReference.named(
                                DeclaredTypeName.builder()
                                        .fernFilepath(FernFilepath.valueOf(List.of("com", "birch", "trace", "commons")))
                                        .name("VariableValue")
                                        .build()))))
                        .build())
                .build();
        TypeDeclaration variableValueTypeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "birch", "trace", "commons")))
                        .name("VariableValue")
                        .build())
                .shape(Type.union(unionTypeDefinition))
                .build();
        GeneratorContext generatorContext = new GeneratorContext(
                Optional.of(TestConstants.PACKAGE_PREFIX),
                Collections.singletonMap(variableValueTypeDefinition.name(), variableValueTypeDefinition),
                Collections.emptyMap());
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
        UnionTypeDeclaration unionTypeDefinition = UnionTypeDeclaration.builder()
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
        TypeDeclaration variableValueTypeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "birch", "trace", "commons")))
                        .name("VariableValue")
                        .build())
                .shape(Type.union(unionTypeDefinition))
                .build();
        GeneratorContext generatorContext = new GeneratorContext(Optional.of(TestConstants.PACKAGE_PREFIX),
                Collections.singletonMap(variableValueTypeDefinition.name(), variableValueTypeDefinition),
                Collections.emptyMap());
        UnionGenerator unionGenerator = new UnionGenerator(
                variableValueTypeDefinition.name(),
                PackageType.TYPES,
                unionTypeDefinition,
                generatorContext);
        GeneratedUnion generatedUnion = unionGenerator.generate();
        System.out.println(generatedUnion.file().toString());
    }
}
