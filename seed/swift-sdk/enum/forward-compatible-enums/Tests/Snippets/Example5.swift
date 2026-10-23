import Foundation
import Enum

enum Example5 {
    static func snippet() async throws {
        let client = EnumClient(baseURL: "https://api.fern.com")

        _ = try await client.queryParam.send(
            operand: .greaterThan,
            operandOrColor: ColorOrOperand.color(
                .red
            )
        )
    }
}
