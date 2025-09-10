import Foundation
import License

private func main() async throws {
    let client = LicenseClient(baseURL: "https://api.fern.com")

    try await client.get()
}

try await main()
