import Foundation
import ErrorProperty

private func main() async throws {
    let client = ErrorPropertyClient()

    try await client.propertyBasedError.throwError()
}

try await main()
