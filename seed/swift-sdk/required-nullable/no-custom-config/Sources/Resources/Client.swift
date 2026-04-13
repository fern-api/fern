import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getFoo(optionalBaz: Nullable<String>? = nil, optionalNullableBaz: Nullable<String>? = nil, requiredBaz: String, requiredNullableBaz: Nullable<String>, requestOptions: RequestOptions? = nil) async throws -> Foo {
        return try await httpClient.performRequest(
            method: .get,
            path: "/foo",
            queryParams: [
                "optional_baz": optionalBaz?.wrappedValue.map { .string($0) }, 
                "optional_nullable_baz": optionalNullableBaz?.wrappedValue.map { .string($0) }, 
                "required_baz": .string(requiredBaz), 
                "required_nullable_baz": requiredNullableBaz.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: Foo.self
        )
    }

    public func updateFoo(id: String, idempotencyKey: String, request: Requests.UpdateFooRequest, requestOptions: RequestOptions? = nil) async throws -> Foo {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/foo/\(id)",
            headers: [
                "X-Idempotency-Key": idempotencyKey
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: Foo.self
        )
    }
}