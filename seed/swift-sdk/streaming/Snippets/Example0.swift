import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.dummy.generate(request: .init(
        stream: true,
        numEvents: 1
    ))
}

try await main()
