import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.vendor.updateVendor(
        vendorId: "vendor_id",
        request: UpdateVendorRequest(
            name: "name",
            status: .active
        )
    )
}

try await main()
