import Foundation

public final class QueryClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(prompt: JSONValue, optionalPrompt: JSONValue? = nil, aliasPrompt: AliasToPrompt, aliasOptionalPrompt: AliasToPrompt? = nil, query: String, stream: JSONValue, optionalStream: JSONValue? = nil, aliasStream: AliasToStream, aliasOptionalStream: AliasToStream? = nil, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query",
            queryParams: [
                "prompt": .unknown(prompt), 
                "optional_prompt": optionalPrompt.map { .unknown($0) }, 
                "alias_prompt": .string(aliasPrompt.rawValue), 
                "alias_optional_prompt": aliasOptionalPrompt.map { .string($0.rawValue) }, 
                "query": .string(query), 
                "stream": .unknown(stream), 
                "optional_stream": optionalStream.map { .unknown($0) }, 
                "alias_stream": .string(aliasStream.rawValue), 
                "alias_optional_stream": aliasOptionalStream.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}