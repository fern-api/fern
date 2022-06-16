package com.fern.model.codegen;

import static org.mockito.Mockito.when;

import com.fern.codegen.GeneratedEndpointError;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratorContext;
import com.fern.java.test.TestConstants;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.fern.model.codegen.services.payloads.FailedResponseGenerator;
import com.fern.types.errors.ErrorDefinition;
import com.fern.types.errors.HttpErrorConfiguration;
import com.fern.types.services.commons.FailedResponse;
import com.fern.types.services.commons.ResponseError;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpService;
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
        when(httpService.name()).thenReturn(NamedType.builder()
                .fernFilepath(FernFilepath.valueOf("fern"))
                .name("UntitiledService")
                .build());
        when(httpEndpoint.endpointId()).thenReturn("getPlaylist");
        NamedType noViewPermissionsErrorNamedType = NamedType.builder()
                .fernFilepath(FernFilepath.valueOf("fern"))
                .name("NoViewPermissionsError")
                .build();
        ErrorDefinition noViewPermissionsErrorDef = ErrorDefinition.builder()
                .name(noViewPermissionsErrorNamedType)
                .type(Type.alias(AliasTypeDefinition.builder()
                        .aliasOf(TypeReference.primitive(PrimitiveType.STRING))
                        .build()))
                .build();
        FailedResponse failedResponse = FailedResponse.builder()
                .discriminant("_type")
                .addErrors(ResponseError.builder()
                        .discriminantValue("noViewPermissions")
                        .error(noViewPermissionsErrorNamedType)
                        .build())
                .build();
        GeneratorContext generatorContext = new GeneratorContext(
                Optional.of(TestConstants.PACKAGE_PREFIX),
                Collections.emptyMap(),
                Collections.singletonMap(
                        noViewPermissionsErrorNamedType,
                        ErrorDefinition.builder()
                                .name(noViewPermissionsErrorNamedType)
                                .type(Type._object(ObjectTypeDefinition.builder()
                                        .addProperties(ObjectProperty.builder()
                                                .key("msg")
                                                .valueType(TypeReference.primitive(PrimitiveType.STRING))
                                                .build())
                                        .build()))
                                .http(HttpErrorConfiguration.builder().statusCode(500).build())
                                .build()));
        ErrorGenerator errorGenerator = new ErrorGenerator(
                noViewPermissionsErrorDef, generatorContext, Collections.emptyMap());
        GeneratedError generatedNoViewPermissionsError = errorGenerator.generate();
        FailedResponseGenerator failedResponseGenerator =
                new FailedResponseGenerator(
                        httpService,
                        httpEndpoint,
                        failedResponse,
                        generatorContext,
                        Collections.singletonMap(noViewPermissionsErrorNamedType, generatedNoViewPermissionsError));
        GeneratedEndpointError generatedError = failedResponseGenerator.generate();
        System.out.println(generatedError.file().toString());
    }
}
