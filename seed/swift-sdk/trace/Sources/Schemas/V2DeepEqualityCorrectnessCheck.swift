import Foundation

public struct V2DeepEqualityCorrectnessCheck: Codable, Hashable, Sendable {
    public let expectedValueParameterId: V2ParameterId
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        expectedValueParameterId: V2ParameterId,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.expectedValueParameterId = expectedValueParameterId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.expectedValueParameterId = try container.decode(V2ParameterId.self, forKey: .expectedValueParameterId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.expectedValueParameterId, forKey: .expectedValueParameterId)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case expectedValueParameterId
    }
}