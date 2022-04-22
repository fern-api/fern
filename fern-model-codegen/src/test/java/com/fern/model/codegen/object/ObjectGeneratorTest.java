package com.fern.model.codegen.object;

import com.fern.ContainerType;
import com.fern.FernFilepath;
import com.fern.NamedType;
import com.fern.ObjectProperty;
import com.fern.ObjectTypeDefinition;
import com.fern.PrimitiveType;
import com.fern.Type;
import com.fern.TypeDefinition;
import com.fern.TypeReference;
import com.fern.model.codegen.TestConstants;
import com.fern.model.codegen.interfaces.GeneratedInterface;
import com.fern.model.codegen.interfaces.InterfaceGenerator;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class ObjectGeneratorTest {

    @Test
    public void test_basic() {
        ObjectTypeDefinition objectTypeDefinition = ObjectTypeDefinition.builder()
                .addProperties(ObjectProperty.builder()
                        .key("docs")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .build();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                NamedType.builder()
                        .name("WithDocs")
                        .fernFilepath(FernFilepath.valueOf("com/fern"))
                        .build(),
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
                        .key("docs")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .build();
        TypeDefinition withDocsTypeDefinition = TypeDefinition.builder()
                .name(NamedType.builder()
                        .name("WithDocs")
                        .fernFilepath(FernFilepath.valueOf("com/fern"))
                        .build())
                .shape(Type._object(withDocsObjectTypeDefinition))
                .build();
        InterfaceGenerator interfaceGenerator = new InterfaceGenerator(
                withDocsObjectTypeDefinition, withDocsTypeDefinition.name(), TestConstants.GENERATOR_CONTEXT);
        GeneratedInterface withDocsInterface = interfaceGenerator.generate();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                withDocsTypeDefinition.name(),
                withDocsObjectTypeDefinition,
                Collections.emptyList(),
                Optional.of(withDocsInterface),
                TestConstants.GENERATOR_CONTEXT);
        GeneratedObject withDocsObject = objectGenerator.generate();
        System.out.println(withDocsObject.file().toString());
    }
}
