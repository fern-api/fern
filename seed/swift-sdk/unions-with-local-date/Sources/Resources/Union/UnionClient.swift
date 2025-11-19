import Foundation

public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> Shape {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(id)",
            requestOptions: requestOptions,
            responseType: Shape.self
        )
    }

    public func update(request: Shape, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}