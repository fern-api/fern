import Foundation
import CustomAuth

private func main() async throws {
    let client = CustomAuthClient(customAuthScheme: "<value>")

    try await client.customAuth.postWithCustomAuth(request: .object([
        "key": .string("value")
    ]))
}

try await main()
