package com.fern.model.codegen;

import com.fern.codegen.GeneratedInterface;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.types.InterfaceGenerator;
import com.fern.types.ContainerType;
import com.fern.types.DeclaredTypeName;
import com.fern.types.FernFilepath;
import com.fern.types.ObjectProperty;
import com.fern.types.ObjectTypeDeclaration;
import com.fern.types.PrimitiveType;
import com.fern.types.Type;
import com.fern.types.TypeDeclaration;
import com.fern.types.TypeReference;
import java.util.List;
import org.junit.jupiter.api.Test;

public class InterfaceGeneratorTest {

    @Test
    public void test_basic() {
        ObjectTypeDeclaration objectTypeDeclaration = ObjectTypeDeclaration.builder()
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
                .shape(Type._object(objectTypeDeclaration))
                .build();
        InterfaceGenerator interfaceGenerator = new InterfaceGenerator(
                objectTypeDeclaration, withDocsTypeDefinition.name(), TestConstants.GENERATOR_CONTEXT);
        GeneratedInterface generatedInterface = interfaceGenerator.generate();
        System.out.println(generatedInterface.file().toString());
    }
}
