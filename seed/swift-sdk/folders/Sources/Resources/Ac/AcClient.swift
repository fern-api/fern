import Foundation

public final class AcClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func aCFoo(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/a/c",
            requestOptions: requestOptions
        )
    }
}