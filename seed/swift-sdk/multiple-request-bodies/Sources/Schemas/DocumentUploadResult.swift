import Foundation

public struct DocumentUploadResult: Codable, Hashable, Sendable {
    public let fileId: Nullable<String>?
    public let status: Nullable<String>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        fileId: Nullable<String>? = nil,
        status: Nullable<String>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.fileId = fileId
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.fileId = try container.decodeNullableIfPresent(String.self, forKey: .fileId)
        self.status = try container.decodeNullableIfPresent(String.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.fileId, forKey: .fileId)
        try container.encodeNullableIfPresent(self.status, forKey: .status)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case fileId
        case status
    }
}