import Foundation
import MultiUrlEnvironment

enum Example0 {
    static func snippet() async throws {
        let client = MultiUrlEnvironmentClient(token: "<token>")

        _ = try await client.ec2.bootInstance(request: .init(size: "size"))
    }
}
