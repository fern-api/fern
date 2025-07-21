public final class QueryClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(prompt: Any, optionalPrompt: Any? = nil, aliasPrompt: AliasToPrompt, aliasOptionalPrompt: AliasToPrompt? = nil, query: String, stream: Any, optionalStream: Any? = nil, aliasStream: AliasToStream, aliasOptionalStream: AliasToStream? = nil, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/query", 
            requestOptions: requestOptions
        )
    }
}