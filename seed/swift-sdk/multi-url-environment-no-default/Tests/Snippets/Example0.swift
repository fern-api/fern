import Foundation
import MultiUrlEnvironmentNoDefault

enum Example0 {
    static func snippet() async throws {
        let client = MultiUrlEnvironmentNoDefaultClient(token: "<token>")

        _ = try await client.ec2.bootInstance(request: .init(size: "size"))
    }
}
