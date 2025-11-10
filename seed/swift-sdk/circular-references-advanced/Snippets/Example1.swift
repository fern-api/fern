import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.testEndpoint(request: ObjectJsonSchemaPropertyInput(
        type: .object,
        required: [
            "required",
            "required"
        ],
        description: "description",
        properties: [
            "properties": ObjectJsonSchemaPropertyInputPropertiesValue.literalJsonSchemaProperty(
                LiteralJsonSchemaProperty(
                    type: .string,
                    description: "description"
                )
            )
        ]
    ))
}

try await main()
