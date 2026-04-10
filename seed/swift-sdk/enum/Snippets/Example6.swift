import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.pathparam.send(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    )
}

try await main()
