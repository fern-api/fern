public final class HttpMethodsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func testGet(requestOptions: RequestOptions? = nil) throws -> String {
    }

    public func testPost(requestOptions: RequestOptions? = nil) throws -> ObjectWithOptionalField {
    }

    public func testPut(requestOptions: RequestOptions? = nil) throws -> ObjectWithOptionalField {
    }

    public func testPatch(requestOptions: RequestOptions? = nil) throws -> ObjectWithOptionalField {
    }

    public func testDelete(requestOptions: RequestOptions? = nil) throws -> Bool {
    }
}