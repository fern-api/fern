import Foundation

public final class ReqwithheadersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getwithcustomheader(testEndpointHeader: String, request: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/test-headers/custom-header",
            headers: [
                "X-TEST-ENDPOINT-HEADER": testEndpointHeader
            ],
            body: request,
            requestOptions: requestOptions
        )
    }
}