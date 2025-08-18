import Foundation

public final class ObjectClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
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

    public func testIntegerOverflowEdgeCases(request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/object/test-integer-overflow-edge-cases",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }
}