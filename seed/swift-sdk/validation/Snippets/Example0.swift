import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client..create(request: .init(
        decimal: 1.1,
        even: 1,
        name: "name",
        shape: .square
    ))
}

try await main()
