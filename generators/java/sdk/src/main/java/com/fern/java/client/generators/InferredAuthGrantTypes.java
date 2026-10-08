package com.fern.java.client.generators;

import com.fern.ir.model.auth.InferredAuthGrantType;
import com.fern.ir.model.auth.InferredAuthScheme;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpResponseBody;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.JsonResponseBody;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveTypeV1;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.generators.endpoint.PaginationPathUtils;
import com.fern.java.utils.NameUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * Fixed grant type handling for inferred auth (e.g. {@code type: refresh-token}): the grant type property is sent with
 * a fixed value instead of being a client option, and a refresh token grant only exposes the OAuth refresh grant
 * parameters (RFC 6749 section 6) plus required ones.
 */
final class InferredAuthGrantTypes {

    static final String REFRESH_TOKEN_GRANT_TYPE = "refresh_token";
    static final String REFRESH_TOKEN_PROPERTY = "refresh_token";

    private static final Set<String> REFRESH_TOKEN_GRANT_PROPERTIES =
            Set.of("refreshtoken", "scope", "clientid", "clientsecret");

    private InferredAuthGrantTypes() {}

    static Optional<InferredAuthGrantType> getGrantType(InferredAuthScheme scheme) {
        return scheme.getTokenEndpoint().getGrantType();
    }

    static Optional<String> getGrantTypeWireValue(InferredAuthScheme scheme) {
        return getGrantType(scheme).flatMap(grantType -> {
            if (grantType.getRequestProperty().getPropertyPath().isPresent()
                    && !grantType.getRequestProperty().getPropertyPath().get().isEmpty()) {
                return Optional.empty();
            }
            if (grantType.getRequestProperty().getProperty().isBody()) {
                return Optional.of(NameUtils.getWireValue(grantType
                        .getRequestProperty()
                        .getProperty()
                        .getBody()
                        .get()
                        .getName()));
            }
            return grantType
                    .getRequestProperty()
                    .getProperty()
                    .getQuery()
                    .map(query -> NameUtils.getWireValue(query.getName()));
        });
    }

    static boolean isRefreshTokenGrant(InferredAuthScheme scheme) {
        return getGrantType(scheme)
                .map(grantType -> REFRESH_TOKEN_GRANT_TYPE.equals(grantType.getValue()))
                .orElse(false);
    }

    static boolean isGrantTypeProperty(InferredAuthScheme scheme, String wireValue) {
        return getGrantTypeWireValue(scheme).map(wireValue::equals).orElse(false);
    }

    /** Whether a non-literal token endpoint property is a client option and sent by the token supplier. */
    static boolean isCredentialProperty(InferredAuthScheme scheme, String wireValue, boolean isOptional) {
        if (isGrantTypeProperty(scheme, wireValue)) {
            return false;
        }
        if (isRefreshTokenGrant(scheme) && isOptional) {
            return REFRESH_TOKEN_GRANT_PROPERTIES.contains(normalize(wireValue));
        }
        return true;
    }

    static boolean isRefreshTokenProperty(String wireValue) {
        return normalize(wireValue).equals(normalize(REFRESH_TOKEN_PROPERTY));
    }

    /**
     * Returns the token response's {@code refresh_token} property when the supplier should rotate the refresh token: a
     * refresh token grant that sends a refresh token, whose token response is an object with that property.
     */
    static Optional<ObjectProperty> getRotatedRefreshTokenProperty(
            ClientGeneratorContext context,
            InferredAuthScheme scheme,
            HttpEndpoint httpEndpoint,
            boolean sendsRefreshToken) {
        if (!isRefreshTokenGrant(scheme) || !sendsRefreshToken) {
            return Optional.empty();
        }
        Optional<TypeReference> responseType = httpEndpoint
                .getResponse()
                .flatMap(response -> response.getBody())
                .flatMap(HttpResponseBody::getJson)
                .flatMap(json -> json.getResponse())
                .map(JsonResponseBody::getResponseBodyType);
        if (responseType.isEmpty() || !responseType.get().isNamed()) {
            return Optional.empty();
        }
        return responseType
                .get()
                .visit(new PaginationPathUtils.TypeReferenceResolver(context))
                .map(TypeDeclaration::getShape)
                .flatMap(shape -> shape.getObject())
                .flatMap(objectDeclaration -> resolvedObjectProperties(objectDeclaration).stream()
                        .filter(property -> isRefreshTokenProperty(NameUtils.getWireValue(property.getName())))
                        .filter(property -> isStringOrOptionalString(property.getValueType()))
                        .findFirst());
    }

    static boolean isOptionalProperty(ObjectProperty property) {
        return property.getValueType().isContainer()
                && property.getValueType().getContainer().get().isOptional();
    }

    static Optional<ObjectProperty> getRotatedRefreshTokenProperty(
            ClientGeneratorContext context, InferredAuthScheme scheme, boolean sendsRefreshToken) {
        HttpService httpService = context.getIr()
                .getServices()
                .get(scheme.getTokenEndpoint().getEndpoint().getServiceId());
        HttpEndpoint httpEndpoint = httpService.getEndpoints().stream()
                .filter(it -> it.getId()
                        .equals(scheme.getTokenEndpoint().getEndpoint().getEndpointId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Could not find token endpoint"));
        return getRotatedRefreshTokenProperty(context, scheme, httpEndpoint, sendsRefreshToken);
    }

    private static boolean isStringOrOptionalString(TypeReference typeReference) {
        if (typeReference.isPrimitive()) {
            return isString(typeReference);
        }
        return typeReference.isContainer()
                && typeReference.getContainer().get().isOptional()
                && isString(typeReference.getContainer().get().getOptional().get());
    }

    private static boolean isString(TypeReference typeReference) {
        return typeReference
                .getPrimitive()
                .map(primitive -> PrimitiveTypeV1.STRING.equals(primitive.getV1()))
                .orElse(false);
    }

    private static List<ObjectProperty> resolvedObjectProperties(ObjectTypeDeclaration objectDeclaration) {
        List<ObjectProperty> resolved = new ArrayList<>();
        objectDeclaration.getExtendedProperties().stream().flatMap(List::stream).forEach(resolved::add);
        resolved.addAll(objectDeclaration.getProperties());
        return resolved;
    }

    private static String normalize(String wireValue) {
        return wireValue.replace("_", "").replace("-", "").toLowerCase(Locale.ROOT);
    }
}
