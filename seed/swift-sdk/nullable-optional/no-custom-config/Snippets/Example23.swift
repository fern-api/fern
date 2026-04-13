import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.updatetags(
        userId: "userId",
        request: .init(
            tags: .value([
                "tags",
                "tags"
            ]),
            categories: .value([
                "categories",
                "categories"
            ]),
            labels: .value([
                "labels",
                "labels"
            ])
        )
    )
}

try await main()
