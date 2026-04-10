import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.createmovie(request: Movie(
        id: "id",
        prequel: "prequel",
        title: "title",
        from: "from",
        rating: 1.1,
        type: .movie,
        tag: "tag",
        book: .value("book"),
        metadata: [
            "metadata": .object([
                "key": .string("value")
            ])
        ],
        revenue: 1000000
    ))
}

try await main()
