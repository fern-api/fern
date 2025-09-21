public struct SendResponse: Codable, Hashable {
    public let message: String
    public let status: Int
    public let success: Any
    public let additionalProperties: [String: JSONValue]

    public init(message: String, status: Int, success: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.message = message
        self.status = status
        self.success = success
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.message = try container.decode(String.self, forKey: .message)
        self.status = try container.decode(Int.self, forKey: .status)
        self.success = try container.decode(Any.self, forKey: .success)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.message, forKey: .message)
        try container.encode(self.status, forKey: .status)
        try container.encode(self.success, forKey: .success)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case message
        case status
        case success
    }
}