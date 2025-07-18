public struct Failure: Codable, Hashable {
    public let status: Any
    public let additionalProperties: [String: JSONValue]

    public init(status: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.status = try container.decode(Any.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.status, forKey: .status)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case status
    }
}