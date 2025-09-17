import Foundation

extension Requests {
    public struct SearchRequest: Codable, Hashable, Sendable {
        public let query: String
        public let filters: [String: Nullable<String>]?
        public let includeTypes: Nullable<[String]>
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            query: String,
            filters: [String: Nullable<String>]? = nil,
            includeTypes: Nullable<[String]>,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.query = query
            self.filters = filters
            self.includeTypes = includeTypes
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.query = try container.decode(String.self, forKey: .query)
            self.filters = try container.decodeIfPresent([String: Nullable<String>].self, forKey: .filters)
            self.includeTypes = try container.decode(Nullable<[String]>.self, forKey: .includeTypes)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.query, forKey: .query)
            try container.encodeIfPresent(self.filters, forKey: .filters)
            try container.encode(self.includeTypes, forKey: .includeTypes)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case query
            case filters
            case includeTypes
        }
    }
}