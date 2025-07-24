public final class NoReqBodyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithNoRequestBody(requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .get,
            path: "/no-req-body",
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    public func postWithNoRequestBody(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/no-req-body",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}