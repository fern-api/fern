import Foundation

public final class UrlsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func withMixedCase(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/MixedCase",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func noEndingSlash(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/no-ending-slash",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func withEndingSlash(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/with-ending-slash",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func withUnderscores(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/with_underscores",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}