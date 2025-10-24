package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public class NullableNonemptyFilterGenerator extends AbstractFileGenerator {

    private static final String IS_OPTIONAL_EMPTY = "isOptionalEmpty";
    private static final String IS_NULLABLE_EMPTY = "isNullableEmpty";
    private static final String IS_ALIAS_OF_OPTIONAL_EMPTY = "isAliasOfOptionalEmpty";
    private static final ParameterSpec PARAMETER_SPEC =
            ParameterSpec.builder(TypeName.get(Object.class), "o").build();

    public NullableNonemptyFilterGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext.getPoetClassNameFactory().getNullableNonemptyFilterClassName(), generatorContext);
    }

    @Override
    public GeneratedFile generateFile() {
        CodeBlock.Builder methodBody = CodeBlock.builder();
        List<CodeBlock> resultingOrStatement = new ArrayList<>();
        List<MethodSpec> additionalMethods = new ArrayList<>();

        MethodSpec isOptionalEmptySpec = MethodSpec.methodBuilder("isOptionalEmpty")
                .addParameter(PARAMETER_SPEC)
                .addModifiers(Modifier.PRIVATE)
                .returns(TypeName.BOOLEAN)
                .addStatement(
                        "return $L instanceof $T && !(($T<?>) $L).isPresent()",
                        PARAMETER_SPEC.name,
                        Optional.class,
                        Optional.class,
                        PARAMETER_SPEC.name)
                .build();

        ClassName nullableClassName = generatorContext.getPoetClassNameFactory().getNullableClassName();
        MethodSpec isNullableEmptySpec = MethodSpec.methodBuilder("isNullableEmpty")
                .addParameter(PARAMETER_SPEC)
                .addModifiers(Modifier.PRIVATE)
                .returns(TypeName.BOOLEAN)
                .addStatement(
                        "return $L instanceof $T && (($T<?>) $L).isEmpty()",
                        PARAMETER_SPEC.name,
                        nullableClassName,
                        nullableClassName,
                        PARAMETER_SPEC.name)
                .build();

        methodBody.addStatement(
                "boolean $L = $L($L)", IS_OPTIONAL_EMPTY, isOptionalEmptySpec.name, PARAMETER_SPEC.name);
        resultingOrStatement.add(CodeBlock.of(IS_OPTIONAL_EMPTY));

        methodBody.addStatement(
                "boolean $L = $L($L)", IS_NULLABLE_EMPTY, isNullableEmptySpec.name, PARAMETER_SPEC.name);
        resultingOrStatement.add(CodeBlock.of(IS_NULLABLE_EMPTY));

        if (generatorContext.getCustomConfig().wrappedAliases()) {
            handleWrappedAliases(methodBody, resultingOrStatement, isOptionalEmptySpec, additionalMethods);
        }

        addReturn(methodBody, resultingOrStatement);

        TypeSpec filterTypeSpec = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(MethodSpec.methodBuilder("equals")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(TypeName.BOOLEAN)
                        .addAnnotation(Override.class)
                        .addParameter(PARAMETER_SPEC)
                        .addCode(methodBody.build())
                        .build())
                .addMethod(isOptionalEmptySpec)
                .addMethod(isNullableEmptySpec)
                .addMethods(additionalMethods)
                .build();

        JavaFile environmentsFile =
                JavaFile.builder(className.packageName(), filterTypeSpec).build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(environmentsFile)
                .build();
    }

    private void handleWrappedAliases(
            CodeBlock.Builder methodBody,
            List<CodeBlock> resultingOrStatement,
            MethodSpec isOptionalEmptySpec,
            List<MethodSpec> additionalMethods) {
        ClassName wrappedAliasClassName =
                generatorContext.getPoetClassNameFactory().getWrappedAliasClassName();
        additionalMethods.add(MethodSpec.methodBuilder(IS_ALIAS_OF_OPTIONAL_EMPTY)
                .returns(TypeName.BOOLEAN)
                .addModifiers(Modifier.PRIVATE)
                .beginControlFlow("if ($L.get() instanceof $T)", PARAMETER_SPEC.name, wrappedAliasClassName)
                .addParameter(ParameterSpec.builder(wrappedAliasClassName, PARAMETER_SPEC.name)
                        .build())
                .addStatement(
                        "return $L(($T) $L.get())",
                        IS_ALIAS_OF_OPTIONAL_EMPTY,
                        wrappedAliasClassName,
                        PARAMETER_SPEC.name)
                .endControlFlow()
                .addStatement("return $L($L.get())", isOptionalEmptySpec.name, PARAMETER_SPEC.name)
                .build());
        methodBody.addStatement(
                "boolean $L = $L instanceof $T && $L(($T) $L)",
                IS_ALIAS_OF_OPTIONAL_EMPTY,
                PARAMETER_SPEC.name,
                wrappedAliasClassName,
                IS_ALIAS_OF_OPTIONAL_EMPTY,
                wrappedAliasClassName,
                PARAMETER_SPEC.name);
        resultingOrStatement.add(CodeBlock.of(IS_ALIAS_OF_OPTIONAL_EMPTY));
    }

    private void addReturn(CodeBlock.Builder methodBody, List<CodeBlock> resultingOrStatement) {
        CodeBlock.Builder resultingOrBuilder = CodeBlock.builder();
        boolean firstCondition = true;
        for (CodeBlock part : resultingOrStatement) {
            if (firstCondition) {
                firstCondition = false;
            } else {
                resultingOrBuilder.add("|| ");
            }
            resultingOrBuilder.add(part);
        }
        methodBody.addStatement("\nreturn $L", resultingOrBuilder.build());
    }
}
