public struct ObjectValue: Codable, Hashable {
    public let additionalProperties: [String: JSONValue]

    public init(additionalProperties: [String: JSONValue] = .init()) {
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
    }
}