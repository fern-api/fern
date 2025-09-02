import Foundation
import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.service.getMovie(movieId: "movieId")
}

try await main()
