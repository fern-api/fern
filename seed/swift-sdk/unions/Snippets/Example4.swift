import Foundation
import Unions

private func main() async throws {
    let client = SeedUnionsClient()

    try await client.union.update(request: Shape.circle(
        .init(
            id: "id",
            radius: 1.1
        )
    ))
}

try await main()
