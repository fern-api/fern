package com.fern.jersey;

import com.fern.codegen.GeneratedException;
import com.fern.codegen.GeneratedHttpRequest;
import com.fern.codegen.GeneratedHttpResponse;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.types.services.commons.ResponseError;
import com.fern.types.services.http.HttpAuth;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpHeader;
import com.fern.types.services.http.HttpMethod;
import com.fern.types.services.http.HttpRequest;
import com.fern.types.services.http.HttpResponse;
import com.fern.types.services.http.HttpService;
import com.fern.types.services.http.PathParameter;
import com.fern.types.services.http.QueryParameter;
import com.fern.types.types.NamedType;
import com.fern.types.types.Type;
import com.fern.types.types.TypeReference;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    private final HttpAuthToParameterSpec httpAuthToParameterSpec = new HttpAuthToParameterSpec();
    private final List<GeneratedHttpRequest> generatedHttpRequests = new ArrayList<>();
    private final List<GeneratedHttpResponse> generatedHttpResponses = new ArrayList<>();

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

    public List<GeneratedHttpRequest> getGeneratedHttpRequests() {
        return generatedHttpRequests;
    }

    public List<GeneratedHttpResponse> getGeneratedHttpResponses() {
        return generatedHttpResponses;
    }

    public MethodSpec getHttpEndpointMethodSpec(HttpEndpoint httpEndpoint, boolean throwsUnknownException) {
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(httpEndpoint.endpointId())
                .addAnnotation(httpEndpoint.method().visit(HttpMethodAnnotationVisitor.INSTANCE))
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember("value", "$S", httpEndpoint.path())
                        .build())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);
        httpEndpoint.auth().visit(httpAuthToParameterSpec).ifPresent(endpointMethodBuilder::addParameter);
        httpEndpoint.headers().stream().map(this::getHeaderParameterSpec).forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.parameters().stream().map(this::getPathParameterSpec).forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.queryParameters().stream()
                .map(this::getQueryParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);

        createHttpRequest(httpEndpoint.request(), httpEndpoint).ifPresent(requestGeneratorResult -> {
            endpointMethodBuilder.addParameter(ParameterSpec.builder(requestGeneratorResult.typeName(), "request")
                    .build());
            if (requestGeneratorResult.generatedFile().isPresent()) {
                IGeneratedFile generatedFile =
                        requestGeneratorResult.generatedFile().get();
                GeneratedHttpRequest generatedHttpRequest = GeneratedHttpRequest.builder()
                        .file(generatedFile.file())
                        .className(generatedFile.className())
                        .httpRequest(httpEndpoint.request())
                        .build();
                generatedHttpRequests.add(generatedHttpRequest);
            }
        });
        createHttpResponse(httpEndpoint.response(), httpEndpoint).ifPresent(responseGeneratorResult -> {
            endpointMethodBuilder.returns(responseGeneratorResult.typeName());
            if (responseGeneratorResult.generatedFile().isPresent()) {
                IGeneratedFile generatedFile =
                        responseGeneratorResult.generatedFile().get();
                GeneratedHttpResponse generatedHttpResponse = GeneratedHttpResponse.builder()
                        .file(generatedFile.file())
                        .className(generatedFile.className())
                        .httpResponse(httpEndpoint.response())
                        .build();
                generatedHttpResponses.add(generatedHttpResponse);
            }
        });
        boolean exceptionsAdded = false;
        for (ResponseError responseError : httpEndpoint.response().errors().possibleErrors()) {
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

    private Optional<RequestResponseGeneratorResult> createHttpRequest(
            HttpRequest httpRequest, HttpEndpoint httpEndpoint) {
        if (isVoid(httpRequest.type())) {
            return Optional.empty();
        }
        RequestResponseGenerator requestResponseGenerator = new RequestResponseGenerator(
                generatorContext, generatedInterfaces, httpService, httpEndpoint, httpRequest.type(), true);
        return Optional.of(requestResponseGenerator.generate());
    }

    private Optional<RequestResponseGeneratorResult> createHttpResponse(
            HttpResponse httpResponse, HttpEndpoint httpEndpoint) {
        if (isVoid(httpResponse.ok())) {
            return Optional.empty();
        }
        RequestResponseGenerator requestResponseGenerator = new RequestResponseGenerator(
                generatorContext, generatedInterfaces, httpService, httpEndpoint, httpResponse.ok(), false);
        return Optional.of(requestResponseGenerator.generate());
    }

    private static boolean isVoid(Type type) {
        return type.getAlias()
                .map(aliasTypeDefinition -> aliasTypeDefinition.aliasOf().isVoid())
                .orElse(false);
    }

    private final class HttpAuthToParameterSpec implements HttpAuth.Visitor<Optional<ParameterSpec>> {

        @Override
        public Optional<ParameterSpec> visitBEARER() {
            return Optional.of(
                    ParameterSpec.builder(generatorContext.getAuthHeaderFile().className(), "authHeader")
                            .addAnnotation(AnnotationSpec.builder(HeaderParam.class)
                                    .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                                    .build())
                            .build());
        }

        @Override
        public Optional<ParameterSpec> visitNONE() {
            return Optional.empty();
        }

        @Override
        public Optional<ParameterSpec> visitUnknown(String _unknownType) {
            return Optional.empty();
        }
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
