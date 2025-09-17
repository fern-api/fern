import Foundation
import Validation

private func main() async throws {
    let client = ValidationClient(baseURL: "https://api.fern.com")

    try await client.get(request: .init(
        decimal: 2.2,
        even: 100,
        name: "fern"
    ))
}

try await main()
