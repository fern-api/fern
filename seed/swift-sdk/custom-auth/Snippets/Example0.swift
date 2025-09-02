import Foundation
import CustomAuth

private func main() async throws {
    let client = CustomAuthClient(customAuthScheme: "<value>")

    try await client.customAuth.getWithCustomAuth()
}

try await main()
