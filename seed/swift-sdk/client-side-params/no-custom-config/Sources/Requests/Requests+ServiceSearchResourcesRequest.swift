import Foundation

extension Requests {
    public struct ServiceSearchResourcesRequest: Codable, Hashable, Sendable {
        /// Search query text
        public let query: Nullable<String>?
        public let filters: Nullable<[String: JSONValue]>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            query: Nullable<String>? = nil,
            filters: Nullable<[String: JSONValue]>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.query = query
            self.filters = filters
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.query = try container.decodeNullableIfPresent(String.self, forKey: .query)
            self.filters = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .filters)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.query, forKey: .query)
            try container.encodeNullableIfPresent(self.filters, forKey: .filters)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case query
            case filters
        }
    }
}