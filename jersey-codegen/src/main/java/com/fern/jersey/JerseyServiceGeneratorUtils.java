package com.fern.jersey;

import com.fern.codegen.GeneratedException;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedWireMessage;
import com.fern.codegen.GeneratorContext;
import com.services.commons.ResponseError;
import com.services.http.HttpEndpoint;
import com.services.http.HttpHeader;
import com.services.http.HttpMethod;
import com.services.http.HttpService;
import com.services.http.PathParameter;
import com.services.http.QueryParameter;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.types.NamedType;
import com.types.TypeReference;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.PATCH;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;

public final class JerseyServiceGeneratorUtils {

    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";

    private final GeneratorContext generatorContext;
    private final HttpService httpService;
    private final Map<NamedType, GeneratedInterface> generatedInterfaces;
    private final Map<NamedType, GeneratedException> generatedExceptionsByType;
    private final List<GeneratedWireMessage> generatedWireMessages = new ArrayList<>();

    public JerseyServiceGeneratorUtils(
            GeneratorContext generatorContext,
            Map<NamedType, GeneratedInterface> generatedInterfaces,
            List<GeneratedException> generatedExceptions,
            HttpService httpService) {
        this.generatorContext = generatorContext;
        this.generatedInterfaces = generatedInterfaces;
        this.generatedExceptionsByType = generatedExceptions.stream()
                .collect(Collectors.toMap(
                        generatedException ->
                                generatedException.errorDefinition().name(),
                        Function.identity()));
        this.httpService = httpService;
    }

    public List<GeneratedWireMessage> getGeneratedWireMessages() {
        return generatedWireMessages;
    }

    public MethodSpec getHttpEndpointMethodSpec(HttpEndpoint httpEndpoint, boolean throwsUnknownException) {
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(httpEndpoint.endpointId())
                .addAnnotation(httpEndpoint.method().accept(HttpMethodAnnotationVisitor.INSTANCE))
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember("value", "$S", httpEndpoint.path())
                        .build())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);
        if (httpService.auth().isPresent()) {
            endpointMethodBuilder.addParameter(
                    ParameterSpec.builder(generatorContext.getAuthHeaderFile().className(), "authHeader")
                            .addAnnotation(AnnotationSpec.builder(HeaderParam.class)
                                    .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                                    .build())
                            .build());
        }
        httpEndpoint.headers().stream().map(this::getHeaderParameterSpec).forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.parameters().stream().map(this::getPathParameterSpec).forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.queryParameters().stream()
                .map(this::getQueryParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.request().ifPresent(requestWireMessage -> {
            ServiceWireMessageGenerator serviceWireMessageGenerator = new ServiceWireMessageGenerator(
                    generatorContext, generatedInterfaces, httpService, httpEndpoint, requestWireMessage, true);
            WireMessageGeneratorResult wireMessageGeneratorResult = serviceWireMessageGenerator.generate();
            endpointMethodBuilder.addParameter(ParameterSpec.builder(wireMessageGeneratorResult.typeName(), "request")
                    .build());
            wireMessageGeneratorResult.generatedWireMessage().ifPresent(generatedWireMessages::add);
        });
        httpEndpoint.response().ifPresent(responseWireMessage -> {
            ServiceWireMessageGenerator serviceWireMessageGenerator = new ServiceWireMessageGenerator(
                    generatorContext, generatedInterfaces, httpService, httpEndpoint, responseWireMessage, false);
            WireMessageGeneratorResult wireMessageGeneratorResult = serviceWireMessageGenerator.generate();
            endpointMethodBuilder.returns(wireMessageGeneratorResult.typeName());
            wireMessageGeneratorResult.generatedWireMessage().ifPresent(generatedWireMessages::add);
        });
        boolean exceptionsAdded = false;
        for (ResponseError responseError : httpEndpoint.errors().possibleErrors()) {
            GeneratedException generatedException = generatedExceptionsByType.get(responseError.error());
            endpointMethodBuilder.addException(generatedException.className());
            exceptionsAdded = true;
        }
        if (exceptionsAdded && throwsUnknownException) {
            endpointMethodBuilder.addException(
                    generatorContext.getUnknownRemoteExceptionFile().className());
        }
        return endpointMethodBuilder.build();
    }

    private ParameterSpec getHeaderParameterSpec(HttpHeader header) {
        return getParameterSpec(HeaderParam.class, header.header(), header.valueType());
    }

    private ParameterSpec getPathParameterSpec(PathParameter pathParameter) {
        return getParameterSpec(PathParam.class, pathParameter.key(), pathParameter.valueType());
    }

    private ParameterSpec getQueryParameterSpec(QueryParameter queryParameter) {
        return getParameterSpec(QueryParam.class, queryParameter.key(), queryParameter.valueType());
    }

    private <T> ParameterSpec getParameterSpec(Class<T> paramClass, String paramName, TypeReference paramType) {
        TypeName typeName = generatorContext.getClassNameUtils().getTypeNameFromTypeReference(false, paramType);
        return ParameterSpec.builder(typeName, paramName)
                .addAnnotation(AnnotationSpec.builder(paramClass)
                        .addMember("value", "$S", paramName)
                        .build())
                .build();
    }

    private static final class HttpMethodAnnotationVisitor implements HttpMethod.Visitor<AnnotationSpec> {

        private static final HttpMethodAnnotationVisitor INSTANCE = new HttpMethodAnnotationVisitor();

        @Override
        public AnnotationSpec visitGET() {
            return AnnotationSpec.builder(GET.class).build();
        }

        @Override
        public AnnotationSpec visitPOST() {
            return AnnotationSpec.builder(POST.class).build();
        }

        @Override
        public AnnotationSpec visitPUT() {
            return AnnotationSpec.builder(PUT.class).build();
        }

        @Override
        public AnnotationSpec visitDELETE() {
            return AnnotationSpec.builder(DELETE.class).build();
        }

        @Override
        public AnnotationSpec visitPATCH() {
            return AnnotationSpec.builder(PATCH.class).build();
        }

        @Override
        public AnnotationSpec visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown HttpMethod: " + unknownType);
        }
    }
}
