import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    try await client.endpoints.object.getAndReturnNestedWithOptionalField(request: NestedObjectWithOptionalField(
        string: "string",
        nestedObject: ObjectWithOptionalField(
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: True,
            datetime: Date(timeIntervalSince1970: 1705311000),
            date: Date(timeIntervalSince1970: 1673740800),
            uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            base64: "SGVsbG8gd29ybGQh",
            list: [
                "list",
                "list"
            ],
            set: ,
            map: [
                1: "map"
            ],
            bigint: 
        )
    ))
}

try await main()
