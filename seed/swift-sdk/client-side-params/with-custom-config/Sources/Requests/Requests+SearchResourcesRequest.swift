import Foundation

extension Requests {
    public struct SearchResourcesRequest: Codable, Hashable, Sendable {
        /// Search query text
        public let query: String?
        public let filters: [String: JSONValue]?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            query: String? = nil,
            filters: [String: JSONValue]? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.query = query
            self.filters = filters
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.query = try container.decodeIfPresent(String.self, forKey: .query)
            self.filters = try container.decodeIfPresent([String: JSONValue].self, forKey: .filters)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.query, forKey: .query)
            try container.encodeIfPresent(self.filters, forKey: .filters)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case query
            case filters
        }
    }
}