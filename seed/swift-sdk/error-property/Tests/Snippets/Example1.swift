import Foundation
import ErrorProperty

enum Example1 {
    static func snippet() async throws {
        let client = ErrorPropertyClient(baseURL: "https://api.fern.com")

        _ = try await client.propertyBasedError.throwError()
    }
}
