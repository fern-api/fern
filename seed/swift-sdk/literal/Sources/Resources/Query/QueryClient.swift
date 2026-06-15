import Foundation

public final class QueryClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(prompt: JSONValue, optionalPrompt: JSONValue? = nil, aliasPrompt: AliasToPrompt, aliasOptionalPrompt: AliasToPrompt? = nil, query: String, stream: JSONValue, optionalStream: JSONValue? = nil, aliasStream: AliasToStream, aliasOptionalStream: AliasToStream? = nil, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/query",
            queryParams: [
                "prompt": .unknown(prompt), 
                "optional_prompt": optionalPrompt.map { .unknown($0) }, 
                "alias_prompt": .unknown(aliasPrompt), 
                "alias_optional_prompt": aliasOptionalPrompt.map { .unknown($0) }, 
                "query": .string(query), 
                "stream": .unknown(stream), 
                "optional_stream": optionalStream.map { .unknown($0) }, 
                "alias_stream": .unknown(aliasStream), 
                "alias_optional_stream": aliasOptionalStream.map { .unknown($0) }
            ],
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}