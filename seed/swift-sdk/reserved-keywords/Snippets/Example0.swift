import Foundation
import NurseryApi

private func main() async throws {
    let client = NurseryApiClient()

    try await client.package.test(request: .init(for: "for"))
}

try await main()
