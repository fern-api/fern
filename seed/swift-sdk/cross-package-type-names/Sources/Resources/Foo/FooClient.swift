import Foundation

public final class FooClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func find(optionalString: OptionalString, request: Requests.FindRequest, requestOptions: RequestOptions? = nil) async throws -> ImportingType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            queryParams: [
                "optionalString": .unknown(optionalString)
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: ImportingType.self
        )
    }
}