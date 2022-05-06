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
                        .key("docs")
                        .valueType(TypeReference.container(
                                ContainerType.optional(TypeReference.primitive(PrimitiveType.STRING))))
                        .build())
                .build();
        TypeDefinition withDocsTypeDefinition = TypeDefinition.builder()
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("com/fern"))
                        .name("WithDocs")
                        .build())
                .shape(Type._object(objectTypeDefinition))
                .build();
        InterfaceGenerator interfaceGenerator = new InterfaceGenerator(
                objectTypeDefinition, withDocsTypeDefinition.name(), TestConstants.GENERATOR_CONTEXT);
        GeneratedInterface generatedInterface = interfaceGenerator.generate();
        System.out.println(generatedInterface.file().toString());
    }
}
