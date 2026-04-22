import Foundation
import HeaderTokenEnvironmentVariable

private func main() async throws {
    let client = HeaderTokenEnvironmentVariableClient(
        baseURL: "https://api.fern.com",
        headerTokenAuth: "<value>"
    )

    _ = try await client.service.getWithBearerToken()
}

try await main()
