import Foundation
import ResponseProperty

private func main() async throws {
    let client = ResponsePropertyClient(baseURL: "https://api.fern.com")

    _ = try await client.service.getOptionalMovie(request: "string")
}

try await main()
