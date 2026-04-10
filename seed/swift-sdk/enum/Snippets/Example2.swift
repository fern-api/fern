import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.inlinedrequest.send(request: .init(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    ))
}

try await main()
