package com.fern.model.codegen;

import com.fern.ContainerType;
import com.fern.NamedTypeReference;
import com.fern.ObjectField;
import com.fern.ObjectTypeDefinition;
import com.fern.PrimitiveType;
import com.fern.Type;
import com.fern.TypeDefinition;
import com.fern.TypeReference;
import com.fern.model.codegen.interfaces.GeneratedInterface;
import com.fern.model.codegen.interfaces.InterfaceGenerator;
import com.fern.model.codegen.object.GeneratedObject;
import com.fern.model.codegen.object.ObjectGenerator;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class ObjectGeneratorTest {

    @Test
    public void test_basic() {
        ObjectTypeDefinition objectTypeDefinition = ObjectTypeDefinition.builder()
                .addFields(ObjectField.builder()
                        .key("docs")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .build();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                NamedTypeReference.builder()
                        .filepath("com/fern")
                        .name("WithDocs")
                        .build(),
                objectTypeDefinition,
                Collections.emptyList(),
                Optional.empty());
        GeneratedObject generatedObject = objectGenerator.generate();
        System.out.println(generatedObject.file().toString());
    }

    @Test
    public void test_skipOwnFields() {
        ObjectTypeDefinition withDocsObjectTypeDefinition = ObjectTypeDefinition.builder()
                .addFields(ObjectField.builder()
                        .key("docs")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .build();
        TypeDefinition withDocsTypeDefinition = TypeDefinition.builder()
                .name(NamedTypeReference.builder()
                        .filepath("com/fern")
                        .name("WithDocs")
                        .build())
                .shape(Type.object(withDocsObjectTypeDefinition))
                .build();
        InterfaceGenerator interfaceGenerator =
                new InterfaceGenerator(withDocsObjectTypeDefinition, withDocsTypeDefinition.name());
        GeneratedInterface withDocsInterface = interfaceGenerator.generate();
        ObjectGenerator objectGenerator = new ObjectGenerator(
                withDocsTypeDefinition.name(),
                withDocsObjectTypeDefinition,
                Collections.emptyList(),
                Optional.of(withDocsInterface));
        GeneratedObject withDocsObject = objectGenerator.generate();
        System.out.println(withDocsObject.file().toString());
    }
}
