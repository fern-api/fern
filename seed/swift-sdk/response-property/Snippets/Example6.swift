import Foundation
import ResponseProperty

private func main() async throws {
    let client = ResponsePropertyClient(baseURL: "https://api.fern.com")

    try await client.service.getMovie(request: "string")
}

try await main()
