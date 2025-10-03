import Foundation
import Enum

private func main() async throws {
    let client = EnumClient(baseURL: "https://api.fern.com")

    try await client.headers.send()
}

try await main()
