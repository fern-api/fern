import Foundation

public final class EndpointsPutClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsPutAdd(id: String, requestOptions: RequestOptions? = nil) async throws -> EndpointsPutResponse {
        return try await httpClient.performRequest(
            method: .put,
            path: "/\(id)",
            requestOptions: requestOptions,
            responseType: EndpointsPutResponse.self
        )
    }
}