import Foundation
import Enum

private func main() async throws {
    let client = SeedEnumClient()

    try await client.queryParam.send(request: .init(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    ))
}

try await main()
