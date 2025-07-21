public final class ObjectClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnWithOptionalField(requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        fatalError("Not implemented.")
    }

    public func getAndReturnWithRequiredField(requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField {
        fatalError("Not implemented.")
    }

    public func getAndReturnWithMapOfMap(requestOptions: RequestOptions? = nil) async throws -> ObjectWithMapOfMap {
        fatalError("Not implemented.")
    }

    public func getAndReturnNestedWithOptionalField(requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithOptionalField {
        fatalError("Not implemented.")
    }

    public func getAndReturnNestedWithRequiredField(requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
        fatalError("Not implemented.")
    }

    public func getAndReturnNestedWithRequiredFieldAsList(requestOptions: RequestOptions? = nil) async throws -> NestedObjectWithRequiredField {
        fatalError("Not implemented.")
    }
}