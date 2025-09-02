import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    try await client.endpoints.enum.getAndReturnEnum(request: .sunny)
}

try await main()
