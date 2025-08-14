/*
 * (c) Copyright 2025 Birch Solutions Inc. All rights reserved.
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

package com.fern.java.client.generators;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.PathParameter;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public final class WireTestGenerator extends AbstractFileGenerator {

    private final HttpService service;
    private final ClientGeneratorContext context;
    private final Map<TypeId, ObjectTypeDeclaration> objectTypes;

    // MockWebServer and related types
    private static final ClassName MOCK_WEB_SERVER = ClassName.get("okhttp3.mockwebserver", "MockWebServer");
    private static final ClassName MOCK_RESPONSE = ClassName.get("okhttp3.mockwebserver", "MockResponse");
    private static final ClassName RECORDED_REQUEST = ClassName.get("okhttp3.mockwebserver", "RecordedRequest");
    private static final ClassName OBJECT_MAPPER = ClassName.get("com.fasterxml.jackson.databind", "ObjectMapper");
    private static final ClassName JSON_NODE = ClassName.get("com.fasterxml.jackson.databind", "JsonNode");

    public WireTestGenerator(
            HttpService service,
            ClientGeneratorContext context,
            Map<TypeId, ObjectTypeDeclaration> objectTypes) {
        super(
                ClassName.get(
                        context.getPoetClassNameFactory().getRootPackage() + ".test",
                        "ServiceWireTest"),
                context);
        this.service = service;
        this.context = context;
        this.objectTypes = objectTypes;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        TypeSpec.Builder testClassBuilder = TypeSpec.classBuilder(className)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addJavadoc("Wire protocol tests for service")
                .addField(generateMockServerField())
                .addField(generateClientField())
                .addField(generateObjectMapperField())
                .addMethod(generateSetupMethod())
                .addMethod(generateTeardownMethod());

        // Generate test methods for each endpoint
        for (HttpEndpoint endpoint : service.getEndpoints()) {
            testClassBuilder.addMethod(generateSuccessTest(endpoint));
            
            // Add query parameter test if endpoint has query parameters
            if (!endpoint.getQueryParameters().isEmpty()) {
                testClassBuilder.addMethod(generateQueryParameterTest(endpoint));
            }
            
            // Add request body test if endpoint has a request body
            if (endpoint.getRequestBody().isPresent()) {
                testClassBuilder.addMethod(generateRequestBodyTest(endpoint));
            }
            
            // Add error response tests
            testClassBuilder.addMethod(generate404ErrorTest(endpoint));
            testClassBuilder.addMethod(generate500ErrorTest(endpoint));
        }

        JavaFile javaFile = JavaFile.builder(className.packageName(), testClassBuilder.build())
                .addStaticImport(ClassName.get("org.junit.jupiter.api", "Assertions"), "*")
                .addStaticImport(ClassName.get("org.junit.jupiter.api", "Assertions"), "assertThrows")
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(javaFile)
                .testFile(true)
                .build();
    }

    private FieldSpec generateMockServerField() {
        return FieldSpec.builder(MOCK_WEB_SERVER, "server", Modifier.PRIVATE)
                .build();
    }

    private FieldSpec generateClientField() {
        String clientClassName = context.getCustomConfig().clientClassName()
                .orElse("SeedClientSideParamsClient");
        ClassName clientClass = context.getPoetClassNameFactory()
                .getRootClassName(clientClassName);
        return FieldSpec.builder(clientClass, "client", Modifier.PRIVATE)
                .build();
    }

    private FieldSpec generateObjectMapperField() {
        return FieldSpec.builder(OBJECT_MAPPER, "objectMapper", Modifier.PRIVATE)
                .initializer("new $T()", OBJECT_MAPPER)
                .build();
    }

    private MethodSpec generateSetupMethod() {
        String clientClassName = context.getCustomConfig().clientClassName()
                .orElse("SeedClientSideParamsClient");
        ClassName clientClass = context.getPoetClassNameFactory()
                .getRootClassName(clientClassName);
        ClassName clientBuilderClass = ClassName.get(
                clientClass.packageName(),
                clientClass.simpleName() + "Builder");

        return MethodSpec.methodBuilder("setup")
                .addAnnotation(ClassName.get("org.junit.jupiter.api", "BeforeEach"))
                .addModifiers(Modifier.PUBLIC)
                .addException(IOException.class)
                .addStatement("server = new $T()", MOCK_WEB_SERVER)
                .addStatement("server.start()")
                .addStatement("client = $T.builder()$>.url(server.url(\"/\").toString()).build()$<",
                        clientBuilderClass)
                .build();
    }

    private MethodSpec generateTeardownMethod() {
        return MethodSpec.methodBuilder("teardown")
                .addAnnotation(ClassName.get("org.junit.jupiter.api", "AfterEach"))
                .addModifiers(Modifier.PUBLIC)
                .addException(IOException.class)
                .addStatement("server.shutdown()")
                .build();
    }

    private MethodSpec generateSuccessTest(HttpEndpoint endpoint) {
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        String testName = "test" + endpointName + "_SuccessResponse";
        
        MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(testName)
                .addAnnotation(ClassName.get("org.junit.jupiter.api", "Test"))
                .addModifiers(Modifier.PUBLIC)
                .addException(Exception.class)
                .addJavadoc("Test successful response for $L endpoint", 
                        endpointName);

        // Setup mock response
        methodBuilder.addComment("Given: Mock server returns successful response")
                .addStatement("server.enqueue(new $T()$>.setResponseCode(200).setBody(\"{\\\"status\\\":\\\"success\\\"}\")$<)",
                        MOCK_RESPONSE);

        // Make the API call
        methodBuilder.addComment("When: API call is made");
        String clientCall = generateClientCall(endpoint);
        methodBuilder.addStatement(clientCall);

        // Verify the request
        methodBuilder.addComment("Then: Verify request was made correctly")
                .addStatement("$T recorded = server.takeRequest()", RECORDED_REQUEST)
                .addStatement("assertNotNull(recorded)")
                .addStatement("assertEquals($S, recorded.getMethod())", 
                        endpoint.getMethod().toString())
                .addStatement("assertTrue(recorded.getPath().startsWith($S))",
                        endpoint.getPath().getHead());

        return methodBuilder.build();
    }

    private MethodSpec generateQueryParameterTest(HttpEndpoint endpoint) {
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        String testName = "test" + endpointName + "_QueryParameters";
        
        MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(testName)
                .addAnnotation(ClassName.get("org.junit.jupiter.api", "Test"))
                .addModifiers(Modifier.PUBLIC)
                .addException(Exception.class)
                .addJavadoc("Test query parameter serialization for $L endpoint",
                        endpointName);

        // Setup mock response
        methodBuilder.addStatement("server.enqueue(new $T().setResponseCode(200).setBody(\"{}\"))",
                MOCK_RESPONSE);

        // Make API call with query parameters
        String clientCall = generateClientCallWithQueryParams(endpoint);
        methodBuilder.addStatement(clientCall);

        // Verify query parameters in request
        methodBuilder.addStatement("$T recorded = server.takeRequest()", RECORDED_REQUEST)
                .addStatement("String path = recorded.getPath()")
                .addStatement("assertNotNull(path)");

        // Verify each query parameter is present
        for (QueryParameter queryParam : endpoint.getQueryParameters()) {
            String paramName = queryParam.getName().getWireValue();
            methodBuilder.addStatement("assertTrue(path.contains($S) || path.contains($S + \"=\"))",
                    paramName + "=", paramName);
        }

        return methodBuilder.build();
    }

    private MethodSpec generateRequestBodyTest(HttpEndpoint endpoint) {
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        String testName = "test" + endpointName + "_RequestBody";
        
        MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(testName)
                .addAnnotation(ClassName.get("org.junit.jupiter.api", "Test"))
                .addModifiers(Modifier.PUBLIC)
                .addException(Exception.class)
                .addJavadoc("Test request body serialization for $L endpoint",
                        endpointName);

        // Setup mock response
        methodBuilder.addStatement("server.enqueue(new $T().setResponseCode(200).setBody(\"{}\"))",
                MOCK_RESPONSE);

        // Make API call with request body
        String clientCall = generateClientCallWithBody(endpoint);
        methodBuilder.addStatement(clientCall);

        // Verify request body
        methodBuilder.addStatement("$T recorded = server.takeRequest()", RECORDED_REQUEST)
                .addStatement("String body = recorded.getBody().readUtf8()")
                .addStatement("assertNotNull(body)")
                .addStatement("$T bodyJson = objectMapper.readTree(body)", JSON_NODE)
                .addStatement("assertNotNull(bodyJson)");

        return methodBuilder.build();
    }

    private String generateClientCall(HttpEndpoint endpoint) {
        StringBuilder call = new StringBuilder("client.service()");
        
        // Call the endpoint method - getName() returns EndpointName with get() method
        String methodName = endpoint.getName().get().getCamelCase().getSafeName();
        call.append(".").append(methodName).append("(");
        
        // Add path parameters if any
        boolean first = true;
        for (PathParameter pathParam : endpoint.getPathParameters()) {
            if (!first) call.append(", ");
            call.append("\"test-").append(pathParam.getName().getSnakeCase().getSafeName()).append("\"");
            first = false;
        }
        
        call.append(")");
        return call.toString();
    }

    private String generateClientCallWithQueryParams(HttpEndpoint endpoint) {
        StringBuilder call = new StringBuilder("client.service()");
        
        // Build request object with query parameters - getName() returns EndpointName with get() method
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        String methodName = endpoint.getName().get().getCamelCase().getSafeName();
        String requestClassName = endpointName + "Request";
        call.append(".").append(methodName).append("(");
        
        // Add path parameters first
        for (PathParameter pathParam : endpoint.getPathParameters()) {
            call.append("\"test-").append(pathParam.getName().getSnakeCase().getSafeName()).append("\", ");
        }
        
        // Add request object with query parameters
        if (!endpoint.getQueryParameters().isEmpty()) {
            // Use fully qualified class name for the request
            String packageName = context.getPoetClassNameFactory().getRootPackage();
            call.append(packageName).append(".resources.service.requests.")
                .append(requestClassName).append(".builder()");
            for (QueryParameter queryParam : endpoint.getQueryParameters()) {
                // Use the actual parameter name from the query parameter
                String paramName = queryParam.getName().getName().getCamelCase().getSafeName();
                String testValue = generateTestValueForParam(queryParam);
                call.append(".").append(paramName)
                    .append("(").append(testValue).append(")");
            }
            call.append(".build()");
        }
        
        call.append(")");
        return call.toString();
    }

    private String generateClientCallWithBody(HttpEndpoint endpoint) {
        StringBuilder call = new StringBuilder("client.service()");
        
        // getName() returns EndpointName with get() method
        String methodName = endpoint.getName().get().getCamelCase().getSafeName();
        call.append(".").append(methodName).append("(");
        
        // Add path parameters
        for (PathParameter pathParam : endpoint.getPathParameters()) {
            call.append("\"test-").append(pathParam.getName().getSnakeCase().getSafeName()).append("\", ");
        }
        
        // Add simple request body
        if (endpoint.getRequestBody().isPresent()) {
            call.append("Map.of(\"test\", \"data\")");
        }
        
        call.append(")");
        return call.toString();
    }
    
    private MethodSpec generate404ErrorTest(HttpEndpoint endpoint) {
        // getName() returns EndpointName with get() method
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        String testName = "test" + endpointName + "_404Error";
        
        // Get the API error class name
        ClassName apiErrorClass = context.getPoetClassNameFactory()
                .getApiErrorClassName(
                        context.getGeneratorConfig().getOrganization(),
                        context.getGeneratorConfig().getWorkspaceName(),
                        context.getCustomConfig());
        
        MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(testName)
                .addAnnotation(ClassName.get("org.junit.jupiter.api", "Test"))
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Test 404 error response for $L endpoint", endpointName);

        // Setup mock error response
        methodBuilder.addComment("Given: Mock server returns 404 error")
                .addStatement("server.enqueue(new $T()$>.setResponseCode(404)" +
                        ".setBody(\"{\\\"error\\\":\\\"not_found\\\",\\\"message\\\":\\\"Resource not found\\\"}\")$<)",
                        MOCK_RESPONSE);

        // Make the API call and verify exception is thrown
        methodBuilder.addComment("When/Then: API call should throw exception with correct status code");
        String clientCall = generateClientCall(endpoint);
        methodBuilder.addStatement("$T exception = assertThrows($T.class, () -> { $L; })",
                        apiErrorClass, apiErrorClass, clientCall)
                .addStatement("assertEquals(404, exception.getStatusCode())");

        return methodBuilder.build();
    }

    private MethodSpec generate500ErrorTest(HttpEndpoint endpoint) {
        // getName() returns EndpointName with get() method
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        String testName = "test" + endpointName + "_500Error";
        
        // Get the API error class name
        ClassName apiErrorClass = context.getPoetClassNameFactory()
                .getApiErrorClassName(
                        context.getGeneratorConfig().getOrganization(),
                        context.getGeneratorConfig().getWorkspaceName(),
                        context.getCustomConfig());
        
        MethodSpec.Builder methodBuilder = MethodSpec.methodBuilder(testName)
                .addAnnotation(ClassName.get("org.junit.jupiter.api", "Test"))
                .addModifiers(Modifier.PUBLIC)
                .addJavadoc("Test 500 error response for $L endpoint", endpointName);

        // Setup mock error response
        methodBuilder.addComment("Given: Mock server returns 500 error")
                .addStatement("server.enqueue(new $T()$>.setResponseCode(500)" +
                        ".setBody(\"{\\\"error\\\":\\\"internal_error\\\",\\\"message\\\":\\\"Internal server error\\\"}\")$<)",
                        MOCK_RESPONSE);

        // Make the API call and verify exception is thrown
        methodBuilder.addComment("When/Then: API call should throw exception with correct status code");
        String clientCall = generateClientCall(endpoint);
        methodBuilder.addStatement("$T exception = assertThrows($T.class, () -> { $L; })",
                        apiErrorClass, apiErrorClass, clientCall)
                .addStatement("assertEquals(500, exception.getStatusCode())");

        return methodBuilder.build();
    }
    
    private String generateTestValueForParam(QueryParameter queryParam) {
        // Generate appropriate test values based on parameter type
        String paramName = queryParam.getName().getWireValue();
        
        // Check common parameter patterns
        if (paramName.contains("page") || paramName.contains("limit") || 
            paramName.contains("offset") || paramName.contains("per_page")) {
            return "10";
        } else if (paramName.contains("sort") || paramName.contains("order")) {
            return "\"asc\"";
        } else if (paramName.contains("include") || paramName.contains("totals")) {
            return "true";
        } else if (paramName.contains("fields")) {
            return "\"id,name\"";
        } else if (paramName.contains("search") || paramName.contains("query")) {
            return "\"test query\"";
        } else if (paramName.contains("format")) {
            return "\"json\"";
        } else {
            return "\"test-value\"";
        }
    }
}