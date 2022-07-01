package com.fern.model.codegen.services.payloads;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.codegen.GeneratedEndpointError;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.codegen.utils.MethodNameUtils;
import com.fern.model.codegen.Generator;
import com.fern.types.errors.ErrorName;
import com.fern.types.services.commons.FailedResponse;
import com.fern.types.services.commons.ResponseError;
import com.fern.types.services.commons.ServiceName;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpService;
import com.palantir.common.streams.KeyedStream;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import org.apache.commons.lang3.StringUtils;
import org.immutables.value.Value;

public final class FailedResponseGenerator extends Generator {

    private static final String CLASSNAME_ERROR_SUFFIX = "Error";

    private static final String INTERNAL_VALUE_INTERFACE_NAME = "InternalValue";
    private static final String INTERNAL_CLASS_NAME_PREFIX = "Internal";
    private static final String INTERNAL_CLASS_NAME_SUFFIX = "Value";

    private static final String GET_INTERNAL_VALUE_METHOD_NAME = "getInternalValue";
    private static final String GET_STATUS_CODE_METHOD_NAME = "getStatusCode";
    public static final String GET_NESTED_ERROR_METHOD_NAME = "getNestedError";

    private static final String VALUE_FIELD_NAME = "value";

    private final FailedResponse failedResponse;
    private final Map<ErrorName, GeneratedError> generatedErrors;
    private final ClassName generatedEndpointErrorClassName;
    private final Map<ResponseError, ClassName> internalValueClassNames;
    private final ClassName internalValueInterfaceClassName;

