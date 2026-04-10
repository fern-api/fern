import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client..get(
        decimal: 1.1,
        even: 1,
        name: "name"
    )
}

try await main()
