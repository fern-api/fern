public final class ObjectClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}    public func getAndReturnWithOptionalField(requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/object/get-and-return-with-optional-field", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnWithRequiredField(requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/object/get-and-return-with-required-field", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnWithMapOfMap(requestOptions: RequestOptions? = nil) async throws -> ObjectWithMapOfMap {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/object/get-and-return-with-map-of-map", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnNestedWithOptionalField(requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/object/get-and-return-nested-with-optional-field", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnNestedWithRequiredField(string: String, requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/object/get-and-return-nested-with-required-field/\(string)", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnNestedWithRequiredFieldAsList(requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/object/get-and-return-nested-with-required-field-list", 
            requestOptions: requestOptions
        )
    }
}