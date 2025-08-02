public enum UndiscriminatedLiteral: Codable, Hashable, Sendable {
    case string(String)
    case json(JSONValue)
    case json(JSONValue)
    case json(JSONValue)
    case json(JSONValue)
    case bool(Bool)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .json(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .json(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .json(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .json(value)
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
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
        case .string(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .bool(let value):
            try container.encode(value)
        }
    }
}