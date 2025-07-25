public struct ApiResponse: Codable, Hashable {
    public let code: Int?
    public let message: String?
    public let type: String?
    public let additionalProperties: [String: JSONValue]

    public init(
        code: Int? = nil,
        message: String? = nil,
        type: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.code = code
        self.message = message
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.code = try container.decodeIfPresent(Int.self, forKey: .code)
        self.message = try container.decodeIfPresent(String.self, forKey: .message)
        self.type = try container.decodeIfPresent(String.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.code, forKey: .code)
        try container.encodeIfPresent(self.message, forKey: .message)
        try container.encodeIfPresent(self.type, forKey: .type)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case code
        case message
        case type
    }
}