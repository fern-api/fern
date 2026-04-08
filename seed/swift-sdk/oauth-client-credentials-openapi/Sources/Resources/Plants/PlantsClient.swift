import Foundation

public final class PlantsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func list(requestOptions: RequestOptions? = nil) async throws -> [Plant] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/plants",
            requestOptions: requestOptions,
            responseType: [Plant].self
        )
    }

    public func get(plantId: String, requestOptions: RequestOptions? = nil) async throws -> Plant {
        return try await httpClient.performRequest(
            method: .get,
            path: "/plants/\(plantId)",
            requestOptions: requestOptions,
            responseType: Plant.self
        )
    }
}