public final class StoreClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func deleteOrder(orderId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/store/order/\(orderId)",
            requestOptions: requestOptions
        )
    }

    public func getInventory(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get,
            path: "/store/inventory",
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }

    public func getOrderById(orderId: String, requestOptions: RequestOptions? = nil) async throws -> Order {
        return try await httpClient.performRequest(
            method: .get,
            path: "/store/order/\(orderId)",
            requestOptions: requestOptions,
            responseType: Order.self
        )
    }

    public func placeOrder(request: Order, requestOptions: RequestOptions? = nil) async throws -> Order {
        return try await httpClient.performRequest(
            method: .post,
            path: "/store/order",
            body: request,
            requestOptions: requestOptions,
            responseType: Order.self
        )
    }
}