import Foundation
import Enum

enum Example1 {
    static func snippet() async throws {
        let client = EnumClient(baseURL: "https://api.fern.com")

        _ = try await client.inlinedRequest.send(request: .init(
            operand: .greaterThan,
            operandOrColor: ColorOrOperand.color(
                .red
            )
        ))
    }
}
