import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getDirectThread(ids: [String], tags: [String], requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .get,
            path: "/",
            queryParams: [
                "ids": .stringArray(ids), 
                "tags": .stringArray(tags)
            ],
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }
}