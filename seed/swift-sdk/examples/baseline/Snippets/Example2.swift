import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.createType(request: `Type`.basicType(
        .primitive
    ))
}

try await main()
