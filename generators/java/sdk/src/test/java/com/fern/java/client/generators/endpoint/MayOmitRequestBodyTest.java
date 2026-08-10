package com.fern.java.client.generators.endpoint;

import static org.assertj.core.api.Assertions.assertThat;

import com.fern.ir.model.commons.FernFilepath;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameOrString;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.SdkRequest;
import com.fern.ir.model.http.SdkRequestShape;
import com.fern.ir.model.http.SdkRequestBodyType;
import com.fern.ir.model.http.SdkRequestWrapper;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.TypeReference;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/**
 * Pins when {@link AbstractEndpointWriter#mayOmitRequestBody} lets the caller leave the request body out of the call.
 * The IR field is additive, so it may only be read once the generator is configured to respect it.
 */
class MayOmitRequestBodyTest {

    @Test
    void notRespected_isNeverOmittable() {
        assertThat(AbstractEndpointWriter.mayOmitRequestBody(
                        false, Optional.of(justRequestBody()), Optional.of(referencedBody(Optional.of(false)))))
                .isFalse();
    }

    @Test
    void requiredFalse_isOmittable() {
        assertThat(AbstractEndpointWriter.mayOmitRequestBody(
                        true, Optional.of(justRequestBody()), Optional.of(referencedBody(Optional.of(false)))))
                .isTrue();
    }

    @Test
    void requiredTrue_isNotOmittable() {
        assertThat(AbstractEndpointWriter.mayOmitRequestBody(
                        true, Optional.of(justRequestBody()), Optional.of(referencedBody(Optional.of(true)))))
                .isFalse();
    }

    @Test
    void requiredAbsent_isNotOmittable() {
        assertThat(AbstractEndpointWriter.mayOmitRequestBody(
                        true, Optional.of(justRequestBody()), Optional.of(referencedBody(Optional.empty()))))
                .isFalse();
    }

    @Test
    void wrappedRequest_isNotOmittable() {
        assertThat(AbstractEndpointWriter.mayOmitRequestBody(
                        true, Optional.of(wrappedRequest()), Optional.of(referencedBody(Optional.of(false)))))
                .isFalse();
    }

    @Test
    void noRequestBody_isNotOmittable() {
        assertThat(AbstractEndpointWriter.mayOmitRequestBody(true, Optional.of(justRequestBody()), Optional.empty()))
                .isFalse();
    }

    private static HttpRequestBody referencedBody(Optional<Boolean> required) {
        return HttpRequestBody.reference(bodyReference(required));
    }

    private static SdkRequest justRequestBody() {
        return sdkRequest(
                SdkRequestShape.justRequestBody(SdkRequestBodyType.typeReference(bodyReference(Optional.empty()))));
    }

    private static HttpRequestBodyReference bodyReference(Optional<Boolean> required) {
        return HttpRequestBodyReference.builder()
                .requestBodyType(TypeReference.named(NamedType.builder()
                        .typeId(TypeId.of("body-type-id"))
                        .fernFilepath(FernFilepath.builder().build())
                        .name(nameOrString("Body"))
                        .build()))
                .contentType(Optional.empty())
                .required(required)
                .build();
    }

    private static SdkRequest wrappedRequest() {
        return sdkRequest(SdkRequestShape.wrapper(SdkRequestWrapper.builder()
                .wrapperName(nameOrString("Request"))
                .bodyKey(nameOrString("body"))
                .includePathParameters(false)
                .onlyPathParameters(false)
                .build()));
    }

    private static SdkRequest sdkRequest(SdkRequestShape shape) {
        return SdkRequest.builder()
                .requestParameterName(nameOrString("request"))
                .shape(shape)
                .build();
    }

    private static NameOrString nameOrString(String value) {
        return NameOrString.of(name(value));
    }

    private static Name name(String value) {
        SafeAndUnsafeString string = SafeAndUnsafeString.builder()
                .unsafeName(value)
                .safeName(value)
                .build();
        return Name.builder()
                .originalName(value)
                .camelCase(string)
                .pascalCase(string)
                .snakeCase(string)
                .screamingSnakeCase(string)
                .build();
    }
}
