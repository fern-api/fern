import Foundation

public struct GetTraceResponsesPageRequest: Codable, Hashable, Sendable {
    public let offset: Nullable<Int>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        offset: Nullable<Int>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.offset = offset
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.offset = try container.decodeNullableIfPresent(Int.self, forKey: .offset)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.offset, forKey: .offset)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case offset
    }
}