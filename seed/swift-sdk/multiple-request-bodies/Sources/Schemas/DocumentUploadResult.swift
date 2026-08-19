import Foundation

public struct DocumentUploadResult: Codable, Hashable, Sendable {
    public let fileId: String?
    public let status: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        fileId: String? = nil,
        status: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.fileId = fileId
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.fileId = try container.decodeIfPresent(String.self, forKey: .fileId)
        self.status = try container.decodeIfPresent(String.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.fileId, forKey: .fileId)
        try container.encodeIfPresent(self.status, forKey: .status)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case fileId
        case status
    }
}