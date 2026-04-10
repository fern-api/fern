import Foundation

public struct NotFoundErrorBody: Codable, Hashable, Sendable {
    public let errorName: NotFoundErrorBodyErrorName?
    public let content: PlaylistIdNotFoundErrorBody?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        errorName: NotFoundErrorBodyErrorName? = nil,
        content: PlaylistIdNotFoundErrorBody? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.errorName = errorName
        self.content = content
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.errorName = try container.decodeIfPresent(NotFoundErrorBodyErrorName.self, forKey: .errorName)
        self.content = try container.decodeIfPresent(PlaylistIdNotFoundErrorBody.self, forKey: .content)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.errorName, forKey: .errorName)
        try container.encodeIfPresent(self.content, forKey: .content)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case errorName
        case content
    }
}