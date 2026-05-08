import Foundation
import HeaderTokenEnvironmentVariable

private func main() async throws {
    let client = HeaderTokenEnvironmentVariableClient(
        baseURL: "https://api.fern.com",
        headerTokenAuth: "YOUR_HEADER_VALUE"
    )

    _ = try await client.service.getWithBearerToken()
}

try await main()
