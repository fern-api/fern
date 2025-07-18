public struct T: Codable, Hashable {
    public let child: TorU
    public let additionalProperties: [String: JSONValue]

    public init(child: TorU, additionalProperties: [String: JSONValue] = .init()) {
        self.child = child
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.child = try container.decode(TorU.self, forKey: .child)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.child, forKey: .child)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case child
    }
}