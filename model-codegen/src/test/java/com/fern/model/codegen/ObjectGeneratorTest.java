package com.fern.model.codegen;

import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.types.ContainerType;
import com.types.FernFilepath;
import com.types.NamedType;
import com.types.ObjectProperty;
import com.types.ObjectTypeDefinition;
import com.types.PrimitiveType;
import com.types.Type;
import com.types.TypeDefinition;
import com.types.TypeReference;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class ObjectGeneratorTest {

    @Test
    public void test_basic() {
        ObjectTypeDefinition objectTypeDefinition = ObjectTypeDefinition.builder()
                .addProperties(ObjectProperty.builder()
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .key("docs")
                        .build())
                .build();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/fern"))
                        .name("WithDocs")
                        .build(),
                PackageType.TYPES,
                objectTypeDefinition,
                Collections.emptyList(),
                Optional.empty(),
                TestConstants.GENERATOR_CONTEXT);
        GeneratedObject generatedObject = objectGenerator.generate();
        System.out.println(generatedObject.file().toString());
    }

    @Test
    public void test_skipOwnFields() {
        ObjectTypeDefinition withDocsObjectTypeDefinition = ObjectTypeDefinition.builder()
                .addProperties(ObjectProperty.builder()
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .key("docs")
                        .build())
                .build();
        TypeDefinition withDocsTypeDefinition = TypeDefinition.builder()
                .shape(Type._object(withDocsObjectTypeDefinition))
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/fern"))
                        .name("WithDocs")
                        .build())
                .build();
        InterfaceGenerator interfaceGenerator = new InterfaceGenerator(
                withDocsObjectTypeDefinition, withDocsTypeDefinition.name(), TestConstants.GENERATOR_CONTEXT);
        GeneratedInterface withDocsInterface = interfaceGenerator.generate();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                withDocsTypeDefinition.name(),
                PackageType.TYPES,
                withDocsObjectTypeDefinition,
                Collections.emptyList(),
                Optional.of(withDocsInterface),
                TestConstants.GENERATOR_CONTEXT);
        GeneratedObject withDocsObject = objectGenerator.generate();
        System.out.println(withDocsObject.file().toString());
    }

    @Test
    public void test_lowerCasedClassName() {
        ObjectTypeDefinition objectTypeDefinition = ObjectTypeDefinition.builder()
                .addProperties(ObjectProperty.builder()
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .key("prop")
                        .build())
                .build();
        TypeDefinition typeDefinition = TypeDefinition.builder()
                .shape(Type._object(objectTypeDefinition))
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/fern"))
                        .name("lowercase")
                        .build())
                .build();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                typeDefinition.name(),
                PackageType.TYPES,
                objectTypeDefinition,
                Collections.emptyList(),
                Optional.empty(),
                TestConstants.GENERATOR_CONTEXT);
        GeneratedObject object = objectGenerator.generate();
        System.out.println(object.file().toString());
    }

    @Test
    public void test_underscoredProperty() {
        ObjectTypeDefinition objectTypeDefinition = ObjectTypeDefinition.builder()
                .addProperties(ObjectProperty.builder()
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .key("_class")
                        .build())
                .addProperties(ObjectProperty.builder()
                        .valueType(TypeReference.primitive(PrimitiveType.STRING))
                        .key("_returns")
                        .build())
                .build();
        TypeDefinition typeDefinition = TypeDefinition.builder()
                .shape(Type._object(objectTypeDefinition))
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/fern"))
                        .name("Test")
                        .build())
                .build();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                typeDefinition.name(),
                PackageType.TYPES,
                objectTypeDefinition,
                Collections.emptyList(),
                Optional.empty(),
                TestConstants.GENERATOR_CONTEXT);
        GeneratedObject object = objectGenerator.generate();
        System.out.println(object.file().toString());
    }
}
