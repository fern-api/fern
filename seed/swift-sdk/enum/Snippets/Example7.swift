import Foundation
import Enum

private func main() async throws {
    let client = EnumClient(baseURL: "https://api.fern.com")

    try await client.queryParam.sendList(request: .init(
        operand: [
            .greaterThan
        ],
        maybeOperand: [
            .greaterThan
        ],
        operandOrColor: [
            ColorOrOperand.color(
                .red
            )
        ],
        maybeOperandOrColor: [
            ColorOrOperand.color(
                .red
            )
        ]
    ))
}

try await main()
