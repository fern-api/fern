package com.fern.java.client.generators;

import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

public class BaseErrorGenerator extends AbstractFileGenerator {

    public static final String MESSAGE_PARAMETER_NAME = "message";
    public static final String EXCEPTION_PARAMETER_NAME = "e";

    public BaseErrorGenerator(ClientGeneratorContext generatorContext) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getBaseExceptionClassName(
                                generatorContext.getGeneratorConfig().getOrganization(),
                                generatorContext.getGeneratorConfig().getWorkspaceName(),
                                generatorContext.getCustomConfig()),
                generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec apiErrorTypeSpec = TypeSpec.classBuilder(className)
                .addJavadoc("This class serves as the base exception for all errors in the SDK.")
                .addModifiers(Modifier.PUBLIC)
                .superclass(RuntimeException.class)
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(ParameterSpec.builder(String.class, MESSAGE_PARAMETER_NAME)
                                .build())
                        .addStatement("super($L)", MESSAGE_PARAMETER_NAME)
                        .build())
                .addMethod(MethodSpec.constructorBuilder()
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(ParameterSpec.builder(String.class, MESSAGE_PARAMETER_NAME)
                                .build())
                        .addParameter(ParameterSpec.builder(Exception.class, EXCEPTION_PARAMETER_NAME)
                                .build())
                        .addStatement("super($L, $L)", MESSAGE_PARAMETER_NAME, EXCEPTION_PARAMETER_NAME)
                        .build())
                .build();
        JavaFile file =
                JavaFile.builder(className.packageName(), apiErrorTypeSpec).build();
        return GeneratedJavaFile.builder().className(className).javaFile(file).build();
    }
}
