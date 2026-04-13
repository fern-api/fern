import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.imdb.createmovie(request: .init(
        title: "title",
        rating: 1.1
    ))
}

try await main()
