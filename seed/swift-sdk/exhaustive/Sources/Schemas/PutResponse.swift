public struct PutResponse: Codable, Hashable {
    public let errors: [Error]?
    public let additionalProperties: [String: JSONValue]

    public init(
        errors: [Error]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.errors = errors
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.errors = try container.decodeIfPresent([Error].self, forKey: .errors)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.errors, forKey: .errors)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case errors
    }
}