import Foundation
import CustomAuth

private func main() async throws {
    let client = CustomAuthClient(
        baseURL: "https://api.fern.com",
        customAuthScheme: "<value>"
    )

    _ = try await client.customAuth.getWithCustomAuth()
}

try await main()
