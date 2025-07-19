public final class ContainerClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnListOfPrimitives(requestOptions: RequestOptions? = nil) async throws -> [String] {
        fatalError("Not implemented.")
    }

    public func getAndReturnListOfObjects(requestOptions: RequestOptions? = nil) async throws -> [ObjectWithRequiredField] {
        fatalError("Not implemented.")
    }

    public func getAndReturnSetOfPrimitives(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getAndReturnSetOfObjects(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getAndReturnMapPrimToPrim(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getAndReturnMapOfPrimToObject(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getAndReturnOptional(requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField {
        fatalError("Not implemented.")
    }
}