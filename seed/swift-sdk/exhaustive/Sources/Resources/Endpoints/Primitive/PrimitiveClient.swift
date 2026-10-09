import Foundation

public final class PrimitiveClient: Sendable {
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
    ///     _ = try await client.endpoints.primitive.getAndReturnString(request: "string")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnString(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/string",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.primitive.getAndReturnInt(request: 1)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnInt(request: Int, requestOptions: RequestOptions? = nil) async throws -> Int {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/integer",
            body: request,
            requestOptions: requestOptions,
            responseType: Int.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.primitive.getAndReturnLong(request: 1000000)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnLong(request: Int64, requestOptions: RequestOptions? = nil) async throws -> Int64 {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/long",
            body: request,
            requestOptions: requestOptions,
            responseType: Int64.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.primitive.getAndReturnDouble(request: 1.1)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnDouble(request: Double, requestOptions: RequestOptions? = nil) async throws -> Double {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/double",
            body: request,
            requestOptions: requestOptions,
            responseType: Double.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.primitive.getAndReturnBool(request: true)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnBool(request: Bool, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/boolean",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.primitive.getAndReturnDatetime(request: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnDatetime(request: Date, requestOptions: RequestOptions? = nil) async throws -> Date {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/datetime",
            body: request,
            requestOptions: requestOptions,
            responseType: Date.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.primitive.getAndReturnDate(request: CalendarDate("2023-01-15")!)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnDate(request: CalendarDate, requestOptions: RequestOptions? = nil) async throws -> CalendarDate {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/date",
            body: request,
            requestOptions: requestOptions,
            responseType: CalendarDate.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.primitive.getAndReturnUuid(request: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnUuid(request: UUID, requestOptions: RequestOptions? = nil) async throws -> UUID {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/uuid",
            body: request,
            requestOptions: requestOptions,
            responseType: UUID.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    ///
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    ///
    ///     _ = try await client.endpoints.primitive.getAndReturnBase64(request: "SGVsbG8gd29ybGQh")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnBase64(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/primitive/base64",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}