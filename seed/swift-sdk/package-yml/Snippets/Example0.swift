import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client..echo(
        id: "id",
        request: .init(
            name: "name",
            size: 1
        )
    )
}

try await main()
