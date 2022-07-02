package com.fern.model.codegen;

import com.fern.codegen.GeneratedError;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.fern.types.ErrorDeclaration;
import com.fern.types.ErrorName;
import com.fern.types.FernFilepath;
import com.fern.types.ObjectProperty;
import com.fern.types.ObjectTypeDeclaration;
import com.fern.types.PrimitiveType;
import com.fern.types.Type;
import com.fern.types.TypeReference;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;

public class ErrorGeneratorTest {

    @Test
    public void test_basic() {
        ErrorGenerator errorGenerator = new ErrorGenerator(
                ErrorDeclaration.builder()
                        .name(ErrorName.builder()
                                .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                                .name("NotFoundError")
                                .build())
                        .type(Type._object(ObjectTypeDeclaration.builder()
                                .addProperties(ObjectProperty.builder()
                                        .key("a")
                                        .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                        .build())
                                .build()))
                        .build(),
                TestConstants.GENERATOR_CONTEXT,
                Collections.emptyMap());
        GeneratedError generatedError = errorGenerator.generate();
        System.out.println(generatedError.file().toString());
    }
}
