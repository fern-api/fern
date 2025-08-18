import Foundation

public struct UpdateProblemResponse: Codable, Hashable, Sendable {
    public let problemVersion: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        problemVersion: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.problemVersion = problemVersion
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemVersion = try container.decode(Int.self, forKey: .problemVersion)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemVersion, forKey: .problemVersion)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemVersion
    }
}