public final class NoReqBodyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithNoRequestBody(requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        fatalError("Not implemented.")
    }

    public func postWithNoRequestBody(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }
}