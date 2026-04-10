import Foundation

public struct V2V3TestCaseImplementationDescription: Codable, Hashable, Sendable {
    public let boards: [V2V3TestCaseImplementationDescriptionBoard]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        boards: [V2V3TestCaseImplementationDescriptionBoard],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.boards = boards
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.boards = try container.decode([V2V3TestCaseImplementationDescriptionBoard].self, forKey: .boards)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.boards, forKey: .boards)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case boards
    }
}