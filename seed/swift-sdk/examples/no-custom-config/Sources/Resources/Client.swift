import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func echo(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/echo",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func createType(request: Type, requestOptions: RequestOptions? = nil) async throws -> Identifier {
        return try await httpClient.performRequest(
            method: .post,
            path: "/type",
            body: request,
            requestOptions: requestOptions,
            responseType: Identifier.self
        )
    }
}