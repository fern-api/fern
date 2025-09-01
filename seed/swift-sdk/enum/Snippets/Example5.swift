import Enum

let client = SeedEnumClient()

private func main() async throws {
    try await client.queryParam.send(
        request: .init(
            operand: .greaterThan,
            operandOrColor: ColorOrOperand.color(
                .red
            )
        )
    )
}

try await main()
