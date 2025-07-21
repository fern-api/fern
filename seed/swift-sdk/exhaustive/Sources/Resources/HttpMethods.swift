public final class HttpMethodsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func testGet(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }

    public func testPost(requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        fatalError("Not implemented.")
    }

    public func testPut(requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        fatalError("Not implemented.")
    }

    public func testPatch(requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        fatalError("Not implemented.")
    }

    public func testDelete(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }
}