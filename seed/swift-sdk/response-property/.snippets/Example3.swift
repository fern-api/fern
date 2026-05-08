import Foundation
import ResponseProperty

private func main() async throws {
    let client = ResponsePropertyClient(baseURL: "https://api.fern.com")

    _ = try await client.service.getMovieMetadata(request: "string")
}

try await main()
