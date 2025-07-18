public final class InlinedRequestsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func postWithObjectBodyandResponse(requestOptions: RequestOptions? = nil) throws -> ObjectWithOptionalField {
    }
}