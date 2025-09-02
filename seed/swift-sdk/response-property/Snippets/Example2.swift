import Foundation
import ResponseProperty

private func main() async throws {
    let client = ResponsePropertyClient()

    try await client.service.getMovie(request: "string")
}

try await main()
