import Foundation

public final class InlinedRequestsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// POST with custom object in request body, response is an object
    ///
    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.inlinedRequests.postWithObjectBodyandResponse(request: .init(
    ///         string: "string",
    ///         integer: 1,
    ///         nestedObject: ObjectWithOptionalField(
    ///             string: "string",
    ///             integer: 1,
    ///             long: 1000000,
    ///             double: 1.1,
    ///             bool: true,
    ///             datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///             date: CalendarDate("2023-01-15")!,
    ///             uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///             base64: "SGVsbG8gd29ybGQh",
    ///             list: [
    ///                 "list",
    ///                 "list"
    ///             ],
    ///             set: .array([
    ///                 .string("set")
    ///             ]),
    ///             map: [
    ///                 1: "map"
    ///             ],
    ///             bigint: "1000000"
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithObjectBodyandResponse(request: Requests.PostWithObjectBody, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/req-bodies/object",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    /// POST with root-level array body and header params
    ///
    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.inlinedRequests.postWithArrayBodyAndHeaders(
    ///         xCustomHeader: "X-Custom-Header",
    ///         request: [
    ///             "string",
    ///             "string"
    ///         ]
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithArrayBodyAndHeaders(xCustomHeader: String? = nil, request: [String], requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/req-bodies/array-body-with-headers",
            headers: [
                "X-Custom-Header": xCustomHeader
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}