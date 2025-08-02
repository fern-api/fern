public enum WeirdNumber: Codable, Hashable, Sendable {
    case int(Int)
    case json(JSONValue)
    case optionalJson(JSONValue?)
    case double(Double)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .int(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .optionalJson(let value):
            try container.encode(value)
        case .double(let value):
            try container.encode(value)
        }
    }
}