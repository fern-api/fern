package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;

public abstract class AbstractTypeGenerator extends AbstractFileGenerator {
    public AbstractTypeGenerator(ClassName className, AbstractGeneratorContext<?, ?> generatorContext) {
        super(className, generatorContext);
    }

    public abstract TypeSpec getTypeSpec();

    @Override
    public GeneratedJavaFile generateFile() {
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(
                        JavaFile.builder(className.packageName(), getTypeSpec()).build())
                .build();
    }
}
