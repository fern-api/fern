import Foundation
import Enum

private func main() async throws {
    let client = EnumClient(baseURL: "https://api.fern.com")

    try await client.pathParam.send(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    )
}

try await main()
