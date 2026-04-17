import Foundation

public final class ReqWithHeadersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithCustomHeader(xTestServiceHeader: String, xTestEndpointHeader: String, request: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/test-headers/custom-header",
            headers: [
                "X-TEST-SERVICE-HEADER": xTestServiceHeader, 
                "X-TEST-ENDPOINT-HEADER": xTestEndpointHeader
            ],
            body: request,
            requestOptions: requestOptions
        )
    }
}