import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.bigunion.updateMany(request: [
        BigUnion.bigUnionZero(
            BigUnionZero(
                value: "value",
                type: .normalSweet
            )
        ),
        BigUnion.bigUnionZero(
            BigUnionZero(
                value: "value",
                type: .normalSweet
            )
        )
    ])
}

try await main()
