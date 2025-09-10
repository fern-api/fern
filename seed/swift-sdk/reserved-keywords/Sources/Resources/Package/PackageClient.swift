import Foundation

public final class PackageClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func test(for: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            queryParams: [
                "for": .string(`for`)
            ],
            requestOptions: requestOptions
        )
    }
}