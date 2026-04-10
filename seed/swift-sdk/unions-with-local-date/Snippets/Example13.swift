import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.union.update(request: Shape.shapeZero(
        ShapeZero(
            radius: 1.1,
            type: .circle
        )
    ))
}

try await main()
