import Foundation
import License

private func main() async throws {
    let client = LicenseClient()

    try await client.get()
}

try await main()
