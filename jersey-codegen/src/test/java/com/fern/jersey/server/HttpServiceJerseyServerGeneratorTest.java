/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.fern.jersey.server;

import com.fern.codegen.GeneratedHttpServiceServer;
import com.fern.codegen.GeneratorContext;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.ModelGenerator;
import com.fern.model.codegen.ModelGeneratorResult;
import com.fern.types.AliasTypeDeclaration;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ErrorDeclaration;
import com.fern.types.ErrorName;
import com.fern.types.FernFilepath;
import com.fern.types.HttpErrorConfiguration;
import com.fern.types.ObjectProperty;
import com.fern.types.ObjectTypeDeclaration;
import com.fern.types.PrimitiveType;
import com.fern.types.Type;
import com.fern.types.TypeReference;
import com.fern.types.services.Encoding;
import com.fern.types.services.EndpointId;
import com.fern.types.services.FailedResponse;
import com.fern.types.services.HttpAuth;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpMethod;
import com.fern.types.services.HttpOkResponse;
import com.fern.types.services.HttpPath;
import com.fern.types.services.HttpPathPart;
import com.fern.types.services.HttpRequest;
import com.fern.types.services.HttpResponse;
import com.fern.types.services.HttpService;
import com.fern.types.services.PathParameter;
import com.fern.types.services.ResponseError;
import com.fern.types.services.ServiceName;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

public final class HttpServiceJerseyServerGeneratorTest {

    private static final String PACKAGE_PREFIX = "com";
    private static final GeneratorContext GENERATOR_CONTEXT = new GeneratorContext(
            Optional.of(PACKAGE_PREFIX), Collections.emptyMap(), Collections.emptyMap(), TestConstants.FERN_CONSTANTS);

    @Test
    public void test_basic() {
        HttpService testHttpService = HttpService.builder()
                .name(ServiceName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                        .name("PersonCrudService")
                        .build())
                .basePath("/person")
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId(EndpointId.valueOf("getPerson"))
                        .method(HttpMethod.GET)
                        .path(HttpPath.builder()
                                .head("/")
                                .addParts(HttpPathPart.builder()
                                        .pathParameter("personId")
                                        .tail("")
                                        .build())
                                .build())
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDeclaration.builder()
                                        .aliasOf(TypeReference._void())
                                        .build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                        .type(Type.alias(AliasTypeDeclaration.builder()
                                                .aliasOf(TypeReference.named(DeclaredTypeName.builder()
                                                        .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                                                        .name("Person")
                                                        .build()))
                                                .build()))
                                        .build())
                                .failed(FailedResponse.builder().build())
                                .build())
                        .auth(HttpAuth.NONE)
                        .addPathParameters(PathParameter.builder()
                                .key("personId")
                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                .build())
                        .build())
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId(EndpointId.valueOf("createPerson"))
                        .method(HttpMethod.POST)
                        .path(HttpPath.builder().head("/create").build())
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDeclaration.builder()
                                        .aliasOf(TypeReference.named(DeclaredTypeName.builder()
                                                .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                                                .name("CreatePersonRequest")
                                                .build()))
                                        .build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                        .type(Type.alias(AliasTypeDeclaration.builder()
                                                .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                                                .build()))
                                        .build())
                                .failed(FailedResponse.builder().build())
                                .build())
                        .auth(HttpAuth.NONE)
                        .build())
                .build();
        ModelGenerator modelGenerator = new ModelGenerator(
                Collections.singletonList(testHttpService),
                Collections.emptyList(),
                Collections.emptyList(),
                GENERATOR_CONTEXT);
        ModelGeneratorResult modelGeneratorResult = modelGenerator.generate();
        HttpServiceJerseyServerGenerator httpServiceJerseyServerGenerator = new HttpServiceJerseyServerGenerator(
                GENERATOR_CONTEXT,
                modelGeneratorResult.errors(),
                modelGeneratorResult.endpointModels().get(testHttpService),
                testHttpService);
        GeneratedHttpServiceServer generatedHttpServiceClient = httpServiceJerseyServerGenerator.generate();
        System.out.println(generatedHttpServiceClient.file().toString());
    }

    @Test
    public void test_withErrors() {
        ErrorDeclaration personIdNotFound = ErrorDeclaration.builder()
                .name(ErrorName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                        .name("PersonIdNotFound")
                        .build())
                .type(Type._object(ObjectTypeDeclaration.builder()
                        .addProperties(ObjectProperty.builder()
                                .key("personId")
                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                .build())
                        .build()))
                .http(HttpErrorConfiguration.builder().statusCode(400).build())
                .build();
        HttpService testHttpService = HttpService.builder()
                .name(ServiceName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                        .name("PersonCrudService")
                        .build())
                .basePath("/person")
                .addEndpoints(HttpEndpoint.builder()
                        .endpointId(EndpointId.valueOf("getPerson"))
                        .method(HttpMethod.GET)
                        .path(HttpPath.builder()
                                .head("/")
                                .addParts(HttpPathPart.builder()
                                        .pathParameter("personId")
                                        .tail("")
                                        .build())
                                .build())
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDeclaration.builder()
                                        .aliasOf(TypeReference._void())
                                        .build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                        .type(Type.alias(AliasTypeDeclaration.builder()
                                                .aliasOf(TypeReference.named(DeclaredTypeName.builder()
                                                        .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                                                        .name("Person")
                                                        .build()))
                                                .build()))
                                        .build())
                                .failed(FailedResponse.builder()
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
                        .endpointId(EndpointId.valueOf("createPerson"))
                        .method(HttpMethod.POST)
                        .path(HttpPath.builder().head("/create").build())
                        .request(HttpRequest.builder()
                                .encoding(Encoding.json())
                                .type(Type.alias(AliasTypeDeclaration.builder()
                                        .aliasOf(TypeReference.named(DeclaredTypeName.builder()
                                                .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                                                .name("CreatePersonRequest")
                                                .build()))
                                        .build()))
                                .build())
                        .response(HttpResponse.builder()
                                .encoding(Encoding.json())
                                .ok(HttpOkResponse.builder()
                                        .type(Type.alias(AliasTypeDeclaration.builder()
                                                .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                                                .build()))
                                        .build())
                                .failed(FailedResponse.builder().build())
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
        HttpServiceJerseyServerGenerator httpServiceJerseyServerGenerator = new HttpServiceJerseyServerGenerator(
                GENERATOR_CONTEXT,
                modelGeneratorResult.errors(),
                modelGeneratorResult.endpointModels().get(testHttpService),
                testHttpService);
        GeneratedHttpServiceServer generatedHttpServiceServer = httpServiceJerseyServerGenerator.generate();
        System.out.println(generatedHttpServiceServer.file().toString());
    }
}
