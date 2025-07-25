public struct DeepEqualityCorrectnessCheck: Codable, Hashable {
    public let expectedValueParameterId: ParameterId
    public let additionalProperties: [String: JSONValue]

    public init(expectedValueParameterId: ParameterId, additionalProperties: [String: JSONValue] = .init()) {
        self.expectedValueParameterId = expectedValueParameterId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.expectedValueParameterId = try container.decode(ParameterId.self, forKey: .expectedValueParameterId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.expectedValueParameterId, forKey: .expectedValueParameterId)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case expectedValueParameterId
    }
}