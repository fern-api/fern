import Foundation

public final class SimpleClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func foowithoutendpointerror(request: FooRequest, requestOptions: RequestOptions? = nil) async throws -> FooResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo1",
            body: request,
            requestOptions: requestOptions,
            responseType: FooResponse.self
        )
    }

    public func foo(request: FooRequest, requestOptions: RequestOptions? = nil) async throws -> FooResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo2",
            body: request,
            requestOptions: requestOptions,
            responseType: FooResponse.self
        )
    }

    public func foowithexamples(request: FooRequest, requestOptions: RequestOptions? = nil) async throws -> FooResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo3",
            body: request,
            requestOptions: requestOptions,
            responseType: FooResponse.self
        )
    }
}