public final class ObjectClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}    public func getAndReturnWithOptionalField(requestOptions: RequestOptions? = nil) throws -> ObjectWithOptionalField {
    }

    public func getAndReturnWithRequiredField(requestOptions: RequestOptions? = nil) throws -> ObjectWithRequiredField {
    }

    public func getAndReturnWithMapOfMap(requestOptions: RequestOptions? = nil) throws -> ObjectWithMapOfMap {
    }

    public func getAndReturnNestedWithOptionalField(requestOptions: RequestOptions? = nil) throws -> NestedObjectWithOptionalField {
    }

    public func getAndReturnNestedWithRequiredField(requestOptions: RequestOptions? = nil) throws -> NestedObjectWithRequiredField {
    }

    public func getAndReturnNestedWithRequiredFieldAsList(requestOptions: RequestOptions? = nil) throws -> NestedObjectWithRequiredField {
    }
}