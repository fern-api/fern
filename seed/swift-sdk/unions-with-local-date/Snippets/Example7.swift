import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.types.update(request: UnionWithTime.datetime(
        .init(
            datetime: 
        )
    ))
}

try await main()
