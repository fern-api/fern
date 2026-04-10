import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client..createType(request: `Type`.basicType(
        .primitive
    ))
}

try await main()
