package com.fern.services.jersey.codegen;

import com.fern.FernFilepath;
import com.fern.HttpEndpoint;
import com.fern.HttpMethod;
import com.fern.HttpRequest;
import com.fern.HttpResponse;
import com.fern.HttpService;
import com.fern.NamedType;
import com.fern.PathParameter;
import com.fern.PrimitiveType;
import com.fern.TypeReference;
import java.util.Collections;
import org.junit.jupiter.api.Test;

public class ServiceGeneratorTest {

    @Test
    public void test_basic() {
        HttpService testHttpService = HttpService.builder()
                .name(NamedType.builder()
                        .name("PersonCrudService")
                        .fernFilepath(FernFilepath.valueOf("fern"))
                        .build())
                .displayName("Person Crud Service")
                .basePath("/person")
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("getPerson")
                        .method(HttpMethod.GET)
                        .path("/{personId}")
                        .addParameters(PathParameter.builder()
                                .key("personId")
                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                .build())
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId("createPerson")
                        .method(HttpMethod.POST)
                        .path("/create")
                        .request(HttpRequest.builder()
                                .bodyType(TypeReference.named(NamedType.builder()
                                        .name("CreatePersonRequest")
                                        .fernFilepath(FernFilepath.valueOf("fern"))
                                        .build()))
                                .build())
                        .response(HttpResponse.builder()
                                .bodyType(TypeReference.primitive(PrimitiveType.STRING))
                                .build())
                        .build())
                .build();
        ServiceGenerator serviceGenerator = new ServiceGenerator(Collections.singletonList(testHttpService));
        GeneratedServiceWithDefinition generatedService = serviceGenerator.generate().get(0);
        System.out.println(generatedService.file().toString());
    }
}
