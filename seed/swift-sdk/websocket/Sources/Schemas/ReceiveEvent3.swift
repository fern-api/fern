import Foundation

public struct ReceiveEvent3: Codable, Hashable, Sendable {
    public let receiveText3: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        receiveText3: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.receiveText3 = receiveText3
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.receiveText3 = try container.decode(String.self, forKey: .receiveText3)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.receiveText3, forKey: .receiveText3)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case receiveText3
    }
}