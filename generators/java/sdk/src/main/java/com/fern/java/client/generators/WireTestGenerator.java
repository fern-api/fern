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
import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.FileUploadRequest;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.http.PathParameter;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.TypeReference;
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

        return MethodSpec.methodBuilder("setup")
                .addAnnotation(ClassName.get("org.junit.jupiter.api", "BeforeEach"))
                .addModifiers(Modifier.PUBLIC)
                .addException(IOException.class)
                .addStatement("server = new $T()", MOCK_WEB_SERVER)
                .addStatement("server.start()")
                .addComment("Disable retries for tests to avoid timeouts")
                .addStatement("client = $T.builder()$>.url(server.url(\"/\").toString()).maxRetries(0).build()$<",
                        clientClass)
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

        // Setup mock response - need to return proper type based on endpoint
        methodBuilder.addComment("Given: Mock server returns successful response");
        
        // Determine the proper response body based on endpoint return type
        String responseBody = getSuccessResponseBody(endpoint);
        methodBuilder.addStatement("server.enqueue(new $T()$>.setResponseCode(200).setBody($S)$<)",
                        MOCK_RESPONSE, responseBody);

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

        // Setup mock response with proper body
        String responseBody = getSuccessResponseBody(endpoint);
        methodBuilder.addStatement("server.enqueue(new $T().setResponseCode(200).setBody($S))",
                MOCK_RESPONSE, responseBody);

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

        // Setup mock response with proper body
        String responseBody = getSuccessResponseBody(endpoint);
        methodBuilder.addStatement("server.enqueue(new $T().setResponseCode(200).setBody($S))",
                MOCK_RESPONSE, responseBody);

        // Make API call with request body
        String clientCall = generateClientCallWithBody(endpoint);
        methodBuilder.addStatement(clientCall);

        // Verify request body
        methodBuilder.addStatement("$T recorded = server.takeRequest()", RECORDED_REQUEST)
                .addStatement("String body = recorded.getBody().readUtf8()")
                .addStatement("assertNotNull(body)")
                .addStatement("com.fasterxml.jackson.databind.JsonNode bodyJson = objectMapper.readTree(body)")
                .addStatement("assertNotNull(bodyJson)");

        return methodBuilder.build();
    }

    private String generateClientCall(HttpEndpoint endpoint) {
        StringBuilder call = new StringBuilder("client.service()");
        
        // Call the endpoint method
        String methodName = endpoint.getName().get().getCamelCase().getSafeName();
        call.append(".").append(methodName).append("(");
        
        // Add path parameters if any
        boolean needsComma = false;
        for (PathParameter pathParam : endpoint.getPathParameters()) {
            if (needsComma) call.append(", ");
            call.append("\"test-").append(pathParam.getName().getSnakeCase().getSafeName()).append("\"");
            needsComma = true;
        }
        
        // Determine if we need a request object based on the IR
        boolean hasWrapperRequest = endpoint.getSdkRequest().isPresent();
        boolean hasQueryParams = !endpoint.getQueryParameters().isEmpty();
        boolean hasRequestBody = endpoint.getRequestBody().isPresent();
        
        // If endpoint has SDK request wrapper OR has query params (but no body), it needs a request object
        if (hasWrapperRequest || (hasQueryParams && !hasRequestBody)) {
            if (needsComma) call.append(", ");
            call.append(generateRequestObject(endpoint));
        } else if (hasRequestBody) {
            // Endpoint has a direct request body - determine what to pass
            if (needsComma) call.append(", ");
            call.append(generateRequestBody(endpoint));
        }
        
        call.append(")");
        return call.toString();
    }

    private String generateClientCallWithQueryParams(HttpEndpoint endpoint) {
        StringBuilder call = new StringBuilder("client.service()");
        
        String methodName = endpoint.getName().get().getCamelCase().getSafeName();
        call.append(".").append(methodName).append("(");
        
        // Add path parameters first
        boolean needsComma = false;
        for (PathParameter pathParam : endpoint.getPathParameters()) {
            if (needsComma) call.append(", ");
            call.append("\"test-").append(pathParam.getName().getSnakeCase().getSafeName()).append("\"");
            needsComma = true;
        }
        
        // Add request object with query parameters
        if (!endpoint.getQueryParameters().isEmpty()) {
            if (needsComma) call.append(", ");
            call.append(generateRequestObjectWithQueryParams(endpoint));
        }
        
        call.append(")");
        return call.toString();
    }

    private String generateClientCallWithBody(HttpEndpoint endpoint) {
        StringBuilder call = new StringBuilder("client.service()");
        
        String methodName = endpoint.getName().get().getCamelCase().getSafeName();
        call.append(".").append(methodName).append("(");
        
        // Add path parameters
        boolean needsComma = false;
        for (PathParameter pathParam : endpoint.getPathParameters()) {
            if (needsComma) call.append(", ");
            call.append("\"test-").append(pathParam.getName().getSnakeCase().getSafeName()).append("\"");
            needsComma = true;
        }
        
        // Add request body
        if (endpoint.getRequestBody().isPresent()) {
            if (needsComma) call.append(", ");
            call.append(generateRequestBodyForTest(endpoint));
        }
        
        call.append(")");
        return call.toString();
    }
    
    private MethodSpec generate404ErrorTest(HttpEndpoint endpoint) {
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
                .addStatement("assertEquals(404, exception.statusCode())");

        return methodBuilder.build();
    }

    private MethodSpec generate500ErrorTest(HttpEndpoint endpoint) {
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
                .addStatement("assertEquals(500, exception.statusCode())");

        return methodBuilder.build();
    }
    
    private String generateRequestObject(HttpEndpoint endpoint) {
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        String packageName = context.getPoetClassNameFactory().getRootPackage();
        
        // Check if this endpoint has an SDK request wrapper
        if (endpoint.getSdkRequest().isPresent()) {
            // Use the wrapper request pattern
            return packageName + ".resources.service.requests." + endpointName + "Request.builder().build()";
        }
        
        // For endpoints with only query params, generate minimal request
        return packageName + ".resources.service.requests." + endpointName + "Request.builder().build()";
    }
    
    private String generateRequestObjectWithQueryParams(HttpEndpoint endpoint) {
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        String packageName = context.getPoetClassNameFactory().getRootPackage();
        StringBuilder builder = new StringBuilder(packageName)
                .append(".resources.service.requests.")
                .append(endpointName)
                .append("Request.builder()");
        
        // Add query parameters with test values
        for (QueryParameter queryParam : endpoint.getQueryParameters()) {
            String paramName = queryParam.getName().getName().getCamelCase().getSafeName();
            String testValue = generateTestValueForParam(queryParam);
            builder.append(".").append(paramName).append("(").append(testValue).append(")");
        }
        
        builder.append(".build()");
        return builder.toString();
    }
    
    private String generateRequestBody(HttpEndpoint endpoint) {
        if (!endpoint.getRequestBody().isPresent()) {
            return "null";
        }
        
        HttpRequestBody requestBody = endpoint.getRequestBody().get();
        
        return requestBody.visit(new HttpRequestBody.Visitor<String>() {
            @Override
            public String visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                // For inlined request bodies, use a map
                return "java.util.Map.of(\"test\", \"data\")";
            }
            
            @Override
            public String visitReference(HttpRequestBodyReference reference) {
                TypeReference typeRef = reference.getRequestBodyType();
                
                // Check if it's a named type (custom object)
                if (typeRef.isNamed()) {
                    String typeName = typeRef.getNamed().get().getName().getPascalCase().getSafeName();
                    String packageName = context.getPoetClassNameFactory().getRootPackage();
                    
                    // Try to determine the package location
                    return packageName + ".resources.types.types." + typeName + ".builder().build()";
                }
                
                // Fallback to a simple map for unknown types
                return "java.util.Map.of(\"test\", \"data\")";
            }
            
            @Override
            public String visitFileUpload(FileUploadRequest fileUpload) {
                // Not handling file uploads in tests for now
                return "null";
            }
            
            @Override
            public String visitBytes(BytesRequest bytes) {
                // For byte arrays, return a test byte array
                return "\"test\".getBytes()";
            }
            
            @Override
            public String _visitUnknown(Object unknownType) {
                return "java.util.Map.of(\"test\", \"data\")";
            }
        });
    }
    
    private String generateRequestBodyForTest(HttpEndpoint endpoint) {
        if (!endpoint.getRequestBody().isPresent()) {
            return "null";
        }
        
        HttpRequestBody requestBody = endpoint.getRequestBody().get();
        
        return requestBody.visit(new HttpRequestBody.Visitor<String>() {
            @Override
            public String visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
                // Generate an inline request body object
                String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
                String packageName = context.getPoetClassNameFactory().getRootPackage();
                return packageName + ".resources.service.requests." + endpointName + "Request.builder().build()";
            }
            
            @Override
            public String visitReference(HttpRequestBodyReference reference) {
                TypeReference typeRef = reference.getRequestBodyType();
                
                if (typeRef.isNamed()) {
                    String typeName = typeRef.getNamed().get().getName().getPascalCase().getSafeName();
                    String packageName = context.getPoetClassNameFactory().getRootPackage();
                    
                    // Check if this type ends with "Request" - if so, it's likely a request type
                    if (typeName.endsWith("Request")) {
                        return packageName + ".resources.types.types." + typeName + ".builder().build()";
                    }
                    
                    // For other types, still use the types package
                    return packageName + ".resources.types.types." + typeName + ".builder().build()";
                }
                
                // Fallback for simple types or unknown patterns
                return "java.util.Map.of(\"test\", \"data\")";
            }
            
            @Override
            public String visitFileUpload(FileUploadRequest fileUpload) {
                // Not handling file uploads in tests for now
                return "null";
            }
            
            @Override
            public String visitBytes(BytesRequest bytes) {
                // For byte arrays, return a test byte array
                return "\"test\".getBytes()";
            }
            
            @Override
            public String _visitUnknown(Object unknownType) {
                return "java.util.Map.of(\"test\", \"data\")";
            }
        });
    }
    
    private String generateTestValueForParam(QueryParameter queryParam) {
        // Generate appropriate test values based on parameter type
        String paramName = queryParam.getName().getWireValue();
        TypeReference typeRef = queryParam.getValueType();
        
        // Check common parameter patterns first
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
        }
        
        // Use type information for more accurate values
        if (typeRef.isPrimitive()) {
            // For primitive types, just return simple test values
            // This is simpler than using the visitor pattern for test data
            return "\"test-value\"";
        }
        
        return "\"test-value\"";
    }
    
    private String getSuccessResponseBody(HttpEndpoint endpoint) {
        // Generate appropriate response body based on endpoint
        String endpointName = endpoint.getName().get().getPascalCase().getSafeName();
        
        // Check endpoint patterns and return appropriate mock data
        if (endpointName.contains("List")) {
            // Check if it's a paginated response
            if (endpointName.equals("ListUsers")) {
                return "{\"users\":[{\"user_id\":\"test-id\",\"email\":\"test@example.com\",\"email_verified\":true}],\"start\":0,\"limit\":50,\"length\":1}";
            }
            // Return array for list endpoints
            return "[{\"id\":\"test-id\",\"name\":\"Test Resource\",\"description\":\"Test description\"}]";
        } else if (endpointName.contains("Search")) {
            // Return search response structure
            return "{\"results\":[{\"id\":\"test-id\",\"name\":\"Test Resource\"}],\"total\":1,\"nextOffset\":null}";
        } else if (endpointName.contains("User")) {
            // Return User object for user endpoints
            return "{\"user_id\":\"test-id\",\"email\":\"test@example.com\",\"email_verified\":true,\"created_at\":\"2024-01-01T00:00:00Z\",\"updated_at\":\"2024-01-01T00:00:00Z\"}";
        } else if (endpointName.contains("Get")) {
            // Return single resource
            return "{\"id\":\"test-id\",\"name\":\"Test Resource\",\"description\":\"Test description\"}";
        } else if (endpointName.contains("Create") || endpointName.contains("Update")) {
            // Return created/updated resource
            return "{\"id\":\"test-id\",\"name\":\"Test Resource\",\"description\":\"Test description\"}";
        } else if (endpointName.contains("Delete")) {
            // Return empty response for delete
            return "{}";
        } else {
            // Default response
            return "{\"success\":true}";
        }
    }
}