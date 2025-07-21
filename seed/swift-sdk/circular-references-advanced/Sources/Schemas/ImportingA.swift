public struct ImportingA: Codable, Hashable {
    public let a: A?
    public let additionalProperties: [String: JSONValue]

    public init(a: A? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.a = a
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.a = try container.decodeIfPresent(A.self, forKey: .a)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.a, forKey: .a)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case a
    }
}