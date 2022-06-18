package com.fern.jersey.server;

import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.model.codegen.ModelGenerator;
import com.fern.model.codegen.ModelGeneratorResult;
import com.fern.types.errors.ErrorDefinition;
import com.fern.types.errors.HttpErrorConfiguration;
import com.fern.types.services.commons.Encoding;
import com.fern.types.services.commons.FailedResponse;
import com.fern.types.services.commons.ResponseError;
import com.fern.types.services.http.HttpAuth;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpMethod;
import com.fern.types.services.http.HttpOkResponse;
import com.fern.types.services.http.HttpRequest;
import com.fern.types.services.http.HttpResponse;
import com.fern.types.services.http.HttpService;
import com.fern.types.services.http.PathParameter;
import com.fern.types.types.AliasTypeDefinition;
import com.fern.types.types.FernFilepath;
import com.fern.types.types.NamedType;
import com.fern.types.types.ObjectProperty;
import com.fern.types.types.ObjectTypeDefinition;
import com.fern.types.types.PrimitiveType;
import com.fern.types.types.Type;
import com.fern.types.types.TypeReference;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public final class HttpServiceServerGeneratorTest {

    private static final String PACKAGE_PREFIX = "com";
    private static final GeneratorContext GENERATOR_CONTEXT = new GeneratorContext(
            Optional.of(PACKAGE_PREFIX),
            Collections.emptyMap(),
            Collections.emptyMap());

    @Test
    public void test_basic() {
        HttpService testHttpService = HttpService.builder()
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("fern"))
                        .name("PersonCrudService")
                        .build())
                .basePath("/person")
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("getPerson")
                        .path("/{personId}")
                        .method(HttpMethod.GET)
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDefinition.builder().aliasOf(TypeReference._void()).build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                        .type(Type.alias(AliasTypeDefinition.builder()
                                                .aliasOf(TypeReference.named(NamedType.builder()
                                                        .fernFilepath(FernFilepath.valueOf("fern"))
                                                        .name("Person")
                                                        .build()))
                                                .build()))
                                        .build())
                                .failed(FailedResponse.builder()
                                        .discriminant("_type")
                                        .build())
                                .build())
                        .auth(HttpAuth.NONE)
                        .addPathParameters(PathParameter.builder()
                                .key("personId")
                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                .build())
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("createPerson")
                        .path("/create")
                        .method(HttpMethod.POST)
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.named(NamedType.builder()
                                                .fernFilepath(FernFilepath.valueOf("fern"))
                                                .name("CreatePersonRequest")
                                                .build()))
                                        .build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                        .type(Type.alias(AliasTypeDefinition.builder()
                                                .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                                                .build()))
                                        .build())
                                .failed(FailedResponse.builder()
                                        .discriminant("_type")
                                        .build())
                                .build())
                        .auth(HttpAuth.NONE)
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("create")
                        .path("/create")
                        .method(HttpMethod.POST)
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                                        .build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                        .type(Type.alias(AliasTypeDefinition.builder()
                                            .aliasOf(TypeReference._void())
                                            .build()))
                                        .build())
                                .failed(FailedResponse.builder()
                                        .discriminant("_error")
                                        .build())
                                .build())
                        .auth(HttpAuth.BEARER)
                        .build())
                .build();
        ModelGenerator modelGenerator = new ModelGenerator(
                Collections.singletonList(testHttpService),
                Collections.emptyList(),
                Collections.emptyList(),
                GENERATOR_CONTEXT);
        ModelGeneratorResult modelGeneratorResult = modelGenerator.generate();
        HttpServiceServerGenerator httpServiceServerGenerator = new HttpServiceServerGenerator(
                GENERATOR_CONTEXT,
                modelGeneratorResult.errors(),
                modelGeneratorResult.endpointModels().get(testHttpService),
                testHttpService);
        GeneratedHttpServiceServer generatedHttpServiceClient = httpServiceServerGenerator.generate();
        System.out.println(generatedHttpServiceClient.file().toString());
    }

    @Test
    public void test_withErrors() {
        ErrorDefinition personIdNotFound = ErrorDefinition.builder()
            .name(NamedType.builder()
                .fernFilepath(FernFilepath.valueOf("fern"))
                .name("PersonIdNotFound")
                .build())
            .type(Type._object(ObjectTypeDefinition.builder()
                    .addProperties(ObjectProperty.builder()
                            .key("personId")
                            .valueType(TypeReference.primitive(PrimitiveType.STRING))
                            .build())
                    .build()))
            .http(HttpErrorConfiguration.builder()
                    .statusCode(400)
                    .build())
            .build();
        HttpService testHttpService = HttpService.builder()
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("fern"))
                        .name("PersonCrudService")
                        .build())
                .basePath("/person")
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("getPerson")
                        .path("/{personId}")
                        .method(HttpMethod.GET)
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDefinition.builder().aliasOf(TypeReference._void()).build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                    .type(Type.alias(AliasTypeDefinition.builder()
                                            .aliasOf(TypeReference.named(NamedType.builder()
                                                    .fernFilepath(FernFilepath.valueOf("fern"))
                                                    .name("Person")
                                                    .build()))
                                            .build()))
                                    .build())
                                .failed(FailedResponse.builder()
                                        .discriminant("_type")
                                        .addErrors(ResponseError.builder()
                                                .discriminantValue("notFound")
                                                .error(personIdNotFound.name())
                                                .build())
                                        .build())
                                .build())
                        .auth(HttpAuth.NONE)
                        .addPathParameters(PathParameter.builder()
                                .key("personId")
                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                .build())
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("createPerson")
                        .path("/create")
                        .method(HttpMethod.POST)
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.named(NamedType.builder()
                                                .fernFilepath(FernFilepath.valueOf("fern"))
                                                .name("CreatePersonRequest")
                                                .build()))
                                        .build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                        .type(Type.alias(AliasTypeDefinition.builder()
                                            .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                                            .build()))
                                        .build())
                                .failed(FailedResponse.builder()
                                        .discriminant("_type")
                                        .build())
                                .build())
                        .auth(HttpAuth.NONE)
                        .build())
                .build();
        ModelGenerator modelGenerator = new ModelGenerator(
                Collections.singletonList(testHttpService),
                Collections.emptyList(),
                Collections.singletonList(personIdNotFound),
                GENERATOR_CONTEXT);
        ModelGeneratorResult modelGeneratorResult = modelGenerator.generate();
        HttpServiceServerGenerator httpServiceServerGenerator = new HttpServiceServerGenerator(
                GENERATOR_CONTEXT,
                modelGeneratorResult.errors(),
                modelGeneratorResult.endpointModels().get(testHttpService),
                testHttpService);
        GeneratedHttpServiceServer generatedHttpServiceServer = httpServiceServerGenerator.generate();
        System.out.println(generatedHttpServiceServer.file().toString());
    }
}
