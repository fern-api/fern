package com.fern.model.codegen;

import com.fern.codegen.GeneratedInterface;
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
import org.junit.jupiter.api.Test;

public class InterfaceGeneratorTest {

    @Test
    public void test_basic() {
        ObjectTypeDefinition objectTypeDefinition = ObjectTypeDefinition.builder()
                .addProperties(ObjectProperty.builder()
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .key("docs")
                        .build())
                .build();
        TypeDefinition withDocsTypeDefinition = TypeDefinition.builder()
                .shape(Type._object(objectTypeDefinition))
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/fern"))
                        .name("WithDocs")
                        .build())
                .build();
        InterfaceGenerator interfaceGenerator = new InterfaceGenerator(
                objectTypeDefinition, withDocsTypeDefinition.name(), TestConstants.GENERATOR_CONTEXT);
        GeneratedInterface generatedInterface = interfaceGenerator.generate();
        System.out.println(generatedInterface.file().toString());
    }
}
