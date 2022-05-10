package com.fern.jersey;

import com.errors.ErrorDefinition;
import com.errors.ErrorProperty;
import com.errors.HttpErrorConfiguration;
import com.fern.codegen.GeneratedException;
import com.fern.java.test.TestConstants;
import com.types.FernFilepath;
import com.types.NamedType;
import com.types.PrimitiveType;
import com.types.TypeReference;
import org.junit.jupiter.api.Test;

public class ExceptionGeneratorTest {

    @Test
    public void test_client() {
        ExceptionGenerator exceptionGenerator = new ExceptionGenerator(
                TestConstants.GENERATOR_CONTEXT,
                ErrorDefinition.builder()
                        .name(NamedType.builder()
                                .fernFilepath(FernFilepath.valueOf("/fern"))
                                .name("NotFoundError")
                                .build())
                        .addProperties(ErrorProperty.builder()
                                .type(TypeReference.primitive(PrimitiveType.STRING))
                                .name("a")
                                .build())
                        .build(),
                false);
        GeneratedException generatedException = exceptionGenerator.generate();
        System.out.println(generatedException.file().toString());
    }

    @Test
    public void test_server() {
        ExceptionGenerator exceptionGenerator = new ExceptionGenerator(
                TestConstants.GENERATOR_CONTEXT,
                ErrorDefinition.builder()
                        .name(NamedType.builder()
                                .fernFilepath(FernFilepath.valueOf("/fern"))
                                .name("NotFoundError")
                                .build())
                        .addProperties(ErrorProperty.builder()
                                .type(TypeReference.primitive(PrimitiveType.STRING))
                                .name("a")
                                .build())
                        .http(HttpErrorConfiguration.builder().statusCode(500).build())
                        .build(),
                true);
        GeneratedException generatedException = exceptionGenerator.generate();
        System.out.println(generatedException.file().toString());
    }
}
