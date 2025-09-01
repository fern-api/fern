import Enum

private func main() async throws {
    let client = SeedEnumClient()

    try await client.pathParam.send(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    )
}

try await main()
