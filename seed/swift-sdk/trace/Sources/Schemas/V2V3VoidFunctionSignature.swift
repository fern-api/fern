import Foundation

public struct V2V3VoidFunctionSignature: Codable, Hashable, Sendable {
    public let parameters: [V2V3Parameter]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [V2V3Parameter],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([V2V3Parameter].self, forKey: .parameters)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
    }
}