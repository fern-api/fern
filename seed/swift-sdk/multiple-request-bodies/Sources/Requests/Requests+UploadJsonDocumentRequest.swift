import Foundation

extension Requests {
    public struct UploadJsonDocumentRequest: Codable, Hashable, Sendable {
        public let author: Nullable<String>?
        public let tags: Nullable<[String]>?
        public let title: Nullable<String>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            author: Nullable<String>? = nil,
            tags: Nullable<[String]>? = nil,
            title: Nullable<String>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.author = author
            self.tags = tags
            self.title = title
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.author = try container.decodeNullableIfPresent(String.self, forKey: .author)
            self.tags = try container.decodeNullableIfPresent([String].self, forKey: .tags)
            self.title = try container.decodeNullableIfPresent(String.self, forKey: .title)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.author, forKey: .author)
            try container.encodeNullableIfPresent(self.tags, forKey: .tags)
            try container.encodeNullableIfPresent(self.title, forKey: .title)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case author
            case tags
            case title
        }
    }
}