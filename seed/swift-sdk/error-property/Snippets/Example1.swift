import Foundation
import ErrorProperty

private func main() async throws {
    let client = ErrorPropertyClient(baseURL: "https://api.fern.com")

    try await client.propertyBasedError.throwError()
}

try await main()
