import Foundation

public final class VendorClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func updateVendor(vendorId: String, request: UpdateVendorRequest, requestOptions: RequestOptions? = nil) async throws -> Vendor {
        return try await httpClient.performRequest(
            method: .put,
            path: "/vendors/\(vendorId)",
            body: request,
            requestOptions: requestOptions,
            responseType: Vendor.self
        )
    }

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