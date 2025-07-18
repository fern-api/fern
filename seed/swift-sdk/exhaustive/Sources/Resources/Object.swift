public final class ObjectClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnWithOptionalField(requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
    }

    public func getAndReturnWithRequiredField(requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField {
    }

    public func getAndReturnWithMapOfMap(requestOptions: RequestOptions? = nil) async throws -> ObjectWithMapOfMap {
    }

    public func getAndReturnNestedWithOptionalField(requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithOptionalField {
    }

    public func getAndReturnNestedWithRequiredField(requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
    }

    public func getAndReturnNestedWithRequiredFieldAsList(requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
    }
}