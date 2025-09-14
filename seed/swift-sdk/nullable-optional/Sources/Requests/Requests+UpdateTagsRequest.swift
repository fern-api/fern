import Foundation

extension Requests {
    public struct UpdateTagsRequest: Codable, Hashable, Sendable {
        public let tags: Nullable<[String]>
        public let categories: [String]?
        public let labels: Nullable<[String]>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            tags: Nullable<[String]>,
            categories: [String]? = nil,
            labels: Nullable<[String]>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.tags = tags
            self.categories = categories
            self.labels = labels
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.tags = try container.decode(Nullable<[String]>.self, forKey: .tags)
            self.categories = try container.decodeIfPresent([String].self, forKey: .categories)
            self.labels = try container.decodeNullableIfPresent([String].self, forKey: .labels)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.tags, forKey: .tags)
            try container.encodeIfPresent(self.categories, forKey: .categories)
            try container.encodeNullableIfPresent(self.labels, forKey: .labels)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case tags
            case categories
            case labels
        }
    }
}