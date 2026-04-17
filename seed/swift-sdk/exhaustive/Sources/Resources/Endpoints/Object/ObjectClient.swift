import Foundation

public final class ObjectClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnWithOptionalField(request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-optional-field",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    public func getAndReturnWithRequiredField(request: ObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-required-field",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithRequiredField.self
        )
    }

    public func getAndReturnWithMapOfMap(request: ObjectWithMapOfMap, requestOptions: RequestOptions? = nil) async throws -> ObjectWithMapOfMap {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-map-of-map",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithMapOfMap.self
        )
    }

    public func getAndReturnNestedWithOptionalField(request: NestedObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-optional-field",
            body: request,
            requestOptions: requestOptions,
            responseType: NestedObjectWithOptionalField.self
        )
    }

    public func getAndReturnNestedWithRequiredField(string: String, request: NestedObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-required-field/\(string)",
            body: request,
            requestOptions: requestOptions,
            responseType: NestedObjectWithRequiredField.self
        )
    }

    public func getAndReturnNestedWithRequiredFieldAsList(request: [NestedObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-required-field-list",
            body: request,
            requestOptions: requestOptions,
            responseType: NestedObjectWithRequiredField.self
        )
    }

    public func getAndReturnWithUnknownField(request: ObjectWithUnknownField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithUnknownField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-unknown-field",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithUnknownField.self
        )
    }

    public func getAndReturnWithDocumentedUnknownType(request: ObjectWithDocumentedUnknownType, requestOptions: RequestOptions? = nil) async throws -> ObjectWithDocumentedUnknownType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-documented-unknown-type",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithDocumentedUnknownType.self
        )
    }

    public func getAndReturnMapOfDocumentedUnknownType(request: MapOfDocumentedUnknownType, requestOptions: RequestOptions? = nil) async throws -> MapOfDocumentedUnknownType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-map-of-documented-unknown-type",
            body: request,
            requestOptions: requestOptions,
            responseType: MapOfDocumentedUnknownType.self
        )
    }

    /// Tests that dynamic snippets include all required properties in the
    /// object initializer, even when the example omits some required fields.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithMixedRequiredAndOptionalFields(request: ObjectWithMixedRequiredAndOptionalFields, requestOptions: RequestOptions? = nil) async throws -> ObjectWithMixedRequiredAndOptionalFields {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-mixed-required-and-optional-fields",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithMixedRequiredAndOptionalFields.self
        )
    }

    /// Tests that dynamic snippets recursively construct default objects for
    /// required properties whose type is a named object. When the example
    /// omits the nested object, the generator should construct a default
    /// initializer with the nested object's required properties filled in.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithRequiredNestedObject(request: ObjectWithRequiredNestedObject, requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredNestedObject {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-required-nested-object",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithRequiredNestedObject.self
        )
    }

    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithDatetimeLikeString(request: ObjectWithDatetimeLikeString, requestOptions: RequestOptions? = nil) async throws -> ObjectWithDatetimeLikeString {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-datetime-like-string",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithDatetimeLikeString.self
        )
    }
}