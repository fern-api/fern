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
import org.junit.jupiter.api.Test;

public class InterfaceGeneratorTest {

    @Test
    public void test_basic() {
        ObjectTypeDefinition objectTypeDefinition = ObjectTypeDefinition.builder()
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
                .shape(Type.object(objectTypeDefinition))
                .build();
        InterfaceGenerator interfaceGenerator =
                new InterfaceGenerator(objectTypeDefinition, withDocsTypeDefinition.name());
        GeneratedInterface generatedInterface = interfaceGenerator.generate();
        System.out.println(generatedInterface.file().toString());
    }
}
