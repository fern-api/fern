import Foundation

public final class EndpointsObjectClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsObjectGetAndReturnWithOptionalField(request: TypesObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-optional-field",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithOptionalField.self
        )
    }

    public func endpointsObjectGetAndReturnWithRequiredField(request: TypesObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-required-field",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithRequiredField.self
        )
    }

    public func endpointsObjectGetAndReturnWithMapOfMap(request: TypesObjectWithMapOfMap, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithMapOfMap {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-map-of-map",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithMapOfMap.self
        )
    }

    public func endpointsObjectGetAndReturnNestedWithOptionalField(request: TypesNestedObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> TypesNestedObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-optional-field",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesNestedObjectWithOptionalField.self
        )
    }

    public func endpointsObjectGetAndReturnNestedWithRequiredField(string: String, request: TypesNestedObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> TypesNestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-required-field/\(string)",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesNestedObjectWithRequiredField.self
        )
    }

    public func endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(request: [TypesNestedObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> TypesNestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-required-field-list",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesNestedObjectWithRequiredField.self
        )
    }

    public func endpointsObjectGetAndReturnWithUnknownField(request: TypesObjectWithUnknownField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithUnknownField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-unknown-field",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithUnknownField.self
        )
    }

    public func endpointsObjectGetAndReturnWithDocumentedUnknownType(request: TypesObjectWithDocumentedUnknownType, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithDocumentedUnknownType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-documented-unknown-type",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithDocumentedUnknownType.self
        )
    }

    public func endpointsObjectGetAndReturnMapOfDocumentedUnknownType(request: TypesMapOfDocumentedUnknownType, requestOptions: RequestOptions? = nil) async throws -> TypesMapOfDocumentedUnknownType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-map-of-documented-unknown-type",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesMapOfDocumentedUnknownType.self
        )
    }

    /// Tests that dynamic snippets include all required properties in the
    /// object initializer, even when the example omits some required fields.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(request: TypesObjectWithMixedRequiredAndOptionalFields, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithMixedRequiredAndOptionalFields {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-mixed-required-and-optional-fields",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithMixedRequiredAndOptionalFields.self
        )
    }

    /// Tests that dynamic snippets recursively construct default objects for
    /// required properties whose type is a named object. When the example
    /// omits the nested object, the generator should construct a default
    /// initializer with the nested object's required properties filled in.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsObjectGetAndReturnWithRequiredNestedObject(request: TypesObjectWithRequiredNestedObject, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithRequiredNestedObject {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-required-nested-object",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithRequiredNestedObject.self
        )
    }

    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsObjectGetAndReturnWithDatetimeLikeString(request: TypesObjectWithDatetimeLikeString, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithDatetimeLikeString {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-datetime-like-string",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithDatetimeLikeString.self
        )
    }
}