package com.fern.services.jersey.codegen;

import com.services.commons.ResponseErrors;
import com.services.commons.WireMessage;
import com.services.http.HttpEndpoint;
import com.services.http.HttpMethod;
import com.services.http.HttpService;
import com.services.http.PathParameter;
import com.types.AliasTypeDefinition;
import com.types.FernFilepath;
import com.types.NamedType;
import com.types.PrimitiveType;
import com.types.Type;
import com.types.TypeReference;
import java.util.Collections;

public final class ServiceGeneratorTest {

    // @Test
    public void test_basic() {
        HttpService testHttpService = HttpService.builder()
                .basePath("/person")
                .name(NamedType.builder()
                        .fernFilepath(FernFilepath.valueOf("fern"))
                        .name("PersonCrudService")
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("getPerson")
                        .path("/{personId}")
                        .method(HttpMethod.GET)
                        .errors(ResponseErrors.builder().discriminant("").build())
                        .addParameters(PathParameter.builder()
                                .key("personId")
                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                .build())
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("createPerson")
                        .path("/create")
                        .method(HttpMethod.POST)
                        .errors(ResponseErrors.builder().discriminant("").build())
                        .request(WireMessage.builder()
                                .type(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.named(NamedType.builder()
                                                .fernFilepath(FernFilepath.valueOf("fern"))
                                                .name("CreatePersonRequest")
                                                .build()))
                                        .build()))
                                .build())
                        .response(WireMessage.builder()
                                .type(Type.alias(AliasTypeDefinition.builder()
                                        .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                                        .build()))
                                .build())
                        .build())
                .build();
        ServiceGenerator serviceGenerator = new ServiceGenerator(Collections.singletonList(testHttpService));
        GeneratedServiceWithDefinition generatedService = serviceGenerator.generate().get(0);
        System.out.println(generatedService.file().toString());
    }
}
