import Foundation
import MultiUrlEnvironmentNoDefault

private func main() async throws {
    let client = MultiUrlEnvironmentNoDefaultClient(token: "<token>")

    try await client.ec2.bootInstance(request: .init(size: "size"))
}

try await main()
