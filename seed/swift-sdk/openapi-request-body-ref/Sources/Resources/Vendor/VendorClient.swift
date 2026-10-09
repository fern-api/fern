import Foundation

public final class VendorClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.vendor.updateVendor(
    ///         vendorId: "vendor_id",
    ///         request: UpdateVendorRequest(
    ///             name: "name"
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateVendor(vendorId: String, request: UpdateVendorRequest, requestOptions: RequestOptions? = nil) async throws -> Vendor {
        return try await httpClient.performRequest(
            method: .put,
            path: "/vendors/\(vendorId)",
            body: request,
            requestOptions: requestOptions,
            responseType: Vendor.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.vendor.createVendor(request: .init(name: "name"))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createVendor(idempotencyKey: String? = nil, request: Requests.CreateVendorRequest, requestOptions: RequestOptions? = nil) async throws -> Vendor {
        return try await httpClient.performRequest(
            method: .post,
            path: "/vendors",
            headers: [
                "idempotency_key": idempotencyKey
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: Vendor.self
        )
    }
}