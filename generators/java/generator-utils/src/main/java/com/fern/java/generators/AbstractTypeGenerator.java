package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Set;

public abstract class AbstractTypeGenerator extends AbstractFileGenerator {
    protected TypeSpec typeSpec;
    protected Set<String> reservedTypeNames;

    public AbstractTypeGenerator(
            ClassName className, AbstractGeneratorContext<?, ?> generatorContext, Set<String> reservedTypeNames) {
        super(className, generatorContext);
    }

    public TypeSpec getTypeSpec() {
        return typeSpec;
    }

    public AbstractTypeGenerator addAllInlineTypes(List<TypeSpec> inlineTypes) {
        typeSpec = typeSpec.toBuilder().addTypes(inlineTypes).build();
        return this;
    }

    protected String resolveName(String rawName) {
        String result = rawName;
        while (reservedTypeNames.contains(result)) {
            result += "_";
        }
        return result;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(JavaFile.builder(className.packageName(), typeSpec).build())
                .build();
    }
}
