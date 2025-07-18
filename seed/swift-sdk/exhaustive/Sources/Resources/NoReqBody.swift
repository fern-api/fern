public final class NoReqBodyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithNoRequestBody(requestOptions: RequestOptions? = nil) throws -> ObjectWithOptionalField {
    }

    public func postWithNoRequestBody(requestOptions: RequestOptions? = nil) throws -> String {
    }
}