import Foundation

public final class BigunionClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> BigUnion {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(id)",
            requestOptions: requestOptions,
            responseType: BigUnion.self
        )
    }

    public func update(request: BigUnion, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    public func updateMany(request: [BigUnion], requestOptions: RequestOptions? = nil) async throws -> [String: Bool] {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/many",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: Bool].self
        )
    }
}