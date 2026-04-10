import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUnion(requestOptions: RequestOptions? = nil) async throws -> UnionResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/union",
            requestOptions: requestOptions,
            responseType: UnionResponse.self
        )
    }

    public func listUnions(requestOptions: RequestOptions? = nil) async throws -> UnionListResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/unions",
            requestOptions: requestOptions,
            responseType: UnionListResponse.self
        )
    }
}