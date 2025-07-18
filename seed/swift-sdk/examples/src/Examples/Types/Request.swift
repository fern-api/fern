public struct Request: Codable, Hashable {
    public let request: Any
    public let additionalProperties: [String: JSONValue]

    public init(request: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.request = request
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.request = try container.decode(Any.self, forKey: .request)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.request, forKey: .request)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case request
    }
}