import Foundation

public final class PaymentClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import IdempotencyHeaders
    ///
    /// private func main() async throws {
    ///     let client = IdempotencyHeadersClient(token: "<token>")
    ///
    ///     _ = try await client.payment.create(request: .init(
    ///         amount: 1,
    ///         currency: .usd
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func create(request: Requests.CreatePaymentRequest, requestOptions: RequestOptions? = nil) async throws -> UUID {
        return try await httpClient.performRequest(
            method: .post,
            path: "/payment",
            body: request,
            requestOptions: requestOptions,
            responseType: UUID.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import IdempotencyHeaders
    ///
    /// private func main() async throws {
    ///     let client = IdempotencyHeadersClient(token: "<token>")
    ///
    ///     _ = try await client.payment.delete(paymentId: "paymentId")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func delete(paymentId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/payment/\(paymentId)",
            requestOptions: requestOptions
        )
    }
}