import Foundation
import License

private func main() async throws {
    let client = SeedLicenseClient()

    try await client.get()
}

try await main()
