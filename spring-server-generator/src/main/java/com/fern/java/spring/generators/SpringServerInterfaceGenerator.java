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
package com.fern.java.spring.generators;

import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpRequest;
import com.fern.ir.model.services.http.HttpResponse;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedAuthFiles;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.spring.SpringGeneratorContext;
import com.fern.java.spring.generators.spring.AuthToSpringParameterSpecConverter;
import com.fern.java.spring.generators.spring.SpringHttpMethodToAnnotationSpec;
import com.fern.java.spring.generators.spring.SpringParameterSpecFactory;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.security.Principal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

public final class SpringServerInterfaceGenerator extends AbstractFileGenerator {

    private final HttpService httpService;
    private final Optional<GeneratedAuthFiles> maybeAuth;
    private final SpringParameterSpecFactory springParameterSpecFactory;

    public SpringServerInterfaceGenerator(
            SpringGeneratorContext springGeneratorContext,
            Optional<GeneratedAuthFiles> maybeAuth,
            HttpService httpService) {
        super(
                springGeneratorContext.getPoetClassNameFactory().getServiceInterfaceClassName(httpService),
                springGeneratorContext);
        this.httpService = httpService;
        this.maybeAuth = maybeAuth;
        this.springParameterSpecFactory = new SpringParameterSpecFactory(springGeneratorContext);
    }

    @Override
    public GeneratedFile generateFile() {
        TypeSpec.Builder jerseyServiceBuilder = TypeSpec.interfaceBuilder(className)
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(AnnotationSpec.builder(RequestMapping.class)
                        .addMember("path", "$S", httpService.getBasePath().orElse("/"))
                        .addMember("consumes", "$S", "application/json")
                        .addMember("produces", "$S", "application/json")
                        .build());
        Map<HttpEndpointId, MethodSpec> endpointToMethodSpec = new LinkedHashMap<>();
        httpService.getEndpoints().forEach(httpEndpoint -> {
            endpointToMethodSpec.put(httpEndpoint.getId(), getEndpointMethodSpec(httpEndpoint));
        });
        TypeSpec springServiceTypeSpec =
                jerseyServiceBuilder.addMethods(endpointToMethodSpec.values()).build();
        JavaFile springServiceJavaFile =
                JavaFile.builder(className.packageName(), springServiceTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(springServiceJavaFile)
                .build();
    }

    private MethodSpec getEndpointMethodSpec(HttpEndpoint httpEndpoint) {
        List<ParameterSpec> endpointParameters = getEndpointMethodParameters(httpEndpoint);
        MethodSpec.Builder endpointMethodBuilder = MethodSpec.methodBuilder(
                        httpEndpoint.getName().getCamelCase())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .addAnnotation(httpEndpoint.getMethod().visit(new SpringHttpMethodToAnnotationSpec(httpEndpoint)))
                .addParameters(endpointParameters);

        HttpResponse httpResponse = httpEndpoint.getResponse();
        if (!httpResponse.getType().isVoid()) {
            TypeName responseTypeName =
                    generatorContext.getPoetTypeNameMapper().convertToTypeName(true, httpResponse.getType());
            endpointMethodBuilder.returns(responseTypeName);
        }

        return endpointMethodBuilder.build();
    }

    private List<ParameterSpec> getEndpointMethodParameters(HttpEndpoint httpEndpoint) {
        List<ParameterSpec> parameters = new ArrayList<>();

        // auth
        maybeAuth.ifPresent(auth -> {
            AuthToSpringParameterSpecConverter authToJerseyParameterSpecConverter =
                    new AuthToSpringParameterSpecConverter(generatorContext, auth);
            parameters.addAll(authToJerseyParameterSpecConverter.getAuthParameters(httpEndpoint));
        });

        if (httpEndpoint.getAuth()) {
            boolean isPrincipalPresent = httpService.getHeaders().stream()
                            .anyMatch(httpHeader ->
                                    httpHeader.getName().getCamelCase().equalsIgnoreCase("principal"))
                    || httpService.getPathParameters().stream()
                            .anyMatch(pathParameter ->
                                    pathParameter.getName().getCamelCase().equalsIgnoreCase("principal"))
                    || httpService.getPathParameters().stream()
                            .anyMatch(queryParameter ->
                                    queryParameter.getName().getCamelCase().equalsIgnoreCase("principal"));
            parameters.add(ParameterSpec.builder(
                            ClassName.get(Principal.class), isPrincipalPresent ? "_principal" : "principal")
                    .build());
        }

        // headers
        generatorContext.getGlobalHeaders().getRequiredGlobalHeaders().forEach(httpHeader -> {
            parameters.add(springParameterSpecFactory.getHeaderParameterSpec(httpHeader));
        });
        generatorContext.getGlobalHeaders().getOptionalGlobalHeaders().forEach(httpHeader -> {
            parameters.add(springParameterSpecFactory.getHeaderParameterSpec(httpHeader));
        });
        httpService.getHeaders().forEach(httpHeader -> {
            parameters.add(springParameterSpecFactory.getHeaderParameterSpec(httpHeader));
        });
        httpEndpoint.getHeaders().forEach(httpHeader -> {
            parameters.add(springParameterSpecFactory.getHeaderParameterSpec(httpHeader));
        });

        // path params
        httpEndpoint.getPathParameters().forEach(pathParameter -> {
            parameters.add(springParameterSpecFactory.getPathParameterSpec(pathParameter));
        });

        // query params
        httpEndpoint.getQueryParameters().forEach(queryParameter -> {
            parameters.add(springParameterSpecFactory.getQueryParameterSpec(queryParameter));
        });

        // request body
        HttpRequest httpRequest = httpEndpoint.getRequest();
        if (!httpRequest.getType().isVoid()) {
            TypeName requestTypeName =
                    generatorContext.getPoetTypeNameMapper().convertToTypeName(true, httpRequest.getType());
            parameters.add(ParameterSpec.builder(requestTypeName, "body")
                    .addAnnotation(RequestBody.class)
                    .build());
        }

        return parameters;
    }
}
