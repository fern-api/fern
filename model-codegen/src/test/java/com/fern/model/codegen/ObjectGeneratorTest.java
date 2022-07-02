package com.fern.model.codegen;

import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.types.InterfaceGenerator;
import com.fern.model.codegen.types.ObjectGenerator;
import com.fern.types.ContainerType;
import com.fern.types.DeclaredTypeName;
import com.fern.types.FernFilepath;
import com.fern.types.ObjectProperty;
import com.fern.types.ObjectTypeDeclaration;
import com.fern.types.PrimitiveType;
import com.fern.types.Type;
import com.fern.types.TypeDeclaration;
import com.fern.types.TypeReference;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class ObjectGeneratorTest {

    @Test
    public void test_basic() {
        ObjectTypeDeclaration objectTypeDeclaration = ObjectTypeDeclaration.builder()
                .addProperties(ObjectProperty.builder()
                        .key("docs")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .addProperties(ObjectProperty.builder()
                        .key("points")
                        .valueType(TypeReference.primitive(PrimitiveType.DOUBLE))
                        .build())
                .addProperties(ObjectProperty.builder()
                        .key("id")
                        .valueType(TypeReference.primitive(PrimitiveType.LONG))
                        .build())
                .build();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "fern")))
                        .name("WithDocs")
                        .build(),
                PackageType.TYPES,
                objectTypeDeclaration,
                Collections.emptyList(),
                Optional.empty(),
                TestConstants.GENERATOR_CONTEXT);
        GeneratedObject generatedObject = objectGenerator.generate();
        System.out.println(generatedObject.file().toString());
    }

    @Test
    public void test_skipOwnFields() {
        ObjectTypeDeclaration withDocsObjectTypeDefinition = ObjectTypeDeclaration.builder()
                .addProperties(ObjectProperty.builder()
                        .key("docs")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .build();
        TypeDeclaration withDocsTypeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "fern")))
                        .name("WithDocs")
                        .build())
                .shape(Type._object(withDocsObjectTypeDefinition))
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
        ObjectTypeDeclaration objectTypeDefinition = ObjectTypeDeclaration.builder()
                .addProperties(ObjectProperty.builder()
                        .key("prop")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .build();
        TypeDeclaration typeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "fern")))
                        .name("lowercase")
                        .build())
                .shape(Type._object(objectTypeDefinition))
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
        ObjectTypeDeclaration objectTypeDefinition = ObjectTypeDeclaration.builder()
                .addProperties(ObjectProperty.builder()
                        .key("_class")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .addProperties(ObjectProperty.builder()
                        .key("_returns")
                        .valueType(TypeReference.primitive(PrimitiveType.STRING))
                        .build())
                .build();
        TypeDeclaration typeDefinition = TypeDeclaration.builder()
                .name(DeclaredTypeName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("com", "fern")))
                        .name("Test")
                        .build())
                .shape(Type._object(objectTypeDefinition))
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
