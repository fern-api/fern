package com.fern.jersey.client;

import com.fern.codegen.GeneratedException;
import com.fern.codegen.GeneratedHttpServiceClient;
import com.fern.codegen.GeneratorContext;
import com.fern.jersey.ExceptionGenerator;
import com.fern.types.errors.ErrorDefinition;
import com.fern.types.errors.ErrorProperty;
import com.fern.types.errors.HttpErrorConfiguration;
import com.fern.types.services.commons.Encoding;
import com.fern.types.services.commons.ResponseError;
import com.fern.types.services.commons.ResponseErrors;
import com.fern.types.services.http.HttpAuth;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpMethod;
import com.fern.types.services.http.HttpRequest;
import com.fern.types.services.http.HttpResponse;
import com.fern.types.services.http.HttpService;
import com.fern.types.services.http.PathParameter;
import com.fern.types.types.AliasTypeDefinition;
import com.fern.types.types.FernFilepath;
import com.fern.types.types.NamedType;
import com.fern.types.types.PrimitiveType;
import com.fern.types.types.Type;
import com.fern.types.types.TypeReference;
import java.util.Collections;
import java.util.Optional;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

public final class HttpServiceClientGeneratorTest {

    private static final String PACKAGE_PREFIX = "com";
    private static final GeneratorContext GENERATOR_CONTEXT = new GeneratorContext(
            Optional.of(PACKAGE_PREFIX),
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
                        .path("/{personId}")
                        .request(HttpRequest.builder()
                                .type(Type.alias(AliasTypeDefinition.builder().aliasOf(TypeReference._void()).build()))
                                .encoding(Encoding.json())
                                .build())
                        .method(HttpMethod.GET)
                        .endpointId("getPerson")
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .errors(ResponseErrors.builder().discriminant("").build())
                                .ok(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.named(NamedType.builder()
                                                .fernFilepath(FernFilepath.valueOf("fern"))
                                                .name("Person")
                                                .build()))
                                        .build()))
                                .build())
                        .auth(HttpAuth.NONE)
                        .addParameters(PathParameter.builder()
                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                .key("personId")
                                .build())
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .path("/create")
                        .request(HttpRequest.builder()
                                .type(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.named(NamedType.builder()
                                                .fernFilepath(FernFilepath.valueOf("fern"))
                                                .name("CreatePersonRequest")
                                                .build()))
                                        .build()))
                                .encoding(Encoding.json())
                                .build())
                        .method(HttpMethod.POST)
                        .endpointId("createPerson")
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .errors(ResponseErrors.builder().discriminant("").build())
                                .ok(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                                        .build()))
                                .build())
                        .auth(HttpAuth.NONE)
                        .build())
                .build();
        HttpServiceClientGenerator httpServiceClientGenerator = new HttpServiceClientGenerator(
                GENERATOR_CONTEXT, Collections.emptyMap(), Collections.emptyList(), testHttpService);
        GeneratedHttpServiceClient generatedHttpServiceClient = httpServiceClientGenerator.generate();
        System.out.println(generatedHttpServiceClient.file().toString());
        Assertions.assertThat(generatedHttpServiceClient.generatedErrorDecoder()).isEmpty();
    }

    @Test
    public void test_withErrors() {
        ErrorDefinition personIdNotFound = ErrorDefinition.builder()
            .name(NamedType.builder()
                .fernFilepath(FernFilepath.valueOf("fern"))
                .name("PersonIdNotFound")
                .build())
            .addProperties(ErrorProperty.builder()
                .name("personId")
                .type(TypeReference.primitive(PrimitiveType.STRING))
                .build())
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
                        .path("/{personId}")
                        .request(HttpRequest.builder()
                                .type(Type.alias(AliasTypeDefinition.builder().aliasOf(TypeReference._void()).build()))
                                .encoding(Encoding.json())
                                .build())
                        .method(HttpMethod.GET)
                        .endpointId("getPerson")
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .errors(ResponseErrors.builder()
                                        .discriminant("_type")
                                        .addPossibleErrors(ResponseError.builder()
                                                .error(personIdNotFound.name())
                                                .discriminantValue("notFound")
                                                .build())
                                        .build())
                                .ok(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.named(NamedType.builder()
                                                .fernFilepath(FernFilepath.valueOf("fern"))
                                                .name("Person")
                                                .build()))
                                        .build()))
                                .build())
                        .auth(HttpAuth.NONE)
                        .addParameters(PathParameter.builder()
                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                .key("personId")
                                .build())
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .path("/create")
                        .request(HttpRequest.builder()
                                .type(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.named(NamedType.builder()
                                                .fernFilepath(FernFilepath.valueOf("fern"))
                                                .name("CreatePersonRequest")
                                                .build()))
                                        .build()))
                                .encoding(Encoding.json())
                                .build())
                        .method(HttpMethod.POST)
                        .endpointId("createPerson")
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .errors(ResponseErrors.builder()
                                        .discriminant("_type")
                                        .build())
                                .ok(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                                        .build()))
                                .build())
                        .auth(HttpAuth.NONE)
                        .build())
                .build();
        ExceptionGenerator personIdNotFoundClientExceptionGenerator =
                new ExceptionGenerator(GENERATOR_CONTEXT, personIdNotFound, false);
        GeneratedException personIdNotFoundException = personIdNotFoundClientExceptionGenerator.generate();
        HttpServiceClientGenerator httpServiceClientGenerator = new HttpServiceClientGenerator(
                GENERATOR_CONTEXT,
                Collections.emptyMap(),
                Collections.singletonList(personIdNotFoundException),
                testHttpService);
        GeneratedHttpServiceClient generatedHttpServiceClient = httpServiceClientGenerator.generate();
        System.out.println(generatedHttpServiceClient.file().toString());
        Assertions.assertThat(generatedHttpServiceClient.generatedErrorDecoder()).isPresent();
        System.out.println(generatedHttpServiceClient.generatedErrorDecoder().get().file().toString());
    }
}
