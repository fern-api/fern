package com.fern.java.client.generators;

import static com.fern.java.utils.PoetUtils.createGetter;

import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public class ErrorGenerator extends AbstractFileGenerator {
    private static final String BODY_FIELD_NAME = "body";

    private final GeneratedJavaFile baseErrorClass;
    private final ErrorDeclaration errorDeclaration;

    public ErrorGenerator(
            ClientGeneratorContext generatorContext,
            GeneratedJavaFile apiErrorClass,
            ErrorDeclaration errorDeclaration) {
        super(generatorContext.getPoetClassNameFactory().getErrorClassName(errorDeclaration), generatorContext);

        this.baseErrorClass = apiErrorClass;
        this.errorDeclaration = errorDeclaration;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec.Builder errorTypeSpecBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .superclass(baseErrorClass.getClassName());
        Optional<TypeName> bodyTypeName = Optional.empty();
        if (errorDeclaration.getType().isPresent()) {
            TypeReference typeReference = errorDeclaration.getType().get();
            bodyTypeName = Optional.of(generatorContext.getPoetTypeNameMapper().convertToTypeName(true, typeReference));
        }

        String errorName = errorDeclaration.getName().getName().getPascalCase().getUnsafeName();
        bodyTypeName.ifPresent(typeName -> {
            FieldSpec bodyFieldSpec = FieldSpec.builder(typeName, BODY_FIELD_NAME)
                    .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                    .addJavadoc("The body of the response that triggered the exception.")
                    .build();
            errorTypeSpecBuilder
                    .addField(bodyFieldSpec)
                    .addMethod(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PUBLIC)
                            .addParameter(typeName, BODY_FIELD_NAME)
                            .addStatement(
                                    "super($S, $L, $L)", errorName, errorDeclaration.getStatusCode(), BODY_FIELD_NAME)
                            .addStatement("this.$L = $L", BODY_FIELD_NAME, BODY_FIELD_NAME)
                            .build())
                    .addMethod(createGetter(bodyFieldSpec, ClassName.get("", "java.lang.Override")));
        });
        if (bodyTypeName.isEmpty()) {
            errorTypeSpecBuilder.addMethod(MethodSpec.constructorBuilder()
                    .addModifiers(Modifier.PUBLIC)
                    .addParameter(Object.class, BODY_FIELD_NAME)
                    .addStatement("super($S, $L, $L)", errorName, errorDeclaration.getStatusCode(), BODY_FIELD_NAME)
                    .build());
        }
        TypeSpec errorTypeSpec = errorTypeSpecBuilder.build();
        JavaFile javaFile =
                JavaFile.builder(className.packageName(), errorTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .build();
    }
}
