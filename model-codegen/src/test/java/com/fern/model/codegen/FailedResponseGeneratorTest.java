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
package com.fern.model.codegen;

import static org.mockito.Mockito.when;

import com.fern.codegen.GeneratedEndpointError;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratorContext;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.fern.model.codegen.services.payloads.FailedResponseGenerator;
import com.fern.types.AliasTypeDeclaration;
import com.fern.types.ErrorDeclaration;
import com.fern.types.ErrorName;
import com.fern.types.FernFilepath;
import com.fern.types.HttpErrorConfiguration;
import com.fern.types.ObjectProperty;
import com.fern.types.ObjectTypeDeclaration;
import com.fern.types.PrimitiveType;
import com.fern.types.Type;
import com.fern.types.TypeReference;
import com.fern.types.services.EndpointId;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.fern.types.services.ResponseError;
import com.fern.types.services.ResponseErrors;
import com.fern.types.services.ServiceName;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class FailedResponseGeneratorTest {

    @Mock
    HttpService httpService;

    @Mock
    HttpEndpoint httpEndpoint;

    @Test
    public void test_basic() {
        when(httpService.name())
                .thenReturn(ServiceName.builder()
                        .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                        .name("UntitiledService")
                        .build());
        when(httpEndpoint.endpointId()).thenReturn(EndpointId.valueOf("getPlaylist"));
        ErrorName noViewPermissionsErrorNamedType = ErrorName.builder()
                .fernFilepath(FernFilepath.valueOf(List.of("fern")))
                .name("NoViewPermissionsError")
                .build();
        ErrorDeclaration noViewPermissionsErrorDef = ErrorDeclaration.builder()
                .name(noViewPermissionsErrorNamedType)
                .type(Type.alias(AliasTypeDeclaration.builder()
                        .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                        .build()))
                .build();
        when(httpEndpoint.errors())
                .thenReturn(ResponseErrors.valueOf(List.of(ResponseError.builder()
                        .discriminantValue("noViewPermissions")
                        .error(noViewPermissionsErrorNamedType)
                        .build())));
        GeneratorContext generatorContext = new GeneratorContext(
                TestConstants.PACKAGE_PREFIX,
                Collections.emptyMap(),
                Collections.singletonMap(
                        noViewPermissionsErrorNamedType,
                        ErrorDeclaration.builder()
                                .name(noViewPermissionsErrorNamedType)
                                .type(Type._object(ObjectTypeDeclaration.builder()
                                        .addProperties(ObjectProperty.builder()
                                                .key("msg")
                                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                                .build())
                                        .build()))
                                .http(HttpErrorConfiguration.builder()
                                        .statusCode(500)
                                        .build())
                                .build()),
                TestConstants.FERN_CONSTANTS);
        ErrorGenerator errorGenerator =
                new ErrorGenerator(noViewPermissionsErrorDef, generatorContext, Collections.emptyMap());
        GeneratedError generatedNoViewPermissionsError = errorGenerator.generate();
        FailedResponseGenerator failedResponseGenerator = new FailedResponseGenerator(
                httpService,
                httpEndpoint,
                generatorContext,
                Collections.singletonMap(noViewPermissionsErrorNamedType, generatedNoViewPermissionsError));
        GeneratedEndpointError generatedError = failedResponseGenerator.generate();
        System.out.println(generatedError.file().toString());
    }
}
