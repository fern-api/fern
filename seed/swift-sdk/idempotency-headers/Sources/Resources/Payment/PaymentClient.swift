import Foundation

public final class PaymentClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func create(request: Requests.PaymentCreateRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/payment",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func delete(paymentId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/payment/\(paymentId)",
            requestOptions: requestOptions
        )
    }
}