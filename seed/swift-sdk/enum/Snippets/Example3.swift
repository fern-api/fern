import Enum

let client = SeedEnumClient()

private func main() async throws {
    try await client.pathParam.send(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    )
}

try await main()
