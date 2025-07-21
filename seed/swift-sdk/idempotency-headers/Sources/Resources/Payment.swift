public final class PaymentClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func create(requestOptions: RequestOptions? = nil) async throws -> UUID {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/payment", 
            requestOptions: requestOptions
        )
    }

    public func delete(paymentId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .delete, 
            path: "/payment/\(paymentId)", 
            requestOptions: requestOptions
        )
    }
}