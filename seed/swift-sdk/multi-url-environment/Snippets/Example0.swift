import Foundation
import MultiUrlEnvironment

private func main() async throws {
    let client = SeedMultiUrlEnvironmentClient(token: "<token>")

    try await client.ec2.bootInstance(request: .init(size: "size"))
}

try await main()
