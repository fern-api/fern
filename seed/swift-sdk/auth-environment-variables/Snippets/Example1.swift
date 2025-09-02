import Foundation
import AuthEnvironmentVariables

private func main() async throws {
    let client = AuthEnvironmentVariablesClient(
        baseURL: "https://api.fern.com",
        apiKey: "<value>"
    )

    try await client.service.getWithHeader(request: .init(xEndpointHeader: "X-Endpoint-Header"))
}

try await main()
