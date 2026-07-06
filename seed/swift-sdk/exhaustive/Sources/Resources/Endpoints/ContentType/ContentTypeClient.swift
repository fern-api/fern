import Foundation

public final class ContentTypeClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.contentType.postJsonPatchContentType(request: ObjectWithOptionalField(
    ///         string: "string",
    ///         integer: 1,
    ///         long: 1000000,
    ///         double: 1.1,
    ///         bool: true,
    ///         datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///         date: CalendarDate("2023-01-15")!,
    ///         uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///         base64: "SGVsbG8gd29ybGQh",
    ///         list: [
    ///             "list",
    ///             "list"
    ///         ],
    ///         set: .array([
    ///             .string("set")
    ///         ]),
    ///         map: [
    ///             1: "map"
    ///         ],
    ///         bigint: "1000000"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postJsonPatchContentType(request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo/bar",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.contentType.postJsonPatchContentWithCharsetType(request: ObjectWithOptionalField(
    ///         string: "string",
    ///         integer: 1,
    ///         long: 1000000,
    ///         double: 1.1,
    ///         bool: true,
    ///         datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///         date: CalendarDate("2023-01-15")!,
    ///         uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///         base64: "SGVsbG8gd29ybGQh",
    ///         list: [
    ///             "list",
    ///             "list"
    ///         ],
    ///         set: .array([
    ///             .string("set")
    ///         ]),
    ///         map: [
    ///             1: "map"
    ///         ],
    ///         bigint: "1000000"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postJsonPatchContentWithCharsetType(request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo/baz",
            body: request,
            requestOptions: requestOptions
        )
    }
}