    public FailedResponseGenerator(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            FailedResponse failedResponse,
            GeneratorContext generatorContext,
            Map<ErrorName, GeneratedError> generatedErrors) {
        super(generatorContext, PackageType.SERVICES);
        this.failedResponse = failedResponse;
        this.generatedErrors = generatedErrors;
        this.generatedEndpointErrorClassName = generatorContext
                .getClassNameUtils()
                .getClassNameFromServiceName(
                        ServiceName.builder()
                                .fernFilepath(httpService.name().fernFilepath())
                                .name(httpEndpoint.endpointId().value())
                                .build(),
                        PackageType.SERVICES,
                        CLASSNAME_ERROR_SUFFIX);
        this.internalValueClassNames = failedResponse.errors().stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        error -> generatedEndpointErrorClassName.nestedClass(INTERNAL_CLASS_NAME_PREFIX
                                + StringUtils.capitalize(error.discriminantValue())
                                + INTERNAL_CLASS_NAME_SUFFIX)));
        this.internalValueInterfaceClassName =
                generatedEndpointErrorClassName.nestedClass(INTERNAL_VALUE_INTERFACE_NAME);
    }

    @Override
    public GeneratedEndpointError generate() {
        Map<ResponseError, MethodSpec> responseErrorToMethodSpec = getStaticBuilderMethods();
        TypeSpec endpointErrorTypeSpec = TypeSpec.classBuilder(generatedEndpointErrorClassName)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .superclass(WebApplicationException.class)
                .addAnnotation(Value.Enclosing.class)
                .addField(FieldSpec.builder(internalValueInterfaceClassName, VALUE_FIELD_NAME)
                        .addModifiers(Modifier.PRIVATE, Modifier.FINAL)
                        .build())
                .addMethod(getConstructor())
                .addMethod(getInternalValueMethod())
                .addMethod(getResponseMethodSpec())
                .addMethod(getNestedErrorMethodSpec())
                .addMethods(responseErrorToMethodSpec.values())
                .addType(getInternalValueInterface())
                .addTypes(getInternalValueTypeSpecs().values())
                .build();
        JavaFile aliasFile = JavaFile.builder(generatedEndpointErrorClassName.packageName(), endpointErrorTypeSpec)
                .build();
        return GeneratedEndpointError.builder()
                .file(aliasFile)
                .className(generatedEndpointErrorClassName)
                .putAllConstructorsByResponseError(responseErrorToMethodSpec)
                .build();
    }

    private MethodSpec getConstructor() {
        return MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PRIVATE)
                .addParameter(internalValueInterfaceClassName, VALUE_FIELD_NAME)
                .addStatement("this.$L = $L", VALUE_FIELD_NAME, VALUE_FIELD_NAME)
                .addAnnotation(AnnotationSpec.builder(JsonCreator.class)
                        .addMember(
                                "mode",
                                "$T.$L",
                                ClassName.get(JsonCreator.Mode.class),
                                JsonCreator.Mode.DELEGATING.name())
                        .build())
                .build();
    }

    private MethodSpec getInternalValueMethod() {
        return MethodSpec.methodBuilder(GET_INTERNAL_VALUE_METHOD_NAME)
                .returns(internalValueInterfaceClassName)
                .addStatement("return value")
                .addAnnotation(JsonValue.class)
                .build();
    }

    private MethodSpec getResponseMethodSpec() {
        return MethodSpec.methodBuilder("getResponse")
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .returns(Response.class)
                .addAnnotation(Override.class)
                .addStatement(
                        "return $T.status($L.$L()).entity($L).build()",
                        Response.class,
                        VALUE_FIELD_NAME,
                        GET_STATUS_CODE_METHOD_NAME,
                        VALUE_FIELD_NAME)
                .build();
    }

    private MethodSpec getNestedErrorMethodSpec() {
        return MethodSpec.methodBuilder("getNestedError")
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .returns(ClassNameUtils.EXCEPTION_CLASS_NAME)
                .addStatement("return $L.$L()", VALUE_FIELD_NAME, GET_NESTED_ERROR_METHOD_NAME)
                .build();
    }

    private Map<ResponseError, MethodSpec> getStaticBuilderMethods() {
        return failedResponse.errors().stream().collect(Collectors.toMap(Function.identity(), errorResponse -> {
            String methodName = MethodNameUtils.getCompatibleMethodName(errorResponse.discriminantValue());
            MethodSpec.Builder staticBuilder = MethodSpec.methodBuilder(methodName)
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .returns(generatedEndpointErrorClassName);
            // static builders for void types should have no parameters
            GeneratedError generatedError = generatedErrors.get(errorResponse.error());
            return staticBuilder
                    .addParameter(generatedError.className(), "value")
                    .addStatement(
                            "return new $T($T.of(value))",
                            generatedEndpointErrorClassName,
                            internalValueClassNames.get(errorResponse))
                    .build();
        }));
    }

    /*
     * Example of an InternalValue code generation below.
     * @JsonTypeInfo(
     *         use = JsonTypeInfo.Id.NAME,
     *         include = JsonTypeInfo.As.PROPERTY,
     *         property = "_type",
     *         visible = true)
     * @JsonSubTypes({
     *         @JsonSubTypes.Type(value = On.class, name = "on"),
     *         @JsonSubTypes.Type(value = Off.class, name = "off")
     * })
     * @JsonIgnoreProperties(ignoreUnknown = true)
     * private interface InternalValue {
     *     int getStatusCode();
     *     Exception getNestedError();
     * }
     */
    private TypeSpec getInternalValueInterface() {
        TypeSpec.Builder baseInterfaceTypeSpecBuilder = TypeSpec.interfaceBuilder(internalValueInterfaceClassName)
                .addModifiers(Modifier.PRIVATE)
                .addMethod(MethodSpec.methodBuilder(GET_STATUS_CODE_METHOD_NAME)
                        .returns(ClassName.INT)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .build())
                .addMethod(MethodSpec.methodBuilder(GET_NESTED_ERROR_METHOD_NAME)
                        .returns(ClassNameUtils.EXCEPTION_CLASS_NAME)
                        .addModifiers(Modifier.ABSTRACT, Modifier.PUBLIC)
                        .build())
                .addAnnotation(AnnotationSpec.builder(JsonTypeInfo.class)
                        .addMember("use", "$T.$L", ClassName.get(JsonTypeInfo.Id.class), JsonTypeInfo.Id.NAME.name())
                        .addMember(
                                "include",
                                "$T.$L",
                                ClassName.get(JsonTypeInfo.As.class),
                                JsonTypeInfo.As.PROPERTY.name())
                        .addMember("property", "$S", failedResponse.discriminant())
                        .addMember("visible", "true")
                        .build());
        AnnotationSpec.Builder jsonSubTypeAnnotationBuilder = AnnotationSpec.builder(JsonSubTypes.class);
        KeyedStream.stream(internalValueClassNames).forEach((singleUnionType, unionTypeClassName) -> {
            AnnotationSpec subTypeAnnotation = AnnotationSpec.builder(JsonSubTypes.Type.class)
                    .addMember("value", "$T.class", unionTypeClassName)
                    .addMember("name", "$S", singleUnionType.discriminantValue())
                    .build();
            jsonSubTypeAnnotationBuilder.addMember("value", "$L", subTypeAnnotation);
        });
        baseInterfaceTypeSpecBuilder
                .addAnnotation(jsonSubTypeAnnotationBuilder.build())
                .addAnnotation(AnnotationSpec.builder(JsonIgnoreProperties.class)
                        .addMember("ignoreUnknown", "true")
                        .build());
        return baseInterfaceTypeSpecBuilder.build();
    }

    private Map<ResponseError, TypeSpec> getInternalValueTypeSpecs() {
        return failedResponse.errors().stream().collect(Collectors.toMap(Function.identity(), responseError -> {
            String capitalizedDiscriminantValue = StringUtils.capitalize(responseError.discriminantValue());
            ClassName internalValueClassName = internalValueClassNames.get(responseError);
            TypeSpec.Builder typeSpecBuilder = TypeSpec.interfaceBuilder(internalValueClassName)
                    .addAnnotation(Value.Immutable.class)
                    .addAnnotation(AnnotationSpec.builder(JsonTypeName.class)
                            .addMember("value", "$S", responseError.discriminantValue())
                            .build())
                    .addAnnotation(AnnotationSpec.builder(JsonDeserialize.class)
                            .addMember(
                                    "as",
                                    "$T.$L.class",
                                    generatedEndpointErrorClassName,
                                    internalValueClassName.simpleName())
                            .build())
                    .addSuperinterface(internalValueInterfaceClassName);

            MethodSpec internalValueImmutablesProperty = getInternalValueImmutablesProperty(responseError);
            GeneratedError generatedError = generatedErrors.get(responseError.error());
            return typeSpecBuilder
                    .addMethod(internalValueImmutablesProperty)
                    .addMethod(MethodSpec.methodBuilder("of")
                            .addModifiers(Modifier.STATIC, Modifier.PUBLIC)
                            .returns(internalValueClassName)
                            .addParameter(generatedError.className(), "value")
                            .addStatement(
                                    "return Immutable$L.$L.builder().$L(value).build()",
                                    generatedEndpointErrorClassName.simpleName(),
                                    internalValueClassName.simpleName(),
                                    internalValueImmutablesProperty.name)
                            .build())
                    .addMethod(MethodSpec.methodBuilder(GET_STATUS_CODE_METHOD_NAME)
                            .returns(ClassName.INT)
                            .addAnnotation(Override.class)
                            .addStatement("return $L().$L()", capitalizedDiscriminantValue, GET_STATUS_CODE_METHOD_NAME)
                            .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                            .build())
                    .addMethod(MethodSpec.methodBuilder(GET_NESTED_ERROR_METHOD_NAME)
                            .returns(ClassNameUtils.EXCEPTION_CLASS_NAME)
                            .addAnnotation(Override.class)
                            .addStatement("return $L()", capitalizedDiscriminantValue)
                            .addModifiers(Modifier.DEFAULT, Modifier.PUBLIC)
                            .build())
                    .build();
        }));
    }

    private MethodSpec getInternalValueImmutablesProperty(ResponseError responseError) {
        GeneratedError generatedError = generatedErrors.get(responseError.error());
        MethodSpec internalValueImmutablesProperty = generatorContext
                .getImmutablesUtils()
                .getKeyWordCompatibleImmutablesPropertyMethod(
                        responseError.discriminantValue(), generatedError.className());
        // Add @JsonValue annotation on object type reference because properties are collapsed one level
        if (generatedError.errorDeclaration().type().isObject()) {
            return MethodSpec.methodBuilder(internalValueImmutablesProperty.name)
                    .addModifiers(internalValueImmutablesProperty.modifiers)
                    .addAnnotations(internalValueImmutablesProperty.annotations)
                    .addAnnotation(JsonValue.class)
                    .returns(internalValueImmutablesProperty.returnType)
                    .build();
        }
        return internalValueImmutablesProperty;
    }
}
