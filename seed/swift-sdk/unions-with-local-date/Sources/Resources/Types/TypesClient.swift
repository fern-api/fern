import Foundation

public final class TypesClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> UnionWithTime {
        return try await httpClient.performRequest(
            method: .get,
            path: "/time/\(id)",
            requestOptions: requestOptions,
            responseType: UnionWithTime.self
        )
    }

    public func update(request: UnionWithTime, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/time",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}