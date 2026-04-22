import Foundation

extension Requests {
    public struct UploadDocumentRequest: Codable, Hashable, Sendable {
        public let author: String?
        public let tags: [String]?
        public let title: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            author: String? = nil,
            tags: [String]? = nil,
            title: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.author = author
            self.tags = tags
            self.title = title
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.author = try container.decodeIfPresent(String.self, forKey: .author)
            self.tags = try container.decodeIfPresent([String].self, forKey: .tags)
            self.title = try container.decodeIfPresent(String.self, forKey: .title)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.author, forKey: .author)
            try container.encodeIfPresent(self.tags, forKey: .tags)
            try container.encodeIfPresent(self.title, forKey: .title)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case author
            case tags
            case title
        }
    }
}