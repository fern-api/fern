import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.sysprop.setnumwarminstances(
        language: .java,
        numWarmInstances: 1
    )
}

try await main()
