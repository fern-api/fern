package com.fern.model.codegen;

import com.fern.*;
import com.squareup.javapoet.JavaFile;
import org.junit.jupiter.api.Test;

public class InterfaceGeneratorTest {

    @Test
    public void test_basic() {
        TypeDefinition withDocsTypeDefinition = TypeDefinition.builder()
                .name(NamedTypeReference.builder()
                        .filepath("com/fern")
                        .name("WithDocs")
                        .build())
                .shape(Type.object(ObjectTypeDefinition.builder()
                        .addFields(ObjectField.builder()
                                .key("docs")
                                .valueType(TypeReference.container(ContainerType.optional(
                                        TypeReference.primitive(PrimitiveType.STRING))))
                                .build())
                        .build()))
                .build();
        GeneratedInterface generatedInterface = InterfaceGenerator.generate(withDocsTypeDefinition);
        System.out.println(generatedInterface.file().toString());
    }
}
