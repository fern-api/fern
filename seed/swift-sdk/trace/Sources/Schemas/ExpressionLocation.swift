public struct ExpressionLocation: Codable, Hashable {
    public let start: Int
    public let offset: Int
    public let additionalProperties: [String: JSONValue]

    public init(start: Int, offset: Int, additionalProperties: [String: JSONValue] = .init()) {
        self.start = start
        self.offset = offset
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.start = try container.decode(Int.self, forKey: .start)
        self.offset = try container.decode(Int.self, forKey: .offset)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.start, forKey: .start)
        try container.encode(self.offset, forKey: .offset)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case start
        case offset
    }
}