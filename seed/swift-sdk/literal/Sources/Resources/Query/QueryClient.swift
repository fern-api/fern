import Foundation

public final class QueryClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(prompt: QuerySendRequestPrompt, optionalPrompt: Nullable<QuerySendRequestOptionalPrompt>? = nil, aliasPrompt: AliasToPrompt, aliasOptionalPrompt: AliasToPrompt? = nil, query: String, stream: Bool, optionalStream: Nullable<Bool>? = nil, aliasStream: AliasToStream, aliasOptionalStream: AliasToStream? = nil, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query",
            queryParams: [
                "prompt": .string(prompt.rawValue), 
                "optional_prompt": optionalPrompt?.wrappedValue.map { .string($0) }, 
                "alias_prompt": .string(aliasPrompt.rawValue), 
                "alias_optional_prompt": aliasOptionalPrompt.map { .string($0.rawValue) }, 
                "query": .string(query), 
                "stream": .bool(stream), 
                "optional_stream": optionalStream?.wrappedValue.map { .bool($0) }, 
                "alias_stream": .bool(aliasStream), 
                "alias_optional_stream": aliasOptionalStream.map { .unknown($0) }
            ],
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}