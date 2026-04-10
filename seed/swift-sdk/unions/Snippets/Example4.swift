import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.union.update(request: Shape.circle(
        Circle(
            radius: 1.1
        )
    ))
}

try await main()
