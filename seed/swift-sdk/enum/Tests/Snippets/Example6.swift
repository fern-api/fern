import Foundation
import Enum

enum Example6 {
    static func snippet() async throws {
        let client = EnumClient(baseURL: "https://api.fern.com")

        _ = try await client.queryParam.send(
            operand: .greaterThan,
            maybeOperand: .greaterThan,
            operandOrColor: ColorOrOperand.color(
                .red
            ),
            maybeOperandOrColor: ColorOrOperand.color(
                .red
            )
        )
    }
}
