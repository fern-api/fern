import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getText(requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/text",
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    public func getCsv(requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .get,
            path: "/csv",
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    public func getXml(requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .get,
            path: "/xml",
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }
}