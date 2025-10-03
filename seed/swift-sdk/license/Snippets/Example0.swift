import Foundation
import License

private func main() async throws {
    let client = LicenseClient(baseURL: "https://api.fern.com")

    _ = try await client.get()
}

try await main()
