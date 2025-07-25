public struct ExtendedMovie: Codable, Hashable {
    public let cast: [String]
    public let additionalProperties: [String: JSONValue]

    public init(cast: [String], additionalProperties: [String: JSONValue] = .init()) {
        self.cast = cast
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.cast = try container.decode([String].self, forKey: .cast)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.cast, forKey: .cast)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case cast
    }
}