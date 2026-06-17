import Foundation

public final class QueryClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(prompt: YouAreAHelpfulAssistant, optionalPrompt: YouAreAHelpfulAssistant? = nil, aliasPrompt: AliasToPrompt, aliasOptionalPrompt: AliasToPrompt? = nil, query: String, stream: Bool, optionalStream: Bool? = nil, aliasStream: AliasToStream, aliasOptionalStream: AliasToStream? = nil, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query",
            queryParams: [
                "prompt": .string(prompt.rawValue), 
                "optional_prompt": optionalPrompt.map { .string($0.rawValue) }, 
                "alias_prompt": .string(aliasPrompt.rawValue), 
                "alias_optional_prompt": aliasOptionalPrompt.map { .unknown($0) }, 
                "query": .string(query), 
                "stream": .bool(stream), 
                "optional_stream": optionalStream.map { .bool($0) }, 
                "alias_stream": .bool(aliasStream), 
                "alias_optional_stream": aliasOptionalStream.map { .unknown($0) }
            ],
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }

    public enum YouAreAHelpfulAssistant: String, Codable, Hashable, CaseIterable, Sendable {
        case youAreAHelpfulAssistant = "You are a helpful assistant"
    }
}