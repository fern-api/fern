import Foundation

public final class HomepageClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func gethomepageproblems(requestOptions: RequestOptions? = nil) async throws -> [ProblemId] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/homepage-problems",
            requestOptions: requestOptions,
            responseType: [ProblemId].self
        )
    }

    public func sethomepageproblems(request: [ProblemId], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/homepage-problems",
            body: request,
            requestOptions: requestOptions
        )
    }
}