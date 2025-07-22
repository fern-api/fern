public final class PathParamClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(operand: String, operandOrColor: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/path/\(operand)/\(operandOrColor)", 
            requestOptions: requestOptions, 
            responseType: Any.self
        )
    }
}