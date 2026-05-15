import Foundation
import Enum

private func main() async throws {
    let client = EnumClient(baseURL: "https://api.fern.com")

    _ = try await client.pathParam.send(
        operand: ">",
        operandOrColor: "red"
    )
}

try await main()
