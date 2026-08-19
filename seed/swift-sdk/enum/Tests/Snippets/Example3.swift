import Foundation
import Enum

enum Example3 {
    static func snippet() async throws {
        let client = EnumClient(baseURL: "https://api.fern.com")

        _ = try await client.pathParam.send(
            operand: ">",
            operandOrColor: "red"
        )
    }
}
