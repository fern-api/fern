import Foundation

public final class EndpointsUrLsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsUrlsWithMixedCase(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/MixedCase",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func endpointsUrlsNoEndingSlash(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/no-ending-slash",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func endpointsUrlsWithEndingSlash(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/with-ending-slash",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func endpointsUrlsWithUnderscores(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/with_underscores",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}