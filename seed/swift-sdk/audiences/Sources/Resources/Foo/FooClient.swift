import Foundation

public final class FooClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func find(optionalString: Nullable<OptionalString>? = nil, request: Requests.FooFindRequest, requestOptions: RequestOptions? = nil) async throws -> ImportingType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            queryParams: [
                "optionalString": optionalString?.wrappedValue.map { .unknown($0) }
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: ImportingType.self
        )
    }
}