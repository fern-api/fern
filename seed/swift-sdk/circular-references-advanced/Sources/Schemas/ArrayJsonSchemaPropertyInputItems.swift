import Foundation

public enum ArrayJsonSchemaPropertyInputItems: Codable, Hashable, Sendable {
    case arrayJsonSchemaPropertyInput(ArrayJsonSchemaPropertyInput)
    case literalJsonSchemaProperty(LiteralJsonSchemaProperty)
    case objectJsonSchemaPropertyInput(ObjectJsonSchemaPropertyInput)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(ArrayJsonSchemaPropertyInput.self) {
            self = .arrayJsonSchemaPropertyInput(value)
        } else if let value = try? container.decode(LiteralJsonSchemaProperty.self) {
            self = .literalJsonSchemaProperty(value)
        } else if let value = try? container.decode(ObjectJsonSchemaPropertyInput.self) {
            self = .objectJsonSchemaPropertyInput(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .arrayJsonSchemaPropertyInput(let value):
            try container.encode(value)
        case .literalJsonSchemaProperty(let value):
            try container.encode(value)
        case .objectJsonSchemaPropertyInput(let value):
            try container.encode(value)
        }
    }
}