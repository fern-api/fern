package com.fern.codegen.stateless.generator;

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public final class ApiExceptionGenerator {

    private static final String HTTP_API_EXCEPTION_CLASS_NAME = "HttpApiException";
    private static final String GET_STATUS_CODE_METHOD_NAME = "getStatusCode";

    private static final String API_EXCEPTION_INTERFACE_CLASS_NAME = "ApiException";
    private static final String GET_ERROR_INSTANCE_ID_METHOD_NAME = "getErrorInstanceId";

    private ApiExceptionGenerator() {}

    public static GeneratedFile generateApiExceptionInterface(ClassNameUtils classNameUtils) {
        ClassName apiExceptionInterfaceClassname = classNameUtils.getClassName(
                API_EXCEPTION_INTERFACE_CLASS_NAME, Optional.of(PackageType.ERRORS), Optional.empty());
        TypeSpec apiExceptionTypeSpec = TypeSpec.interfaceBuilder(API_EXCEPTION_INTERFACE_CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addMethod(MethodSpec.methodBuilder(GET_ERROR_INSTANCE_ID_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                        .returns(ClassNameUtils.STRING_CLASS_NAME)
                        .build())
                .build();
        JavaFile apiExceptionFile = JavaFile.builder(apiExceptionInterfaceClassname.packageName(), apiExceptionTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(apiExceptionFile)
                .className(apiExceptionInterfaceClassname)
                .build();
    }

    public static GeneratedFile generateHttpApiExceptionInterface(ClassNameUtils classNameUtils) {
        ClassName httpApiExceptionInterfaceClassname = classNameUtils.getClassName(
                API_EXCEPTION_INTERFACE_CLASS_NAME, Optional.of(PackageType.ERRORS), Optional.empty());
        TypeSpec httpApiExceptionTypeSpec = TypeSpec.interfaceBuilder(HTTP_API_EXCEPTION_CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addMethod(MethodSpec.methodBuilder(GET_STATUS_CODE_METHOD_NAME)
                        .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                        .returns(ClassNameUtils.STRING_CLASS_NAME)
                        .build())
                .build();
        JavaFile httpApiExceptionFile = JavaFile.builder(
                        httpApiExceptionInterfaceClassname.packageName(), httpApiExceptionTypeSpec)
                .build();
        return GeneratedFile.builder()
                .file(httpApiExceptionFile)
                .className(httpApiExceptionInterfaceClassname)
                .build();
    }
}
