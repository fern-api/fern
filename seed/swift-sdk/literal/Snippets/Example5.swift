import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.path.send(id: .oneHundredTwentyThree)
}

try await main()
