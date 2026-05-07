import Foundation

public final class ObjectClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnWithOptionalField(request: TypesObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-optional-field",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithOptionalField.self
        )
    }

    public func getAndReturnWithRequiredField(request: TypesObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-required-field",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithRequiredField.self
        )
    }

    public func getAndReturnWithMapOfMap(request: TypesObjectWithMapOfMap, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithMapOfMap {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-map-of-map",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithMapOfMap.self
        )
    }

    public func getAndReturnNestedWithOptionalField(request: TypesNestedObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> TypesNestedObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-optional-field",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesNestedObjectWithOptionalField.self
        )
    }

    public func getAndReturnNestedWithRequiredField(string: String, request: TypesNestedObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> TypesNestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-required-field/\(string)",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesNestedObjectWithRequiredField.self
        )
    }

    public func getAndReturnNestedWithRequiredFieldAsList(request: [TypesNestedObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> TypesNestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-nested-with-required-field-list",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesNestedObjectWithRequiredField.self
        )
    }

    public func getAndReturnWithUnknownField(request: TypesObjectWithUnknownField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithUnknownField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-unknown-field",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithUnknownField.self
        )
    }

    public func getAndReturnWithDocumentedUnknownType(request: TypesObjectWithDocumentedUnknownType, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithDocumentedUnknownType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-documented-unknown-type",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithDocumentedUnknownType.self
        )
    }

    public func getAndReturnMapOfDocumentedUnknownType(request: TypesMapOfDocumentedUnknownType, requestOptions: RequestOptions? = nil) async throws -> TypesMapOfDocumentedUnknownType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-map-of-documented-unknown-type",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesMapOfDocumentedUnknownType.self
        )
    }

    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnWithDatetimeLikeString(request: TypesObjectWithDatetimeLikeString, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithDatetimeLikeString {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/get-and-return-with-datetime-like-string",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithDatetimeLikeString.self
        )
    }
}