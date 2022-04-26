package com.fern.model.codegen;

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.stateless.generator.ImmutablesStyleGenerator;
import com.fern.codegen.utils.ClassNameUtils;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public class ImmutablesStyleGeneratorTest {

    @Test
    public void test_generatedStagedBuilder() {
        ClassNameUtils classNameUtils = new ClassNameUtils(Optional.of("com.fern"));
        GeneratedFile stagedBuilderJavaFile =
                ImmutablesStyleGenerator.generateStagedBuilderImmutablesStyle(classNameUtils);
        System.out.println(stagedBuilderJavaFile.file().toString());
    }
}
