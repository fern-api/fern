import Foundation

public struct BulkUpdateTasksResponse: Codable, Hashable, Sendable {
    public let updatedCount: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        updatedCount: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.updatedCount = updatedCount
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.updatedCount = try container.decodeIfPresent(Int.self, forKey: .updatedCount)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.updatedCount, forKey: .updatedCount)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case updatedCount = "updated_count"
    }
}