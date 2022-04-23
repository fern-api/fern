package com.fern.services.jersey.codegen;

import com.fern.HttpEndpoint;
import com.fern.HttpHeader;
import com.fern.HttpMethod;
import com.fern.HttpRequest;
import com.fern.HttpResponse;
import com.fern.HttpService;
import com.fern.PathParameter;
import com.fern.QueryParameter;
import com.fern.TypeReference;
import com.fern.codegen.utils.ClassNameUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.PATCH;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import org.apache.commons.lang3.StringUtils;

public final class ServiceGenerator {

    private static final String REQUEST_PARAMETER_NAME = "request";

    private final List<HttpService> httpServices;
    private final ClassNameUtils classNameUtils;

    public ServiceGenerator(List<HttpService> httpServices) {
        this.httpServices = httpServices;
        this.classNameUtils = new ClassNameUtils(Optional.empty());
    }

    public List<GeneratedServiceWithDefinition> generate() {
        return httpServices.stream().map(this::getGeneratedService).collect(Collectors.toList());
    }

    private GeneratedServiceWithDefinition getGeneratedService(HttpService httpService) {
        ClassName generatedServiceClassName = classNameUtils.getClassNameForNamedType(httpService.name());
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.interfaceBuilder(
                        StringUtils.capitalize(httpService.name().name()))
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(Consumes.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Produces.class)
                        .addMember("value", "$T.APPLICATION_JSON", MediaType.class)
                        .build())
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember("value", "$S", httpService.basePath())
                        .build());
        List<MethodSpec> httpEndpointMethods = httpService.endpoints().stream()
                .map(this::getHttpEndpointMethodSpec)
                .collect(Collectors.toList());
        TypeSpec jerseyServiceTypeSpec =
                jerseyServiceBuilder.addMethods(httpEndpointMethods).build();
        JavaFile jerseyServiceJavaFile = JavaFile.builder(
                        generatedServiceClassName.packageName(), jerseyServiceTypeSpec)
                .build();
        return GeneratedServiceWithDefinition.builder()
                .file(jerseyServiceJavaFile)
                .className(generatedServiceClassName)
                .definition(httpService)
                .build();
    }

    private MethodSpec getHttpEndpointMethodSpec(HttpEndpoint httpEndpoint) {
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(httpEndpoint.endpointId())
                .addAnnotation(httpEndpoint.method().accept(HttpMethodAnnotationVisitor.INSTANCE))
                .addAnnotation(AnnotationSpec.builder(Path.class)
                        .addMember("value", "$S", httpEndpoint.path())
                        .build())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT);
        httpEndpoint.headers().stream().map(this::getHeaderParameterSpec).forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.parameters().stream().map(this::getPathParameterSpec).forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.queryParameters().stream()
                .map(this::getQueryParameterSpec)
                .forEach(endpointMethodBuilder::addParameter);
        httpEndpoint.request().ifPresent(httpRequest -> {
            ParameterSpec requestParameterSpec = getRequestParameterSpec(httpRequest);
            endpointMethodBuilder.addParameter(requestParameterSpec);
        });
        httpEndpoint.response().ifPresent(httpResponse -> {
            TypeName responseTypeName = getResponseTypeName(httpResponse);
            endpointMethodBuilder.returns(responseTypeName);
        });
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
        TypeName typeName = classNameUtils.getTypeNameFromTypeReference(false, paramType);
        return ParameterSpec.builder(typeName, paramName)
                .addAnnotation(AnnotationSpec.builder(paramClass)
                        .addMember("value", "$S", paramName)
                        .build())
                .build();
    }

    private ParameterSpec getRequestParameterSpec(HttpRequest httpRequest) {
        TypeName requestTypeName = classNameUtils.getTypeNameFromTypeReference(true, httpRequest.bodyType());
        return ParameterSpec.builder(requestTypeName, REQUEST_PARAMETER_NAME).build();
    }

    private TypeName getResponseTypeName(HttpResponse httpResponse) {
        return classNameUtils.getTypeNameFromTypeReference(true, httpResponse.bodyType());
    }

    private static final class HttpMethodAnnotationVisitor implements HttpMethod.Visitor<AnnotationSpec> {

        private static final HttpMethodAnnotationVisitor INSTANCE = new HttpMethodAnnotationVisitor();

        @Override
        public AnnotationSpec visitGet() {
            return AnnotationSpec.builder(GET.class).build();
        }

        @Override
        public AnnotationSpec visitPost() {
            return AnnotationSpec.builder(POST.class).build();
        }

        @Override
        public AnnotationSpec visitPut() {
            return AnnotationSpec.builder(PUT.class).build();
        }

        @Override
        public AnnotationSpec visitDelete() {
            return AnnotationSpec.builder(DELETE.class).build();
        }

        @Override
        public AnnotationSpec visitPatch() {
            return AnnotationSpec.builder(PATCH.class).build();
        }

        @Override
        public AnnotationSpec visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown HttpMethod: " + unknownType);
        }
    }
}
