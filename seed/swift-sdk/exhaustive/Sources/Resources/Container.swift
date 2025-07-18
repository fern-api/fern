public final class ContainerClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnListOfPrimitives(requestOptions: RequestOptions? = nil) throws -> [String] {
    }

    public func getAndReturnListOfObjects(requestOptions: RequestOptions? = nil) throws -> [ObjectWithRequiredField] {
    }

    public func getAndReturnSetOfPrimitives(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func getAndReturnSetOfObjects(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func getAndReturnMapPrimToPrim(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func getAndReturnMapOfPrimToObject(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func getAndReturnOptional(requestOptions: RequestOptions? = nil) throws -> ObjectWithRequiredField {
    }
}