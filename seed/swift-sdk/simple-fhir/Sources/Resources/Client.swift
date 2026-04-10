import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAccount(accountId: String, requestOptions: RequestOptions? = nil) async throws -> Account {
        return try await httpClient.performRequest(
            method: .get,
            path: "/account/\(accountId)",
            requestOptions: requestOptions,
            responseType: Account.self
        )
    }
}