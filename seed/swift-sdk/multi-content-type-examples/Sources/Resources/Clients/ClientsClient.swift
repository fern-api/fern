import Foundation

public final class ClientsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func create(request: Requests.ClientRequest, requestOptions: RequestOptions? = nil) async throws -> ClientResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/clients",
            body: request,
            requestOptions: requestOptions,
            responseType: ClientResponse.self
        )
    }
}