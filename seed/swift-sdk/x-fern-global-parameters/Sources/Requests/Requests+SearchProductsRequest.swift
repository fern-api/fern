import Foundation

extension Requests {
    public struct SearchProductsRequest: Codable, Hashable, Sendable {
        public let query: String?
        public let config: SearchProductsRequestConfig?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            query: String? = nil,
            config: SearchProductsRequestConfig? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.query = query
            self.config = config
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.query = try container.decodeIfPresent(String.self, forKey: .query)
            self.config = try container.decodeIfPresent(SearchProductsRequestConfig.self, forKey: .config)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.query, forKey: .query)
            try container.encodeIfPresent(self.config, forKey: .config)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case query
            case config
        }
    }
}