import Foundation
import HeaderToken

private func main() async throws {
    let client = HeaderTokenClient(
        baseURL: "https://api.fern.com",
        headerTokenAuth: "YOUR_API_KEY"
    )

    _ = try await client.service.getWithBearerToken()
}

try await main()
