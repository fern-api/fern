import Foundation

public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnUnion(request: Animal, requestOptions: RequestOptions? = nil) async throws -> Animal {
        return try await httpClient.performRequest(
            method: .post,
            path: "/union",
            body: request,
            requestOptions: requestOptions,
            responseType: Animal.self
        )
    }
}