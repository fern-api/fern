import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.vendor.createVendor(request: .init(
        name: "name",
        address: "address"
    ))
}

try await main()
