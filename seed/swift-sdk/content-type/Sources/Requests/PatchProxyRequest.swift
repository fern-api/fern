public struct PatchProxyRequest: Codable, Hashable {
    public let application: Any
    public let requireAuth: Any
    public let additionalProperties: [String: JSONValue]

    public init(application: Any, requireAuth: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.application = application
        self.requireAuth = requireAuth
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.application = try container.decode(Any.self, forKey: .application)
        self.requireAuth = try container.decode(Any.self, forKey: .requireAuth)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.application, forKey: .application)
        try container.encode(self.requireAuth, forKey: .requireAuth)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case application
        case requireAuth = "require_auth"
    }
}