import Foundation

public final class OptionalClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func sendOptionalBody(request: [String: JSONValue]?, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/send-optional-body",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func sendOptionalTypedBody(request: SendOptionalBodyRequest?, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/send-optional-typed-body",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}